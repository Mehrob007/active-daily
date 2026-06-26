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

const AUTO_LOGOUT_MS = 30 * 60 * 1000;

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: any) => Promise<any>;
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
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),
      autoLogoutTimer: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const data = await authService.signIn(credentials);

          const tokens: AuthTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in || 3600,
          };

          const roleIds = Array.isArray(data.role_ids) 
            ? data.role_ids.map(Number) 
            : data.role_ids !== undefined ? [Number(data.role_ids)] : [];

          document.cookie = `role_ids=${JSON.stringify(roleIds)}; path=/; max-age=${tokens.expiresIn || 3600}`;

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

          set({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
          });

          await get().fetchMe();
          get().startAutoLogout();

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
        const lastPasswordChange = localStorage.getItem("last_password_change");
        const passwordCheckDone = localStorage.getItem("password_check_done");

        try {
          if (state.isAuthenticated) {
            await authService.logout();
          }
        } catch (e) {
          console.warn("Logout failed", e);
        }

        localStorage.clear();
        document.cookie = "access_token=; path=/; max-age=0";
        document.cookie = "refresh_token=; path=/; max-age=0";
        document.cookie = "v2_token=; path=/; max-age=0";
        document.cookie = "role_ids=; path=/; max-age=0";

        if (lastPasswordChange)
          localStorage.setItem("last_password_change", lastPasswordChange);
        if (passwordCheckDone)
          localStorage.setItem("password_check_done", passwordCheckDone);

        get().stopAutoLogout();

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          lastActivity: 0,
          autoLogoutTimer: null,
        });

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      checkAuth: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.tokens?.accessToken) return;

        try {
          await get().fetchMe();
        } catch (error) {
          console.error("Auth check failed", error);
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
        document.cookie = `access_token=${tokens.accessToken}; path=/; max-age=${tokens.expiresIn}`;
        document.cookie = `refresh_token=${tokens.refreshToken}; path=/; max-age=${tokens.expiresIn * 2}`;

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
