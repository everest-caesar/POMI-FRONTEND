import { useEffect, useState, useRef, useCallback } from 'react';
import axiosInstance from '../utils/axios';
import socketService from '../services/socketService';
import authService from '../services/authService';

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
}

interface MessagingProps {
  currentUserId: string;
  currentUserName: string;
}

export default function Messaging({ currentUserId, currentUserName }: MessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize Socket.io connection
  useEffect(() => {
    socketService.connect(currentUserId);

    // Listen for incoming messages
    const handleMessageReceive = (data: any) => {
      // Add received message to current conversation if it's from the selected user
      if (selectedConversation && data.senderId === selectedConversation.userId) {
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

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.userId === data.senderId
            ? {
                ...conv,
                lastMessage: data.content,
                lastMessageTime: new Date().toISOString(),
                unreadCount: conv.unreadCount + 1,
              }
            : conv
        )
      );
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
    };
  }, [selectedConversation, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/messages');
      setConversations(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      setError('Failed to load conversations');
    }
  };

  const fetchMessages = useCallback(async (recipientId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/messages/${recipientId}`);
      setMessages(response.data.data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.userId);
    setMessageInput('');
    setIsTyping(false);

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

    try {
      // First save to database via REST API
      await axiosInstance.post('/messages', {
        recipientId: selectedConversation.userId,
        content: messageInput.trim(),
      });

      // Then send via Socket.io for real-time delivery
      socketService.sendMessage(
        selectedConversation.userId,
        messageInput.trim()
      );

      // Add message to UI immediately
      setMessages((prev) => [
        ...prev,
        {
          _id: Math.random().toString(),
          senderId: currentUserId,
          senderName: currentUserName,
          content: messageInput.trim(),
          createdAt: new Date().toISOString(),
          isRead: false,
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
                lastMessage: messageInput.trim(),
                lastMessageTime: new Date().toISOString(),
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

  if (conversations.length === 0 && !loading) {
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
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.userId}
              onClick={() => handleSelectConversation(conversation)}
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
