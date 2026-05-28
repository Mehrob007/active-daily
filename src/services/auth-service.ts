import { apiClient } from '@/services/api-client';
import type {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types';

// ============================================
// Auth Service — Authentication API
// ============================================

/** Response shape returned by sign-in and token-exchange */
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  role_ids?: number[];
}

/** Response shape returned by sign-up */
interface SignUpResponse {
  id: string;
  username: string;
  message: string;
}

export const authService = {
  /**
   * Sign in with username and password.
   * Returns auth tokens on success.
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/sign-in', {
      body: credentials,
      skipAuth: true,
    });
  },

  /**
   * Register a new user account.
   */
  async signUp(data: RegisterData): Promise<SignUpResponse> {
    return apiClient.post<SignUpResponse>('/auth/sign-up', {
      body: data,
      skipAuth: true,
    });
  },

  /**
   * Sign out the current user and invalidate tokens.
   */
  async logout(): Promise<void> {
    return apiClient.delete<void>('/auth/logout');
  },
  
  /**
   * Fetch the currently authenticated user profile.
   */
  async getMe(): Promise<User> {
    return apiClient.get<User>('/roles/user/my');
  },
};
