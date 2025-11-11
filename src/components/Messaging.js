import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback } from 'react';
import axiosInstance from '../utils/axios';
import socketService from '../services/socketService';
const formatPrice = (value) => {
    if (value === null || value === undefined)
        return '—';
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
    }).format(value);
};
export default function Messaging({ currentUserId, currentUserName }) {
    const [conversations, setConversations] = useState([]);
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
    const [listingConversationId, setListingConversationId] = useState(null);
    const [listingLoading, setListingLoading] = useState(false);
    const [listingError, setListingError] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef();
    const activeConversationIdRef = useRef(null);
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
            setListingConversationId(conversationId);
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
                setListingConversationId(null);
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
            const isActiveConversation = selectedConversation && data.senderId === selectedConversation.userId;
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
                return prev.map((conv) => conv.userId === data.senderId
                    ? {
                        ...conv,
                        lastMessage: data.content,
                        lastMessageTime: new Date().toISOString(),
                        unreadCount: isActiveConversation ? 0 : conv.unreadCount + 1,
                        hasListing: conv.hasListing || Boolean(data.listingId),
                        lastListingId: data.listingId || conv.lastListingId,
                    }
                    : conv);
            });
            if (!hasConversation) {
                fetchConversations();
            }
            if (isActiveConversation &&
                data.listingId &&
                selectedConversation &&
                listingConversationId !== selectedConversation.userId) {
                void fetchListingDetails(data.listingId, selectedConversation.userId);
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
            setOnlineUsers((prev) => new Set([...prev, data.userId]));
        };
        const handleUserOffline = (data) => {
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
    const fetchMessages = useCallback(async (recipientId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/messages/${recipientId}`);
            setMessages(response.data.data);
            setError('');
            return response.data.data;
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
        setListingConversationId(null);
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
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) {
            return;
        }
        const trimmedMessage = messageInput.trim();
        const listingContextId = resolveListingIdForConversation();
        try {
            // First save to database via REST API
            await axiosInstance.post('/messages', {
                recipientId: selectedConversation.userId,
                content: trimmedMessage,
                listingId: listingContextId || undefined,
            });
            // Then send via Socket.io for real-time delivery
            socketService.sendMessage(selectedConversation.userId, trimmedMessage, listingContextId || undefined);
            // Add message to UI immediately
            setMessages((prev) => [
                ...prev,
                {
                    _id: Math.random().toString(),
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
            setConversations((prev) => prev.map((conv) => conv.userId === selectedConversation.userId
                ? {
                    ...conv,
                    lastMessage: trimmedMessage,
                    lastMessageTime: new Date().toISOString(),
                    hasListing: conv.hasListing || Boolean(listingContextId),
                    lastListingId: listingContextId || conv.lastListingId,
                }
                : conv));
        }
        catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
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
    return (_jsxs("div", { className: "flex gap-6 h-[600px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden", children: [_jsxs("div", { className: "w-80 border-r border-gray-100 flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-gray-100", children: [_jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Messages" }), _jsx("p", { className: "text-xs text-gray-500", children: "Direct conversations" }), conversationsError && (_jsx("p", { className: "mt-2 text-xs text-red-600", children: conversationsError }))] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: conversations.map((conversation) => (_jsx("button", { onClick: () => void handleSelectConversation(conversation), className: `w-full p-4 border-b border-gray-50 text-left transition ${selectedConversation?.userId === conversation.userId
                                ? 'bg-red-50 border-l-4 border-l-red-500'
                                : 'hover:bg-gray-50'}`, children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-semibold text-gray-900 truncate", children: conversation.userName }), _jsx("div", { className: `w-2 h-2 rounded-full ${onlineUsers.has(conversation.userId)
                                                            ? 'bg-emerald-500'
                                                            : 'bg-gray-300'}` })] }), _jsx("p", { className: "text-xs text-gray-500 line-clamp-1", children: conversation.lastMessage }), conversation.hasListing && (_jsx("p", { className: "text-[11px] font-semibold text-amber-600", children: "Listing inquiry" })), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: new Date(conversation.lastMessageTime).toLocaleDateString() })] }), conversation.unreadCount > 0 && (_jsx("span", { className: "inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold", children: conversation.unreadCount }))] }) }, conversation.userId))) })] }), _jsx("div", { className: "flex-1 flex flex-col", children: selectedConversation ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-4 border-b border-gray-100 flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-900", children: selectedConversation.userName }), _jsx("p", { className: "text-xs text-gray-500", children: isUserOnline ? (_jsx("span", { className: "text-emerald-600", children: "\u25CF Online" })) : (_jsx("span", { className: "text-gray-400", children: "\u25CF Offline" })) })] }) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50", children: [listingConversationId === selectedConversation.userId && (_jsx(_Fragment, { children: listingLoading ? (_jsx("div", { className: "rounded-2xl border border-white/60 bg-white p-4 text-sm text-gray-500 shadow", children: "Loading listing details..." })) : listingError ? (_jsx("div", { className: "rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600 shadow", children: listingError })) : activeListing ? (_jsxs("div", { className: "flex items-center gap-4 rounded-2xl border border-white/80 bg-white p-4 shadow", children: [activeListing.images?.length ? (_jsx("img", { src: activeListing.images[0], alt: activeListing.title, className: "h-16 w-16 rounded-xl object-cover" })) : (_jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-2xl", children: "\uD83D\uDECD\uFE0F" })), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: activeListing.title }), _jsx("p", { className: "text-xs text-gray-500", children: activeListing.location || 'Location TBD' }), _jsx("p", { className: "text-sm font-bold text-gray-900", children: formatPrice(activeListing.price) }), activeListing.status && (_jsxs("p", { className: "text-xs text-gray-500 capitalize", children: ["Status: ", activeListing.status.toLowerCase()] }))] })] })) : null })), loading ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("span", { className: "text-gray-400", children: "Loading messages..." }) })) : messages.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full text-center", children: _jsx("span", { className: "text-gray-400", children: "No messages yet. Start the conversation!" }) })) : (messages.map((message) => (_jsx("div", { className: `flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-xs px-4 py-2 rounded-2xl ${message.senderId === currentUserId
                                            ? 'bg-red-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-900'}`, children: [_jsx("p", { className: "text-sm break-words", children: message.content }), _jsx("p", { className: `text-xs mt-1 ${message.senderId === currentUserId
                                                    ? 'text-white/70'
                                                    : 'text-gray-400'}`, children: new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                }) })] }) }, message._id)))), isTyping && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs text-gray-500", children: [selectedConversation.userName, " is typing"] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }), _jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] })] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("form", { onSubmit: handleSendMessage, className: "p-4 border-t border-gray-100", children: [error && (_jsx("div", { className: "mb-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg", children: error })), _jsxs("div", { className: "flex gap-3", children: [_jsx("textarea", { value: messageInput, onChange: handleTyping, placeholder: "Type a message...", className: "flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none", rows: 3 }), _jsx("button", { type: "submit", disabled: !messageInput.trim(), className: "self-end rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 font-semibold transition", children: "Send \uD83D\uDE80" })] })] })] })) : (_jsx("div", { className: "flex-1 flex items-center justify-center text-center", children: _jsxs("div", { children: [_jsx("span", { className: "text-5xl mb-4 block", children: "\uD83D\uDC4B" }), _jsx("p", { className: "text-gray-500", children: "Select a conversation to start messaging" })] }) })) })] }));
}
//# sourceMappingURL=Messaging.js.map