interface EnhancedAuthFormProps {
    authMode: 'login' | 'register';
    onSuccess: (data: any) => void;
    onClose: () => void;
    onModeChange: (mode: 'login' | 'register') => void;
}
export default function EnhancedAuthForm({ authMode, onSuccess, onClose, onModeChange, }: EnhancedAuthFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=EnhancedAuthForm.d.ts.map