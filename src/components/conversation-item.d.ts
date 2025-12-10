interface ConversationItemProps {
    username: string;
    message: string;
    type: string;
    time: string;
    date: string;
    isOnline?: boolean;
    isActive?: boolean;
    onClick?: () => void;
}
export declare function ConversationItem({ username, message, type, time, date, isOnline, isActive, onClick, }: ConversationItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=conversation-item.d.ts.map