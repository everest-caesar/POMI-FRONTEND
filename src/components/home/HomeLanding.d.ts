import type { FeatureId } from '@/types/features';
import type { User as AuthUser } from '@/services/authService';
interface HomeLandingProps {
    isLoggedIn: boolean;
    currentUser: AuthUser | null;
    flashMessage: string | null;
    unreadAdminMessages: number;
    unreadMessagesCount: number;
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onLogout: () => void;
    onAdminInboxClick: () => void;
    onCalendarClick: () => void;
    onMessagesClick: () => void;
    onExploreFeature: (feature: FeatureId) => void;
    navigateTo: (path: string) => void;
}
export declare function HomeLanding({ isLoggedIn, currentUser, flashMessage, unreadAdminMessages, unreadMessagesCount, onLoginClick, onRegisterClick, onLogout, onAdminInboxClick, onCalendarClick, onMessagesClick, onExploreFeature, navigateTo, }: HomeLandingProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=HomeLanding.d.ts.map