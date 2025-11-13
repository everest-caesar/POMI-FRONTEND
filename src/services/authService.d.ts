interface LoginRequest {
    email: string;
    password: string;
}
interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    age: number;
    area: string;
    workOrSchool: string;
    adminInviteCode?: string;
}
interface AuthResponse {
    token: string;
    user: {
        _id: string;
        email: string;
        username: string;
        age?: number;
        area?: string;
        workOrSchool?: string;
        isAdmin?: boolean;
        createdAt: string;
    };
    message: string;
}
export interface User {
    _id: string;
    email: string;
    username: string;
    age?: number;
    area?: string;
    workOrSchool?: string;
    isAdmin?: boolean;
    createdAt: string;
}
declare class AuthService {
    private api;
    constructor();
    register(data: RegisterRequest): Promise<AuthResponse>;
    login(data: LoginRequest): Promise<AuthResponse>;
    adminLogin(data: LoginRequest): Promise<AuthResponse>;
    getCurrentUser(): Promise<{
        user: User;
    }>;
    setToken(token: string): void;
    getToken(): string | null;
    removeToken(): void;
    isAuthenticated(): boolean;
    getUserData(): User | null;
    clearUserData(): void;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=authService.d.ts.map