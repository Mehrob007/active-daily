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

  // Expose nextRouter globally so Zustand can trigger fast, client-side Next.js route transitions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).nextRouter = router;
    }
  }, [router]);

  // Synchronize localStorage access_token for legacy pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = useAuthStore.getState();
      if (state.tokens?.accessToken) {
        localStorage.setItem('access_token', state.tokens.accessToken);
        if (state.tokens.refreshToken) {
          localStorage.setItem('refresh_token', state.tokens.refreshToken);
        }
      }
    }
  }, []);

  // Synchronize navigation state with the current pathname on initial load and route changes
  useEffect(() => {
    const pageId = getPageIdFromPath(pathname);
    if (pageId && pageId !== currentPage) {
      // Set the active page slug inside store to sync active sidebar classes
      navigate(pageId);
    }
  }, [pathname, currentPage, navigate]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Scrollable Page Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
