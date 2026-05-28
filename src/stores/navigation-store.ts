import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPathFromPageId } from '@/config/navigation';

interface NavigationState {

  currentPage: string;

  currentParams?: any;

  sidebarCollapsed: boolean;

  sidebarMobileOpen: boolean;
}

interface NavigationActions {

  navigate: (page: string, params?: any) => void;

  toggleSidebar: () => void;

  setSidebarCollapsed: (collapsed: boolean) => void;

  setMobileOpen: (open: boolean) => void;
}

type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({

      currentPage: 'dashboard',
      currentParams: null,
      sidebarCollapsed: false,
      sidebarMobileOpen: false,

      navigate: (page: string, params?: any) => {
        set({ currentPage: page, currentParams: params || null, sidebarMobileOpen: false });
        if (typeof window !== 'undefined') {
          const path = getPathFromPageId(page);
          if (window.location.pathname !== path) {
            const nextRouter = (window as any).nextRouter;
            if (nextRouter) {
              nextRouter.push(path);
            } else {
              window.location.href = path;
            }
          }
        }
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
