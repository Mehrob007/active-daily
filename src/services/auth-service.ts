import { apiClient } from '@/services/api-client';
import type {
  ApiResponse,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types';

// ============================================
// Auth Service — Authentication API
// ============================================

/** Response shape returned by sign-in */
interface SignInResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/** Response shape returned by sign-up */
interface SignUpResponse {
  id: string;
  username: string;
  message: string;
}

/** Response shape for V2 token exchange */
interface V2TokenResponse {
  v2_token: string;
  expires_in: number;
}

/** Response shape for /auth/me */
interface MeResponse {
  user: User;
}

export const authService = {
  /**
   * Sign in with username and password.
   * Returns auth tokens on success.
   */
  async signIn(credentials: LoginCredentials): Promise<ApiResponse<SignInResponse>> {
    return apiClient.post<ApiResponse<SignInResponse>>('/auth/sign-in', {
      body: credentials,
      skipAuth: true,
    });
  },

  /**
   * Register a new user account.
   */
  async signUp(data: RegisterData): Promise<ApiResponse<SignUpResponse>> {
    return apiClient.post<ApiResponse<SignUpResponse>>('/auth/sign-up', {
      body: data,
      skipAuth: true,
    });
  },

  /**
   * Sign out the current user and invalidate tokens.
   */
  async logout(): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>('/auth/logout');
  },

  /**
   * Exchange the current access token for a V2 system token.
   * Used for accessing downstream banking ABS services.
   */
  async getV2Token(): Promise<ApiResponse<V2TokenResponse>> {
    return apiClient.post<ApiResponse<V2TokenResponse>>('/auth/v2/token-exchange');
  },

  /**
   * Fetch the currently authenticated user profile.
   */
  async getMe(): Promise<ApiResponse<MeResponse>> {
    return apiClient.get<ApiResponse<MeResponse>>('/auth/me');
  },
};
