import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import authService from './authService';

const resolveSocketUrl = (): string => {
  const windowSocket =
    typeof window !== 'undefined' ? (window as any).VITE_SOCKET_URL : undefined;
  const envSocketUrl =
    ((import.meta as any)?.env?.VITE_SOCKET_URL as string | undefined) || windowSocket;

  if (typeof envSocketUrl === 'string' && envSocketUrl.trim()) {
    return envSocketUrl.replace(/\/$/, '');
  }

  const normalized = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return normalized.replace(/\/$/, '');
};

const SOCKET_URL = resolveSocketUrl();

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Connect to Socket.io server
   */
  connect(userId: string): void {
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

    this.socket.on('auth:error', (message: string) => {
      console.error('❌ Socket authentication failed:', message);
      this.disconnect();
    });

    // Handle incoming messages
    this.socket.on('message:receive', (data: any) => {
      this.emit('message:receive', data);
    });

    // Handle typing indicators
    this.socket.on('typing:start', (data: any) => {
      this.emit('typing:start', data);
    });

    this.socket.on('typing:stop', (data: any) => {
      this.emit('typing:stop', data);
    });

    // Delivery confirmation
    this.socket.on('message:sent', (data: any) => {
      this.emit('message:sent', data);
    });

    // Handle user online/offline status
    this.socket.on('user:online', (data: any) => {
      this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data: any) => {
      this.emit('user:offline', data);
    });

    this.socket.on('user:presence', (data: any) => {
      this.emit('user:presence', data);
    });

    // Handle connection errors
    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Socket connection error:', error);
      this.emit('error', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket disconnected:', reason);
      this.emit('disconnect', { reason });
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  /**
   * Send a message via Socket.io
   */
  sendMessage(recipientId: string, content: string, listingId?: string, clientMessageId?: string): void {
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
  startTyping(recipientId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('typing:start', { recipientId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(recipientId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('typing:stop', { recipientId });
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Register event listener
   */
  on(eventName: string, callback: Function): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(callback);
  }

  /**
   * Unregister event listener
   */
  off(eventName: string, callback: Function): void {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName)!.delete(callback);
    }
  }

  /**
   * Emit event to local listeners
   */
  private emit(eventName: string, data: any): void {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Get socket ID (for debugging)
   */
  getSocketId(): string | null {
    return this.socket?.id ?? null;
  }
}

// Export singleton instance
export default new SocketService();
