"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export function CategoryBadge({ icon, label, isActive = false, onClick }) {
    return (_jsxs("button", { onClick: onClick, className: cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200", isActive
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"), children: [_jsx("span", { children: icon }), _jsx("span", { children: label })] }));
}
//# sourceMappingURL=category-badge.js.map