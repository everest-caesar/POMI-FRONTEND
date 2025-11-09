import * as authService from '../services/auth.service';
export interface UseAuthReturn {
    user: authService.User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    register: (data: {
        email: string;
        username: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}
/**
 * Custom hook for authentication
 */
export declare const useAuth: () => UseAuthReturn;
//# sourceMappingURL=useAuth.d.ts.map