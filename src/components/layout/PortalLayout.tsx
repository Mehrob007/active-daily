'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/widgets/sidebar/Sidebar';
import Header from '@/widgets/header/Header';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { getPageIdFromPath } from '@/config/navigation';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentPage, navigate } = useNavigationStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).nextRouter = router;
    }
  }, [router]);

  useEffect(() => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated) {
      state.checkAuth();
    }
  }, []); 

  useEffect(() => {
    const pageId = getPageIdFromPath(pathname);
    if (pageId && pageId !== currentPage) {

      navigate(pageId);
    }
  }, [pathname, currentPage, navigate]);

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {}
      <Sidebar />

      {}
      <div className="flex flex-1 flex-col overflow-hidden">
        {}
        <Header />

        {}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
