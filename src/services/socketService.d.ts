declare class SocketService {
    private socket;
    private userId;
    private listeners;
    /**
     * Connect to Socket.io server
     */
    connect(userId: string): void;
    /**
     * Disconnect from Socket.io server
     */
    disconnect(): void;
    /**
     * Send a message via Socket.io
     */
    sendMessage(recipientId: string, content: string, listingId?: string): void;
    /**
     * Start typing indicator
     */
    startTyping(recipientId: string): void;
    /**
     * Stop typing indicator
     */
    stopTyping(recipientId: string): void;
    /**
     * Check if socket is connected
     */
    isConnected(): boolean;
    /**
     * Register event listener
     */
    on(eventName: string, callback: Function): void;
    /**
     * Unregister event listener
     */
    off(eventName: string, callback: Function): void;
    /**
     * Emit event to local listeners
     */
    private emit;
    /**
     * Get socket ID (for debugging)
     */
    getSocketId(): string | null;
}
declare const _default: SocketService;
export default _default;
//# sourceMappingURL=socketService.d.ts.map