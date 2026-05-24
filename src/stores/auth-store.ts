import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, AuthTokens, LoginCredentials, User } from "@/types";
import { useNavigationStore } from "@/stores/navigation-store";
import { authService } from "@/services/auth-service";

function getDefaultPageForRoles(roleIds: number[]): string {
  if (roleIds.includes(3)) return "premies";
  if (roleIds.includes(6) || roleIds.includes(8)) return "premies";
  if (roleIds.includes(9)) return "chairman-reports";
  if (roleIds.includes(5)) return "director-reports";
  if (roleIds.includes(10)) return "applications";
  if (roleIds.includes(11)) return "credits";
  if (roleIds.includes(12)) return "applications";
  if (roleIds.includes(13)) return "qr-accounts";
  if (roleIds.includes(14)) return "sms-service";
  if (roleIds.includes(17)) return "abs-search";
  if (roleIds.includes(18)) return "limits";
  if (roleIds.includes(21)) return "transactions";
  if (roleIds.includes(27)) return "documents";
  return "dashboard";
}

const AUTO_LOGOUT_MS = 30 * 60 * 1000; // 30 minutes

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
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
          const data = await authService.signIn(credentials);

          const tokens: AuthTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in || 3600,
          };

          // Parse roles
          const roleIds = Array.isArray(data.role_ids) 
            ? data.role_ids.map(Number) 
            : data.role_ids !== undefined ? [Number(data.role_ids)] : [];

          const userProfile: User = {
            id: credentials.username,
            username: credentials.username,
            firstName: credentials.username,
            lastName: "",
            role: roleIds[0] || 0,
            roleIds: roleIds,
            roleName: `Роль ${roleIds[0] || "Unknown"}`,
            branch: "Головной офис",
            isActive: true,
          };

          get().setTokens(tokens);

          // Mirror reference logic: immediately translate token after login
          try {
            const translated = await authService.translateToken();
            get().setTokens({
              accessToken: translated.access_token,
              refreshToken: translated.refresh_token,
              expiresIn: translated.expires_in || 3600,
            });
          } catch (e) {
            console.warn("Immediate token translation failed", e);
          }

          set({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
          });

          // Fetch actual user profile from /my
          await get().fetchMe();
          // Start auto-logout timer
          get().startAutoLogout();

          // Navigate to correct dashboard based on role
          useNavigationStore
            .getState()
            .navigate(getDefaultPageForRoles(roleIds));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const result = await authService.signUp(data);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const state = get();
        // Preserve specific keys
        const lastPasswordChange = localStorage.getItem("last_password_change");
        const passwordCheckDone = localStorage.getItem("password_check_done");

        try {
          if (state.isAuthenticated) {
            await authService.logout();
          }
        } catch (e) {
          console.warn("Logout failed", e);
        }

        // Clear everything
        localStorage.clear();
        document.cookie = "access_token=; path=/; max-age=0";
        document.cookie = "refresh_token=; path=/; max-age=0";
        document.cookie = "v2_token=; path=/; max-age=0";

        // Restore preserved keys
        if (lastPasswordChange)
          localStorage.setItem("last_password_change", lastPasswordChange);
        if (passwordCheckDone)
          localStorage.setItem("password_check_done", passwordCheckDone);

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
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      checkAuth: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.tokens?.accessToken) return;

        // Prevent redundant refreshes if one happened in the last minute
        const oneMinuteAgo = Date.now() - 60 * 1000;
        if (state.lastActivity > oneMinuteAgo && state.tokens.accessToken.length > 500) {
           // If we have a long token (likely V2) and it's fresh, skip
           return;
        }

        try {
          // Mirror CheckTokenVersion.jsx: translate token to get fresh set
          const data = await authService.translateToken();
          
          const tokens: AuthTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in || 3600,
          };

          const roleIds = Array.isArray(data.role_ids) 
            ? data.role_ids.map(Number) 
            : data.role_ids !== undefined ? [Number(data.role_ids)] : [];

          get().setTokens(tokens);

          // Fetch fresh profile with new token
          await get().fetchMe();

          if (state.user) {
            set({
              user: {
                ...state.user,
                role: roleIds[0] || state.user.role,
                roleIds: roleIds,
              }
            });
          }
        } catch (error) {
          console.error("Token translation failed", error);
          // If translation fails, we might want to log out or just let it be
          // Reference project just logs it.
        }
      },

      fetchMe: async () => {
        const state = get();
        if (!state.isAuthenticated) return;
        try {
          const user = await authService.getMe();
          if (user) {
            set({ user: { ...state.user, ...user } as User });
          }
        } catch (error) {
          console.error("Fetch me failed", error);
        }
      },

      setTokens: (tokens: AuthTokens) => {
        // Cookies for middleware
        document.cookie = `access_token=${tokens.accessToken}; path=/; max-age=${tokens.expiresIn}`;
        document.cookie = `refresh_token=${tokens.refreshToken}; path=/; max-age=${tokens.expiresIn * 2}`;
        
        // LocalStorage for legacy/external compatibility
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem("refresh_token", tokens.refreshToken);
          }
        }
        
        set({ tokens, isAuthenticated: true, lastActivity: Date.now() });
      },

      resetActivityTimer: () => {
        set({ lastActivity: Date.now() });
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
      name: "premies-auth-storage",
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
