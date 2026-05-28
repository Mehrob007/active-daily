import { apiClient } from '@/services/api-client';
import type {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  role_ids?: number[];
}

interface SignUpResponse {
  id: string;
  username: string;
  message: string;
}

export const authService = {

  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/sign-in', {
      body: credentials,
      skipAuth: true,
    });
  },

  async signUp(data: RegisterData): Promise<SignUpResponse> {
    return apiClient.post<SignUpResponse>('/auth/sign-up', {
      body: data,
      skipAuth: true,
    });
  },

  async logout(): Promise<void> {
    return apiClient.delete<void>('/auth/logout');
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>('/roles/user/my');
  },
};
