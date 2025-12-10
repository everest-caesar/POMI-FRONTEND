export const generateClientMessageId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};
//# sourceMappingURL=messageHelpers.js.map