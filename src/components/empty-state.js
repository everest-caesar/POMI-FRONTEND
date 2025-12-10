import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MessageCircle } from "lucide-react";
export function EmptyState({ icon, title, description }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center h-full py-20", children: [_jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary mb-6", children: icon || _jsx(MessageCircle, { className: "h-10 w-10 text-muted-foreground" }) }), _jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: title }), description && _jsx("p", { className: "text-sm text-muted-foreground text-center max-w-sm", children: description })] }));
}
//# sourceMappingURL=empty-state.js.map