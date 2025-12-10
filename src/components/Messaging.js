import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axiosInstance from '../utils/axios';
import socketService from '../services/socketService';
import { generateClientMessageId } from '../utils/messageHelpers';
const normalizeMessages = (items) => items.map((item) => ({
    ...item,
    status: 'sent',
}));
const formatPrice = (value) => {
    if (value === null || value === undefined)
        return '—';
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
    }).format(value);
};
const formatRelativeTime = (value) => {
    if (!value)
        return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (!date || Number.isNaN(date.getTime())) {
        return '';
    }
    const diff = Date.now() - date.getTime();
    if (diff < 60000)
        return 'just now';
    if (diff < 3600000)
        return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)
        return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
export default function Messaging({ currentUserId, currentUserName }) {
    const [conversations, setConversations] = useState([]);
    const [conversationQuery, setConversationQuery] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [conversationsError, setConversationsError] = useState('');
    const [activeListing, setActiveListing] = useState(null);
    const [listingContext, setListingContext] = useState(null);
    const [listingLoading, setListingLoading] = useState(false);
    const [listingError, setListingError] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef();
    const activeConversationIdRef = useRef(null);
    const filteredConversations = useMemo(() => {
        const query = conversationQuery.trim().toLowerCase();
        if (!query) {
            return conversations;
        }
        return conversations.filter((conversation) => {
            const haystackName = conversation.userName?.toLowerCase() || '';
            const haystackMessage = conversation.lastMessage?.toLowerCase() || '';
            return (haystackName.includes(query) ||
                haystackMessage.includes(query));
        });
    }, [conversationQuery, conversations]);
    const fetchConversations = useCallback(async () => {
        try {
            setConversationsLoading(true);
            const response = await axiosInstance.get('/messages');
            setConversations(response.data.data);
            setConversationsError('');
        }
        catch (err) {
            console.error('Failed to fetch conversations:', err);
            setConversationsError('Failed to load conversations');
        }
        finally {
            setConversationsLoading(false);
        }
    }, []);
    const fetchListingDetails = useCallback(async (listingId, conversationId) => {
        try {
            setListingLoading(true);
            setListingError('');
            setListingContext({ conversationId, listingId });
            const response = await axiosInstance.get(`/marketplace/listings/${listingId}`);
            if (activeConversationIdRef.current !== conversationId) {
                return;
            }
            setActiveListing(response.data.data);
        }
        catch (err) {
            console.error('Failed to fetch listing details:', err);
            if (activeConversationIdRef.current === conversationId) {
                setListingError('Unable to load listing details right now');
                setActiveListing(null);
                setListingContext(null);
            }
        }
        finally {
            if (activeConversationIdRef.current === conversationId) {
                setListingLoading(false);
            }
        }
    }, []);
    // Initialize Socket.io connection
    useEffect(() => {
        socketService.connect(currentUserId);
        // Listen for incoming messages
        const handleMessageReceive = (data) => {
            const senderId = data?.senderId;
            const timestamp = data?.timestamp || new Date().toISOString();
            const isActiveConversation = Boolean(selectedConversation) && senderId === selectedConversation?.userId;
            if (isActiveConversation && senderId && selectedConversation) {
                const userName = selectedConversation.userName;
                setMessages((prev) => {
                    const messageId = (data?._id || data?.id || generateClientMessageId()).toString();
                    const clientMessageIdValue = data?.clientMessageId || null;
                    const alreadyExists = prev.some((msg) => msg._id === messageId ||
                        (!!clientMessageIdValue && msg.clientMessageId === clientMessageIdValue));
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
                return prev.map((conv) => conv.userId === senderId
                    ? {
                        ...conv,
                        lastMessage: data?.content ?? '',
                        lastMessageTime: timestamp,
                        unreadCount: isActiveConversation ? 0 : conv.unreadCount + 1,
                        hasListing: conv.hasListing || Boolean(data?.listingId),
                        lastListingId: data?.listingId || conv.lastListingId,
                    }
                    : conv);
            });
            if (!hasConversation) {
                fetchConversations();
            }
            if (isActiveConversation && data?.listingId && selectedConversation) {
                const shouldFetchListing = !listingContext ||
                    listingContext.conversationId !== selectedConversation.userId ||
                    listingContext.listingId !== data.listingId;
                if (shouldFetchListing) {
                    void fetchListingDetails(data.listingId, selectedConversation.userId);
                }
            }
        };
        const handleTypingStart = (data) => {
            if (selectedConversation && data.userId === selectedConversation.userId) {
                setIsTyping(true);
            }
        };
        const handleTypingStop = (data) => {
            if (selectedConversation && data.userId === selectedConversation.userId) {
                setIsTyping(false);
            }
        };
        const handleUserOnline = (data) => {
            if (!data?.userId)
                return;
            setOnlineUsers((prev) => new Set([...prev, data.userId]));
        };
        const handleUserOffline = (data) => {
            if (!data?.userId)
                return;
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        };
        const handleUserPresence = (data) => {
            if (!data || !Array.isArray(data.userIds)) {
                return;
            }
            setOnlineUsers(new Set(data.userIds));
        };
        const handleMessageSent = (data) => {
            if (!data?.clientMessageId) {
                return;
            }
            if (!selectedConversation || data.recipientId !== selectedConversation.userId) {
                return;
            }
            setMessages((prev) => prev.map((msg) => msg.clientMessageId === data.clientMessageId
                ? {
                    ...msg,
                    _id: (data?._id || msg._id)?.toString(),
                    createdAt: data?.timestamp || msg.createdAt,
                    status: 'sent',
                }
                : msg));
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
    const fetchMessages = useCallback(async (recipientId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/messages/${recipientId}`);
            const normalized = normalizeMessages(response.data.data);
            setMessages(normalized);
            setError('');
            return normalized;
        }
        catch (err) {
            console.error('Failed to fetch messages:', err);
            setError('Failed to load messages');
            return null;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const resolveListingIdForConversation = useCallback(() => {
        if (!selectedConversation)
            return null;
        const messageWithListing = messages.find((msg) => Boolean(msg.listingId));
        return messageWithListing?.listingId || selectedConversation.lastListingId || null;
    }, [messages, selectedConversation]);
    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        activeConversationIdRef.current = conversation.userId;
        setMessageInput('');
        setIsTyping(false);
        setActiveListing(null);
        setListingContext(null);
        setListingError('');
        setListingLoading(false);
        const fetched = await fetchMessages(conversation.userId);
        const nextListingId = fetched?.find((msg) => Boolean(msg.listingId))?.listingId ||
            conversation.lastListingId ||
            null;
        if (nextListingId) {
            void fetchListingDetails(nextListingId, conversation.userId);
        }
        // Reset unread count
        setConversations((prev) => prev.map((conv) => conv.userId === conversation.userId ? { ...conv, unreadCount: 0 } : conv));
    };
    const handleConversationRefresh = () => {
        void fetchConversations();
    };
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) {
            return;
        }
        const trimmedMessage = messageInput.trim();
        setError('');
        const listingContextId = resolveListingIdForConversation();
        const clientMessageId = generateClientMessageId();
        const optimisticTimestamp = new Date().toISOString();
        const optimisticMessage = {
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
                socketService.sendMessage(selectedConversation.userId, trimmedMessage, listingContextId || undefined, clientMessageId);
            }
            else {
                // Fallback to REST API if Socket.io is disconnected
                const response = await axiosInstance.post('/messages', {
                    recipientId: selectedConversation.userId,
                    content: trimmedMessage,
                    listingId: listingContextId || undefined,
                    clientMessageId,
                });
                const persisted = response.data?.data;
                if (persisted?._id) {
                    setMessages((prev) => prev.map((msg) => msg.clientMessageId === clientMessageId
                        ? {
                            ...msg,
                            _id: persisted._id,
                            createdAt: persisted.createdAt,
                            isRead: persisted.isRead,
                            status: 'sent',
                        }
                        : msg));
                }
            }
            setMessageInput('');
            // Update conversation
            setConversations((prev) => prev.map((conv) => conv.userId === selectedConversation.userId
                ? {
                    ...conv,
                    lastMessage: trimmedMessage,
                    lastMessageTime: optimisticTimestamp,
                    hasListing: conv.hasListing || Boolean(listingContextId),
                    lastListingId: listingContextId || conv.lastListingId,
                }
                : conv));
        }
        catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
            setMessages((prev) => prev.filter((msg) => msg.clientMessageId !== clientMessageId));
        }
        finally {
            if (selectedConversation) {
                socketService.stopTyping(selectedConversation.userId);
            }
        }
    };
    const handleTyping = (e) => {
        const value = e.target.value;
        setMessageInput(value);
        if (!selectedConversation)
            return;
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
        return (_jsx("div", { className: "flex flex-col items-center justify-center h-96 text-center", children: _jsx("span", { className: "text-gray-400 text-sm", children: "Loading conversations..." }) }));
    }
    if (conversationsError && conversations.length === 0) {
        return (_jsx("div", { className: "flex flex-col items-center justify-center h-96 text-center", children: _jsx("span", { className: "text-sm text-rose-500", children: conversationsError }) }));
    }
    if (conversations.length === 0 && !loading && !conversationsError) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center h-96 text-center", children: [_jsx("span", { className: "text-6xl mb-4", children: "\uD83D\uDCAC" }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: "No conversations yet" }), _jsx("p", { className: "text-gray-500", children: "Start a conversation by messaging a seller or community member" })] }));
    }
    return (_jsxs("div", { className: "flex gap-6 h-[520px] lg:h-[600px] bg-white rounded-3xl border border-gray-100 shadow-xl", children: [_jsxs("div", { className: "w-80 border-r border-gray-100 flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-gray-100 space-y-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Messages" }), _jsx("p", { className: "text-xs text-gray-500", children: "Direct conversations" }), conversationsError && (_jsx("p", { className: "mt-2 text-xs text-red-600", children: conversationsError }))] }), _jsxs("div", { children: [_jsx("label", { className: "text-[11px] uppercase tracking-[0.3em] text-gray-400", children: "Search inbox" }), _jsxs("div", { className: "mt-1 relative", children: [_jsx("input", { value: conversationQuery, onChange: (event) => setConversationQuery(event.target.value), placeholder: "Find a neighbour or listing", className: "w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100" }), conversationQuery && (_jsx("button", { type: "button", onClick: () => setConversationQuery(''), className: "absolute inset-y-0 right-0 px-3 text-xs text-gray-400 hover:text-gray-600", children: "Clear" }))] })] }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["Showing ", filteredConversations.length, " of ", conversations.length, " chats"] }), _jsx("button", { type: "button", onClick: handleConversationRefresh, className: "rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900", children: "Refresh" })] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto", children: [filteredConversations.map((conversation) => (_jsx("button", { onClick: () => void handleSelectConversation(conversation), className: `w-full p-4 border-b border-gray-50 text-left transition ${selectedConversation?.userId === conversation.userId
                                    ? 'bg-red-50 border-l-4 border-l-red-500'
                                    : 'hover:bg-gray-50'}`, children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-semibold text-gray-900 truncate", children: conversation.userName }), _jsx("div", { className: `w-2 h-2 rounded-full ${onlineUsers.has(conversation.userId)
                                                                ? 'bg-emerald-500'
                                                                : 'bg-gray-300'}` })] }), _jsx("p", { className: "text-xs text-gray-500 line-clamp-1", children: conversation.lastMessage }), conversation.hasListing && (_jsx("p", { className: "text-[11px] font-semibold text-amber-600", children: "Listing inquiry" })), _jsx("p", { className: "text-[11px] text-gray-400 mt-1", children: formatRelativeTime(conversation.lastMessageTime) })] }), _jsxs("div", { className: "flex flex-col items-end gap-1", children: [conversation.unreadCount > 0 && (_jsx("span", { className: "inline-flex items-center justify-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600", children: conversation.unreadCount })), _jsx("span", { className: "text-[10px] text-gray-400", children: conversation.lastMessageTime
                                                        ? new Date(conversation.lastMessageTime).toLocaleDateString()
                                                        : '' })] })] }) }, conversation.userId))), !filteredConversations.length && (_jsx("div", { className: "p-6 text-center text-sm text-gray-400", children: conversationQuery.trim()
                                    ? `No conversations match “${conversationQuery.trim()}”.`
                                    : 'Start a chat by messaging a listing or community member.' }))] })] }), _jsx("div", { className: "flex-1 flex flex-col", children: selectedConversation ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: selectedConversation.userName }), _jsxs("span", { className: `text-xs font-semibold ${isUserOnline ? 'text-emerald-600' : 'text-gray-400'}`, children: ["\u25CF ", isUserOnline ? 'Online now' : 'Offline'] })] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Last active ", formatRelativeTime(selectedConversation.lastMessageTime)] })] }), _jsx("div", { className: "text-right", children: selectedConversation.hasListing && (_jsx("span", { className: "inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700", children: "\uD83D\uDECD\uFE0F Listing chat" })) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50", children: [listingContext?.conversationId === selectedConversation.userId && (_jsx(_Fragment, { children: listingLoading ? (_jsx("div", { className: "rounded-2xl border border-white/60 bg-white p-4 text-sm text-gray-500 shadow", children: "Loading listing details..." })) : listingError ? (_jsx("div", { className: "rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600 shadow", children: listingError })) : activeListing ? (_jsxs("div", { className: "flex items-center gap-4 rounded-2xl border border-white/80 bg-white p-4 shadow", children: [activeListing.images?.length ? (_jsx("img", { src: activeListing.images[0], alt: activeListing.title, className: "h-16 w-16 rounded-xl object-cover" })) : (_jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-2xl", children: "\uD83D\uDECD\uFE0F" })), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: activeListing.title }), _jsx("p", { className: "text-xs text-gray-500", children: activeListing.location || 'Location TBD' }), _jsx("p", { className: "text-sm font-bold text-gray-900", children: formatPrice(activeListing.price) }), activeListing.status && (_jsxs("p", { className: "text-xs text-gray-500 capitalize", children: ["Status: ", activeListing.status.toLowerCase()] }))] })] })) : null })), loading ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("span", { className: "text-gray-400", children: "Loading messages..." }) })) : messages.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full text-center", children: _jsx("span", { className: "text-gray-400", children: "No messages yet. Start the conversation!" }) })) : (messages.map((message) => (_jsx("div", { className: `flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-xs px-4 py-2 rounded-2xl ${message.senderId === currentUserId
                                            ? 'bg-rose-50 border border-rose-100 text-gray-900 shadow-sm'
                                            : 'bg-white border border-gray-200 text-gray-900'}`, children: [_jsx("p", { className: "text-sm break-words", children: message.content }), _jsx("p", { className: `text-xs mt-1 ${message.senderId === currentUserId
                                                    ? 'text-gray-500'
                                                    : 'text-gray-400'}`, children: new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                }) }), message.senderId === currentUserId && message.status === 'sending' && (_jsx("p", { className: "text-[11px] font-semibold text-amber-600 text-right mt-0.5", children: "Sending..." }))] }) }, message._id)))), isTyping && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs text-gray-500", children: [selectedConversation.userName, " is typing"] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }), _jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] })] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("form", { onSubmit: handleSendMessage, className: "p-4 border-t border-gray-100", children: [error && (_jsx("div", { className: "mb-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg", children: error })), _jsxs("div", { className: "flex gap-3", children: [_jsx("textarea", { value: messageInput, onChange: handleTyping, placeholder: "Type a message...", className: "flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none", rows: 3 }), _jsx("button", { type: "submit", disabled: !messageInput.trim(), className: "self-end rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 font-semibold transition", children: "Send \uD83D\uDE80" })] }), _jsx("p", { className: "mt-2 text-xs text-gray-400", children: "Heads-up: recipients also get a short email alert so they never miss your note." })] })] })) : (_jsx("div", { className: "flex-1 flex items-center justify-center text-center", children: _jsxs("div", { children: [_jsx("span", { className: "text-5xl mb-4 block", children: "\uD83D\uDC4B" }), _jsx("p", { className: "text-gray-500", children: "Select a conversation to start messaging" })] }) })) })] }));
}
//# sourceMappingURL=Messaging.js.map