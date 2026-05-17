import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  /** Current active page slug (e.g. 'dashboard', 'applications') */
  currentPage: string;
  /** Whether the sidebar is collapsed (desktop) */
  sidebarCollapsed: boolean;
  /** Whether the mobile sidebar sheet is open */
  sidebarMobileOpen: boolean;
}

interface NavigationActions {
  /** Navigate to a page by slug */
  navigate: (page: string) => void;
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
      sidebarCollapsed: false,
      sidebarMobileOpen: false,

      // ── Actions ────────────────────────────────────────────
      navigate: (page: string) => {
        set({ currentPage: page, sidebarMobileOpen: false });
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
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
