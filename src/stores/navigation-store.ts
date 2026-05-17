import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  /** Current active page slug (e.g. 'dashboard', 'applications') */
  currentPage: string;
  /** Optional parameter payload passed on navigation */
  currentParams?: any;
  /** Whether the sidebar is collapsed (desktop) */
  sidebarCollapsed: boolean;
  /** Whether the mobile sidebar sheet is open */
  sidebarMobileOpen: boolean;
}

interface NavigationActions {
  /** Navigate to a page by slug with optional parameters */
  navigate: (page: string, params?: any) => void;
  /** Toggle sidebar collapsed / expanded (desktop) */
  toggleSidebar: () => void;
  /** Explicitly set sidebar collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Set mobile sidebar open/close */
  setMobileOpen: (open: boolean) => void;
}

type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      // ── State ──────────────────────────────────────────────
      currentPage: 'dashboard',
      currentParams: null,
      sidebarCollapsed: false,
      sidebarMobileOpen: false,

      // ── Actions ────────────────────────────────────────────
      navigate: (page: string, params?: any) => {
        set({ currentPage: page, currentParams: params || null, sidebarMobileOpen: false });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      setMobileOpen: (open: boolean) => {
        set({ sidebarMobileOpen: open });
      },
    }),
    {
      name: 'premies-navigation-storage',
      partialize: (state) => ({
        currentPage: state.currentPage,
        currentParams: state.currentParams,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
