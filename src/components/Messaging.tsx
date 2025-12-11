import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axiosInstance from '../utils/axios';
import socketService from '../services/socketService';
import { generateClientMessageId } from '../utils/messageHelpers';

type MessageStatus = 'sending' | 'sent';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  listingId?: string;
  clientMessageId?: string | null;
  status?: MessageStatus;
}

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  hasListing?: boolean;
  lastListingId?: string | null;
  isAdminConversation?: boolean;
}

interface AdminMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  createdAt: string;
  isAdminMessage: boolean;
  isRead: boolean;
}

interface ListingSummary {
  _id: string;
  title: string;
  price?: number;
  location?: string;
  status?: string;
  images?: string[];
}

interface MessagingProps {
  currentUserId: string;
  currentUserName: string;
}

const normalizeMessages = (items: Message[]): Message[] =>
  items.map((item) => ({
    ...item,
    status: 'sent' as const,
  }));

const formatPrice = (value?: number) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value);
};

const formatRelativeTime = (value?: string | Date | null) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Messaging({ currentUserId, currentUserName }: MessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationQuery, setConversationQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState('');
  const [activeListing, setActiveListing] = useState<ListingSummary | null>(null);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [listingContext, setListingContext] = useState<{
    conversationId: string;
    listingId: string;
  } | null>(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const activeConversationIdRef = useRef<string | null>(null);
  // Create admin conversation entry from admin messages
  const adminConversation: Conversation | null = useMemo(() => {
    if (adminMessages.length === 0) return null;
    const sortedMessages = [...adminMessages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latestMessage = sortedMessages[0];
    return {
      userId: 'admin-team',
      userName: 'Admin Team',
      lastMessage: latestMessage?.content || 'Welcome to Pomi!',
      lastMessageTime: latestMessage?.createdAt || new Date().toISOString(),
      unreadCount: adminUnreadCount,
      hasListing: false,
      lastListingId: null,
      isAdminConversation: true,
    };
  }, [adminMessages, adminUnreadCount]);

  const filteredConversations = useMemo(() => {
    const query = conversationQuery.trim().toLowerCase();

    // Start with admin conversation if it exists
    let allConversations = adminConversation ? [adminConversation, ...conversations] : conversations;

    if (!query) {
      return allConversations;
    }

    return allConversations.filter((conversation) => {
      const haystackName = conversation.userName?.toLowerCase() || '';
      const haystackMessage = conversation.lastMessage?.toLowerCase() || '';
      return (
        haystackName.includes(query) ||
        haystackMessage.includes(query)
      );
    });
  }, [conversationQuery, conversations, adminConversation]);

  const fetchAdminMessages = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/messages/admin/inbox');
      const messages: AdminMessage[] = response.data.data || [];
      setAdminMessages(messages);
      const unread = messages.filter((msg) => !msg.isRead && msg.isAdminMessage).length;
      setAdminUnreadCount(unread);
    } catch (err: any) {
      console.error('Failed to fetch admin messages:', err);
      // Don't show error for admin messages, just set empty
      setAdminMessages([]);
      setAdminUnreadCount(0);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const [conversationsResponse] = await Promise.all([
        axiosInstance.get('/messages'),
        fetchAdminMessages(),
      ]);
      setConversations(conversationsResponse.data.data);
      setConversationsError('');
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      setConversationsError('Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, [fetchAdminMessages]);

  const fetchListingDetails = useCallback(
    async (listingId: string, conversationId: string) => {
      try {
        setListingLoading(true);
        setListingError('');
        setListingContext({ conversationId, listingId });
        const response = await axiosInstance.get(`/marketplace/listings/${listingId}`);
        if (activeConversationIdRef.current !== conversationId) {
          return;
        }
        setActiveListing(response.data.data);
      } catch (err: any) {
        console.error('Failed to fetch listing details:', err);
        if (activeConversationIdRef.current === conversationId) {
          setListingError('Unable to load listing details right now');
          setActiveListing(null);
          setListingContext(null);
        }
      } finally {
        if (activeConversationIdRef.current === conversationId) {
          setListingLoading(false);
        }
      }
    },
    [],
  );

  // Initialize Socket.io connection
  useEffect(() => {
    socketService.connect(currentUserId);

    // Listen for incoming messages
    const handleMessageReceive = (data: any) => {
      const senderId = data?.senderId;
      const timestamp = data?.timestamp || new Date().toISOString();
      const isActiveConversation =
        Boolean(selectedConversation) && senderId === selectedConversation?.userId;

      if (isActiveConversation && senderId && selectedConversation) {
        const userName = selectedConversation.userName;
        setMessages((prev) => {
          const messageId = (data?._id || data?.id || generateClientMessageId()).toString();
          const clientMessageIdValue = data?.clientMessageId || null;
          const alreadyExists = prev.some(
            (msg) =>
              msg._id === messageId ||
              (!!clientMessageIdValue && msg.clientMessageId === clientMessageIdValue)
          );
          if (alreadyExists) {
            return prev;
          }

          return [
            ...prev,
            {
              _id: messageId,
              clientMessageId: clientMessageIdValue,
              senderId,
              senderName: userName,
              content: data?.content ?? '',
              createdAt: timestamp,
              isRead: true,
              listingId: data?.listingId,
              status: 'sent',
            },
          ];
        });
      }

      let hasConversation = false;
      setConversations((prev) => {
        const exists = prev.some((conv) => conv.userId === senderId);
        hasConversation = exists;
        if (!exists || !senderId) {
          return prev;
        }

        return prev.map((conv) =>
          conv.userId === senderId
            ? {
                ...conv,
                lastMessage: data?.content ?? '',
                lastMessageTime: timestamp,
                unreadCount: isActiveConversation ? 0 : conv.unreadCount + 1,
                hasListing: conv.hasListing || Boolean(data?.listingId),
                lastListingId: data?.listingId || conv.lastListingId,
              }
            : conv
        );
      });

      if (!hasConversation) {
        fetchConversations();
      }

      if (isActiveConversation && data?.listingId && selectedConversation) {
        const shouldFetchListing =
          !listingContext ||
          listingContext.conversationId !== selectedConversation.userId ||
          listingContext.listingId !== data.listingId;
        if (shouldFetchListing) {
          void fetchListingDetails(data.listingId, selectedConversation.userId);
        }
      }
    };

    const handleTypingStart = (data: any) => {
      if (selectedConversation && data.userId === selectedConversation.userId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data: any) => {
      if (selectedConversation && data.userId === selectedConversation.userId) {
        setIsTyping(false);
      }
    };

    const handleUserOnline = (data: any) => {
      if (!data?.userId) return;
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    };

    const handleUserOffline = (data: any) => {
      if (!data?.userId) return;
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    const handleUserPresence = (data: any) => {
      if (!data || !Array.isArray(data.userIds)) {
        return;
      }
      setOnlineUsers(new Set(data.userIds));
    };

    const handleMessageSent = (data: any) => {
      if (!data?.clientMessageId) {
        return;
      }

      if (!selectedConversation || data.recipientId !== selectedConversation.userId) {
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.clientMessageId === data.clientMessageId
            ? {
                ...msg,
                _id: (data?._id || msg._id)?.toString(),
                createdAt: data?.timestamp || msg.createdAt,
                status: 'sent',
              }
            : msg
        )
      );
    };

    socketService.on('message:receive', handleMessageReceive);
    socketService.on('message:sent', handleMessageSent);
    socketService.on('typing:start', handleTypingStart);
    socketService.on('typing:stop', handleTypingStop);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);
    socketService.on('user:presence', handleUserPresence);

    // Fetch conversations on mount
    fetchConversations();

    return () => {
      socketService.off('message:receive', handleMessageReceive);
      socketService.off('message:sent', handleMessageSent);
      socketService.off('typing:start', handleTypingStart);
      socketService.off('typing:stop', handleTypingStop);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      socketService.off('user:presence', handleUserPresence);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [
    selectedConversation,
    currentUserId,
    fetchConversations,
    fetchListingDetails,
    listingContext?.conversationId,
    listingContext?.listingId,
  ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = useCallback(async (recipientId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/messages/${recipientId}`);
      const normalized = normalizeMessages(response.data.data as Message[]);
      setMessages(normalized);
      setError('');
      return normalized;
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveListingIdForConversation = useCallback(() => {
    if (!selectedConversation) return null;
    const messageWithListing = messages.find((msg) => Boolean(msg.listingId));
    return messageWithListing?.listingId || selectedConversation.lastListingId || null;
  }, [messages, selectedConversation]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    activeConversationIdRef.current = conversation.userId;
    setMessageInput('');
    setIsTyping(false);
    setActiveListing(null);
    setListingContext(null);
    setListingError('');
    setListingLoading(false);

    // Handle admin conversation differently
    if (conversation.isAdminConversation) {
      // Convert admin messages to regular message format
      const adminMsgs: Message[] = adminMessages.map((msg) => ({
        _id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        content: msg.content,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
        status: 'sent' as const,
      }));
      // Sort chronologically (oldest first)
      adminMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(adminMsgs);
      setAdminUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetched = await fetchMessages(conversation.userId);
    const nextListingId =
      fetched?.find((msg) => Boolean(msg.listingId))?.listingId ||
      conversation.lastListingId ||
      null;

    if (nextListingId) {
      void fetchListingDetails(nextListingId, conversation.userId);
    }

    // Reset unread count
    setConversations((prev) =>
      prev.map((conv) =>
        conv.userId === conversation.userId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const handleConversationRefresh = () => {
    void fetchConversations();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedConversation) {
      return;
    }

    const trimmedMessage = messageInput.trim();
    setError('');
    const clientMessageId = generateClientMessageId();
    const optimisticTimestamp = new Date().toISOString();

    // Handle admin conversation differently
    if (selectedConversation.isAdminConversation) {
      const optimisticMessage: Message = {
        _id: clientMessageId,
        clientMessageId,
        senderId: currentUserId,
        senderName: currentUserName,
        content: trimmedMessage,
        createdAt: optimisticTimestamp,
        isRead: true,
        status: 'sending',
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const response = await axiosInstance.post('/messages/admin/reply', {
          content: trimmedMessage,
        });

        const persisted = response.data?.data;
        if (persisted?._id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.clientMessageId === clientMessageId
                ? {
                    ...msg,
                    _id: persisted._id,
                    createdAt: persisted.createdAt,
                    status: 'sent',
                  }
                : msg
            )
          );
        }

        setMessageInput('');

        // Refresh admin messages
        void fetchAdminMessages();
      } catch (err: any) {
        console.error('Failed to send message to admin:', err);
        setError('Failed to send message to admin team');
        setMessages((prev) => prev.filter((msg) => msg.clientMessageId !== clientMessageId));
      }
      return;
    }

    // Regular user-to-user messaging
    const listingContextId = resolveListingIdForConversation();
    const optimisticMessage: Message = {
      _id: clientMessageId,
      clientMessageId,
      senderId: currentUserId,
      senderName: currentUserName,
      content: trimmedMessage,
      createdAt: optimisticTimestamp,
      isRead: true,
      listingId: listingContextId || undefined,
      status: socketService.isConnected() ? 'sending' : 'sent',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // FIX: Use Socket.io for real-time messaging (backend now handles database persistence)
      if (socketService.isConnected()) {
        // Socket.io connected - use real-time delivery with automatic database persistence
        socketService.sendMessage(
          selectedConversation.userId,
          trimmedMessage,
          listingContextId || undefined,
          clientMessageId
        );
      } else {
        // Fallback to REST API if Socket.io is disconnected
        const response = await axiosInstance.post('/messages', {
          recipientId: selectedConversation.userId,
          content: trimmedMessage,
          listingId: listingContextId || undefined,
          clientMessageId,
        });

        const persisted = response.data?.data as Message;
        if (persisted?._id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.clientMessageId === clientMessageId
                ? {
                    ...msg,
                    _id: persisted._id,
                    createdAt: persisted.createdAt,
                    isRead: persisted.isRead,
                    status: 'sent',
                  }
                : msg
            )
          );
        }
      }

      setMessageInput('');

      // Update conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.userId === selectedConversation.userId
            ? {
                ...conv,
                lastMessage: trimmedMessage,
                lastMessageTime: optimisticTimestamp,
                hasListing: conv.hasListing || Boolean(listingContextId),
                lastListingId: listingContextId || conv.lastListingId,
              }
            : conv
        )
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg.clientMessageId !== clientMessageId));
    } finally {
      if (selectedConversation) {
        socketService.stopTyping(selectedConversation.userId);
      }
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    if (!selectedConversation) return;

    // Send typing indicator
    socketService.startTyping(selectedConversation.userId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing stop after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(selectedConversation.userId);
    }, 3000);
  };

  const isUserOnline = selectedConversation
    ? onlineUsers.has(selectedConversation.userId)
    : false;

  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <span className="text-gray-400 text-sm">Loading conversations...</span>
      </div>
    );
  }

  if (conversationsError && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <span className="text-sm text-rose-500">{conversationsError}</span>
      </div>
    );
  }

  if (conversations.length === 0 && adminMessages.length === 0 && !loading && !conversationsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <span className="text-6xl mb-4">💬</span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-500">Start a conversation by messaging a seller or community member</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[520px] lg:h-[600px] bg-white rounded-3xl border border-gray-100 shadow-xl">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            <p className="text-xs text-gray-500">Direct conversations</p>
            {conversationsError && (
              <p className="mt-2 text-xs text-red-600">{conversationsError}</p>
            )}
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.3em] text-gray-400">
              Search inbox
            </label>
            <div className="mt-1 relative">
              <input
                value={conversationQuery}
                onChange={(event) => setConversationQuery(event.target.value)}
                placeholder="Find a neighbour or listing"
                className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 selection:bg-rose-100 selection:text-gray-900"
              />
              {conversationQuery && (
                <button
                  type="button"
                  onClick={() => setConversationQuery('')}
                  className="absolute inset-y-0 right-0 px-3 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredConversations.length} of {conversations.length} chats
            </span>
            <button
              type="button"
              onClick={handleConversationRefresh}
              className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.userId}
              onClick={() => void handleSelectConversation(conversation)}
              className={`w-full p-4 border-b border-gray-50 text-left transition ${
                selectedConversation?.userId === conversation.userId
                  ? 'bg-red-50 border-l-4 border-l-red-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {conversation.userName}
                    </p>
                    {conversation.isAdminConversation ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        ADMIN
                      </span>
                    ) : (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          onlineUsers.has(conversation.userId)
                            ? 'bg-emerald-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {conversation.lastMessage}
                  </p>
                  {conversation.isAdminConversation && (
                    <p className="text-[11px] font-semibold text-emerald-600">
                      Support & announcements
                    </p>
                  )}
                  {conversation.hasListing && !conversation.isAdminConversation && (
                    <p className="text-[11px] font-semibold text-amber-600">
                      Listing inquiry
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {formatRelativeTime(conversation.lastMessageTime)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                      {conversation.unreadCount}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {conversation.lastMessageTime
                      ? new Date(conversation.lastMessageTime).toLocaleDateString()
                      : ''}
                  </span>
                </div>
              </div>
            </button>
          ))}
          {!filteredConversations.length && (
            <div className="p-6 text-center text-sm text-gray-400">
              {conversationQuery.trim()
                ? `No conversations match “${conversationQuery.trim()}”.`
                : 'Start a chat by messaging a listing or community member.'}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.userName}
                  </h3>
                  {selectedConversation.isAdminConversation ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      ADMIN TEAM
                    </span>
                  ) : (
                    <span
                      className={`text-xs font-semibold ${
                        isUserOnline ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      ● {isUserOnline ? 'Online now' : 'Offline'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {selectedConversation.isAdminConversation
                    ? 'Support & community announcements'
                    : `Last active ${formatRelativeTime(selectedConversation.lastMessageTime)}`}
                </p>
              </div>
              <div className="text-right">
                {selectedConversation.isAdminConversation && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    🛡️ Official support
                  </span>
                )}
                {selectedConversation.hasListing && !selectedConversation.isAdminConversation && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    🛍️ Listing chat
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {listingContext?.conversationId === selectedConversation.userId && (
                <>
                  {listingLoading ? (
                    <div className="rounded-2xl border border-white/60 bg-white p-4 text-sm text-gray-500 shadow">
                      Loading listing details...
                    </div>
                  ) : listingError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600 shadow">
                      {listingError}
                    </div>
                  ) : activeListing ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white p-4 shadow">
                      {activeListing.images?.length ? (
                        <img
                          src={activeListing.images[0]}
                          alt={activeListing.title}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                          🛍️
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {activeListing.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activeListing.location || 'Location TBD'}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(activeListing.price)}
                        </p>
                        {activeListing.status && (
                          <p className="text-xs text-gray-500 capitalize">
                            Status: {activeListing.status.toLowerCase()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <span className="text-gray-400">No messages yet. Start the conversation!</span>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.senderId === currentUserId
                          ? 'bg-rose-50 border border-rose-100 text-gray-900 shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === currentUserId
                            ? 'text-gray-500'
                            : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {message.senderId === currentUserId && message.status === 'sending' && (
                        <p className="text-[11px] font-semibold text-amber-600 text-right mt-0.5">
                          Sending...
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isTyping && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {selectedConversation.userName} is typing
                  </span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
              {error && (
                <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <textarea
                  value={messageInput}
                  onChange={handleTyping}
                  placeholder={
                    selectedConversation?.isAdminConversation
                      ? "Send a message to the admin team..."
                      : "Type a message..."
                  }
                  className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none selection:bg-red-100 selection:text-gray-900"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="self-end rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 font-semibold transition"
                >
                  Send 🚀
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Heads-up: recipients also get a short email alert so they never miss your note.
              </p>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <span className="text-5xl mb-4 block">👋</span>
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
