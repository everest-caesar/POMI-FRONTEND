import { useState, useCallback, useEffect } from 'react';
import * as authService from '../services/auth.service';
/**
 * Custom hook for authentication
 */
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                }
                catch (err) {
                    console.error('Failed to load user:', err);
                    authService.clearTokens();
                }
            }
        };
        loadUser();
    }, []);
    const register = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register(data);
            authService.storeTokens(response.tokens);
            setUser(response.user);
        }
        catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.errors?.[0] || 'Registration failed';
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(email, password);
            authService.storeTokens(response.tokens);
            setUser(response.user);
        }
        catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.errors?.[0] || 'Login failed';
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const logout = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const tokens = authService.getStoredTokens();
            if (tokens) {
                await authService.logout(tokens.refreshToken);
            }
            setUser(null);
        }
        catch (err) {
            const errorMessage = err.response?.data?.error || 'Logout failed';
            setError(errorMessage);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        clearError,
    };
};
//# sourceMappingURL=useAuth.js.map