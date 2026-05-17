import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AuthState,
  AuthTokens,
  LoginCredentials,
  User,
} from '@/types';
import { useNavigationStore } from '@/stores/navigation-store';

function getDefaultPageForRoles(roleIds: number[]): string {
  if (roleIds.includes(3)) return 'premies';
  if (roleIds.includes(6) || roleIds.includes(8)) return 'premies';
  if (roleIds.includes(9)) return 'chairman-reports';
  if (roleIds.includes(5)) return 'director-reports';
  if (roleIds.includes(10)) return 'applications';
  if (roleIds.includes(11)) return 'credits';
  if (roleIds.includes(12)) return 'applications';
  if (roleIds.includes(13)) return 'qr-accounts';
  if (roleIds.includes(14)) return 'sms-service';
  if (roleIds.includes(17)) return 'abs-search';
  if (roleIds.includes(18)) return 'limits';
  if (roleIds.includes(21)) return 'transactions';
  if (roleIds.includes(27)) return 'documents';
  return 'dashboard';
}

const AUTO_LOGOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_RESET_MS = 5 * 60 * 1000; // Reset timer every 5 min of activity

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: unknown) => Promise<void>;
  logout: () => void;
  exchangeV2Token: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => void;
  resetActivityTimer: () => void;
  startAutoLogout: () => void;
  stopAutoLogout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),
      autoLogoutTimer: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/auth/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Ошибка авторизации');

          const tokens: AuthTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in || 3600,
          };

          // Parse roles from data.role_ids
          let roleIds: number[] = [];
          if (data.role_ids) {
            if (Array.isArray(data.role_ids)) {
              roleIds = data.role_ids.map(Number);
            } else {
              roleIds = [Number(data.role_ids)];
            }
          }

          const userProfile: User = {
            id: credentials.username,
            username: credentials.username,
            firstName: credentials.username,
            lastName: '',
            role: roleIds[0] || 0,
            roleIds: roleIds,
            roleName: `Роль ${roleIds[0] || 'Unknown'}`,
            branch: 'Головной офис',
            isActive: true,
          };

          // Save to cookies for middleware
          document.cookie = `access_token=${tokens.accessToken}; path=/; max-age=${tokens.expiresIn}`;
          document.cookie = `refresh_token=${tokens.refreshToken}; path=/; max-age=${tokens.expiresIn * 2}`;

          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', tokens.accessToken);
            if (tokens.refreshToken) {
              localStorage.setItem('refresh_token', tokens.refreshToken);
            }
          }

          set({
            tokens,
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
          });

          // Auto exchange V2 token
          get().exchangeV2Token();
          // Fetch user profile
          get().fetchMe();
          // Start auto-logout timer
          get().startAutoLogout();

          // Navigate to correct dashboard based on role
          useNavigationStore.getState().navigate(getDefaultPageForRoles(roleIds));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: unknown) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/auth/sign-up`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message || 'Ошибка регистрации');
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        const state = get();
        // Preserve specific keys
        const lastPasswordChange = localStorage.getItem('last_password_change');
        const passwordCheckDone = localStorage.getItem('password_check_done');

        // Call API logout
        if (state.tokens?.accessToken) {
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/auth/logout`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${state.tokens.accessToken}` },
          }).catch(() => {});
        }

        // Clear cookies
        document.cookie = 'access_token=; path=/; max-age=0';
        document.cookie = 'refresh_token=; path=/; max-age=0';
        document.cookie = 'v2_token=; path=/; max-age=0';

        // Restore preserved keys
        if (lastPasswordChange) localStorage.setItem('last_password_change', lastPasswordChange);
        if (passwordCheckDone) localStorage.setItem('password_check_done', passwordCheckDone);

        // Stop auto-logout
        get().stopAutoLogout();

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          lastActivity: 0,
          autoLogoutTimer: null,
        });

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      exchangeV2Token: async () => {
        const state = get();
        if (!state.tokens?.accessToken) return;
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/auth/v2/token-exchange`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${state.tokens.accessToken}`,
            },
          });
          const data = await res.json();
          if (res.ok && data.v2_token) {
            document.cookie = `v2_token=${data.v2_token}; path=/; max-age=3600`;
            set({
              tokens: { ...state.tokens, v2Token: data.v2_token },
            });
          }
        } catch {
          // V2 token exchange failed — non-critical
        }
      },

      fetchMe: async () => {
        const state = get();
        if (!state.tokens?.accessToken) return;
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/auth/me`, {
            headers: { Authorization: `Bearer ${state.tokens.accessToken}` },
          });
          const data = await res.json();
          if (res.ok) {
            set({ user: data as User });
          }
        } catch {
          // Fetch me failed
        }
      },

      setTokens: (tokens: AuthTokens) => {
        document.cookie = `access_token=${tokens.accessToken}; path=/; max-age=${tokens.expiresIn}`;
        document.cookie = `refresh_token=${tokens.refreshToken}; path=/; max-age=${tokens.expiresIn * 2}`;
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem('refresh_token', tokens.refreshToken);
          }
        }
        set({ tokens, isAuthenticated: true, lastActivity: Date.now() });
      },

      resetActivityTimer: () => {
        set({ lastActivity: Date.now() });
        // Restart auto-logout if authenticated
        const state = get();
        if (state.isAuthenticated) {
          get().startAutoLogout();
        }
      },

      startAutoLogout: () => {
        const state = get();
        if (state.autoLogoutTimer) {
          clearTimeout(state.autoLogoutTimer);
        }

        const timer = window.setTimeout(() => {
          const currentState = get();
          const elapsed = Date.now() - currentState.lastActivity;
          if (elapsed >= AUTO_LOGOUT_MS) {
            currentState.logout();
          }
        }, AUTO_LOGOUT_MS);

        set({ autoLogoutTimer: timer as unknown as number });
      },

      stopAutoLogout: () => {
        const state = get();
        if (state.autoLogoutTimer) {
          clearTimeout(state.autoLogoutTimer);
          set({ autoLogoutTimer: null });
        }
      },
    }),
    {
      name: 'premies-auth-storage',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
