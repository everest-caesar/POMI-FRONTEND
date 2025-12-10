import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import authService from './authService';
const resolveSocketUrl = () => {
    const windowSocket = typeof window !== 'undefined' ? window.VITE_SOCKET_URL : undefined;
    const envSocketUrl = import.meta?.env?.VITE_SOCKET_URL || windowSocket;
    if (typeof envSocketUrl === 'string' && envSocketUrl.trim()) {
        return envSocketUrl.replace(/\/$/, '');
    }
    const normalized = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return normalized.replace(/\/$/, '');
};
const SOCKET_URL = resolveSocketUrl();
class SocketService {
    constructor() {
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Connect to Socket.io server
     */
    connect(userId) {
        if (!userId) {
            console.warn('Socket connection skipped: missing user ID');
            return;
        }
        if (this.socket?.connected && this.userId === userId) {
            return; // Already connected
        }
        const token = authService.getToken();
        if (!token) {
            console.warn('Socket connection skipped: missing auth token');
            return;
        }
        this.userId = userId;
        this.socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'],
        });
        // Authenticate socket with userId
        this.socket.on('connect', () => {
            console.log('📡 Socket connected:', this.socket?.id);
            if (this.userId) {
                this.socket?.emit('authenticate', { token });
            }
        });
        this.socket.on('auth:success', () => {
            console.log('✅ Socket authenticated');
        });
        this.socket.on('auth:error', (message) => {
            console.error('❌ Socket authentication failed:', message);
            this.disconnect();
        });
        // Handle incoming messages
        this.socket.on('message:receive', (data) => {
            this.emit('message:receive', data);
        });
        // Handle typing indicators
        this.socket.on('typing:start', (data) => {
            this.emit('typing:start', data);
        });
        this.socket.on('typing:stop', (data) => {
            this.emit('typing:stop', data);
        });
        // Delivery confirmation
        this.socket.on('message:sent', (data) => {
            this.emit('message:sent', data);
        });
        // Handle user online/offline status
        this.socket.on('user:online', (data) => {
            this.emit('user:online', data);
        });
        this.socket.on('user:offline', (data) => {
            this.emit('user:offline', data);
        });
        this.socket.on('user:presence', (data) => {
            this.emit('user:presence', data);
        });
        // Handle connection errors
        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.emit('error', error);
        });
        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            this.emit('disconnect', { reason });
        });
    }
    /**
     * Disconnect from Socket.io server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.userId = null;
        }
    }
    /**
     * Send a message via Socket.io
     */
    sendMessage(recipientId, content, listingId, clientMessageId) {
        if (!this.socket || !this.socket.connected) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('message:send', {
            recipientId,
            content,
            listingId,
            clientMessageId,
        });
    }
    /**
     * Start typing indicator
     */
    startTyping(recipientId) {
        if (!this.socket || !this.socket.connected) {
            return;
        }
        this.socket.emit('typing:start', { recipientId });
    }
    /**
     * Stop typing indicator
     */
    stopTyping(recipientId) {
        if (!this.socket || !this.socket.connected) {
            return;
        }
        this.socket.emit('typing:stop', { recipientId });
    }
    /**
     * Check if socket is connected
     */
    isConnected() {
        return this.socket?.connected ?? false;
    }
    /**
     * Register event listener
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);
    }
    /**
     * Unregister event listener
     */
    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(callback);
        }
    }
    /**
     * Emit event to local listeners
     */
    emit(eventName, data) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach((callback) => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in listener for ${eventName}:`, error);
                }
            });
        }
    }
    /**
     * Get socket ID (for debugging)
     */
    getSocketId() {
        return this.socket?.id ?? null;
    }
}
// Export singleton instance
export default new SocketService();
//# sourceMappingURL=socketService.js.map