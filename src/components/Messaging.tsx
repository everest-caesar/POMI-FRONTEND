import { useEffect, useState, useRef, useCallback } from 'react';
import axiosInstance from '../utils/axios';
import socketService from '../services/socketService';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  listingId?: string;
}

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  hasListing?: boolean;
  lastListingId?: string | null;
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

const formatPrice = (value?: number) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value);
};

export default function Messaging({ currentUserId, currentUserName }: MessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
  const [listingConversationId, setListingConversationId] = useState<string | null>(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const activeConversationIdRef = useRef<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const response = await axiosInstance.get('/messages');
      setConversations(response.data.data);
      setConversationsError('');
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      setConversationsError('Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const fetchListingDetails = useCallback(
    async (listingId: string, conversationId: string) => {
      try {
        setListingLoading(true);
        setListingError('');
        setListingConversationId(conversationId);
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
          setListingConversationId(null);
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
      const isActiveConversation =
        selectedConversation && data.senderId === selectedConversation.userId;

      // Add received message to current conversation if it's from the selected user
      if (isActiveConversation) {
        setMessages((prev) => [
          ...prev,
          {
            _id: Math.random().toString(),
            senderId: data.senderId,
            senderName: selectedConversation.userName,
            content: data.content,
            createdAt: data.timestamp || new Date().toISOString(),
            isRead: true,
          },
        ]);
      }

      let hasConversation = false;
      // Update conversation last message
      setConversations((prev) => {
        const exists = prev.some((conv) => conv.userId === data.senderId);
        hasConversation = exists;
        if (!exists) {
          return prev;
        }

        return prev.map((conv) =>
          conv.userId === data.senderId
            ? {
                ...conv,
                lastMessage: data.content,
                lastMessageTime: new Date().toISOString(),
                unreadCount: isActiveConversation ? 0 : conv.unreadCount + 1,
                hasListing: conv.hasListing || Boolean(data.listingId),
                lastListingId: data.listingId || conv.lastListingId,
              }
            : conv
        );
      });

      if (!hasConversation) {
        fetchConversations();
      }

      if (
        isActiveConversation &&
        data.listingId &&
        selectedConversation &&
        listingConversationId !== selectedConversation.userId
      ) {
        void fetchListingDetails(data.listingId, selectedConversation.userId);
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
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    };

    const handleUserOffline = (data: any) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    socketService.on('message:receive', handleMessageReceive);
    socketService.on('typing:start', handleTypingStart);
    socketService.on('typing:stop', handleTypingStop);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);

    // Fetch conversations on mount
    fetchConversations();

    return () => {
      socketService.off('message:receive', handleMessageReceive);
      socketService.off('typing:start', handleTypingStart);
      socketService.off('typing:stop', handleTypingStop);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedConversation, currentUserId, fetchConversations, fetchListingDetails, listingConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = useCallback(async (recipientId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/messages/${recipientId}`);
      setMessages(response.data.data);
      setError('');
      return response.data.data as Message[];
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
    setListingConversationId(null);
    setListingError('');
    setListingLoading(false);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedConversation) {
      return;
    }

    const trimmedMessage = messageInput.trim();
    const listingContextId = resolveListingIdForConversation();

    try {
      // FIX: Use Socket.io for real-time messaging (backend now handles database persistence)
      if (socketService.isConnected()) {
        // Socket.io connected - use real-time delivery with automatic database persistence
        socketService.sendMessage(
          selectedConversation.userId,
          trimmedMessage,
          listingContextId || undefined
        );
      } else {
        // Fallback to REST API if Socket.io is disconnected
        await axiosInstance.post('/messages', {
          recipientId: selectedConversation.userId,
          content: trimmedMessage,
          listingId: listingContextId || undefined,
        });
      }

      // Add message to UI immediately (optimistic update)
      setMessages((prev) => [
        ...prev,
        {
          _id: Math.random().toString(), // Temporary ID until server confirms
          senderId: currentUserId,
          senderName: currentUserName,
          content: trimmedMessage,
          createdAt: new Date().toISOString(),
          isRead: false,
          listingId: listingContextId || undefined,
        },
      ]);

      setMessageInput('');
      socketService.stopTyping(selectedConversation.userId);

      // Update conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.userId === selectedConversation.userId
            ? {
                ...conv,
                lastMessage: trimmedMessage,
                lastMessageTime: new Date().toISOString(),
                hasListing: conv.hasListing || Boolean(listingContextId),
                lastListingId: listingContextId || conv.lastListingId,
              }
            : conv
        )
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
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

  if (conversations.length === 0 && !loading && !conversationsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <span className="text-6xl mb-4">💬</span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-500">Start a conversation by messaging a seller or community member</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[600px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-500">Direct conversations</p>
          {conversationsError && (
            <p className="mt-2 text-xs text-red-600">{conversationsError}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
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
                    <div
                      className={`w-2 h-2 rounded-full ${
                        onlineUsers.has(conversation.userId)
                          ? 'bg-emerald-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {conversation.lastMessage}
                  </p>
                  {conversation.hasListing && (
                    <p className="text-[11px] font-semibold text-amber-600">
                      Listing inquiry
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conversation.lastMessageTime).toLocaleDateString()}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{selectedConversation.userName}</h3>
                <p className="text-xs text-gray-500">
                  {isUserOnline ? (
                    <span className="text-emerald-600">● Online</span>
                  ) : (
                    <span className="text-gray-400">● Offline</span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {listingConversationId === selectedConversation.userId && (
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
                          ? 'bg-red-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === currentUserId
                            ? 'text-white/70'
                            : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
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
                  placeholder="Type a message..."
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
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
