export interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: boolean;
    createdAt?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthResponse {
    message: string;
    user: User;
    tokens: AuthTokens;
}
/**
 * Register new user
 */
export declare const register: (data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}) => Promise<AuthResponse>;
/**
 * Login user
 */
export declare const login: (email: string, password: string) => Promise<AuthResponse>;
/**
 * Refresh access token
 */
export declare const refreshAccessToken: (refreshToken: string) => Promise<string>;
/**
 * Get current user profile
 */
export declare const getCurrentUser: () => Promise<User>;
/**
 * Logout user
 */
export declare const logout: (refreshToken: string) => Promise<void>;
/**
 * Store tokens in localStorage
 */
export declare const storeTokens: (tokens: AuthTokens) => void;
/**
 * Get stored tokens
 */
export declare const getStoredTokens: () => AuthTokens | null;
/**
 * Clear stored tokens
 */
export declare const clearTokens: () => void;
/**
 * Check if user is authenticated
 */
export declare const isAuthenticated: () => boolean;
//# sourceMappingURL=auth.service.d.ts.map