'use client';

import React, { lazy, Suspense, useEffect, useCallback } from 'react';
import Sidebar from '@/widgets/sidebar/Sidebar';
import Header from '@/widgets/header/Header';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { Construction } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Lazy-loaded feature pages ─────────────────────────────────
const LoginPage = lazy(() => import('@/features/auth/login-page'));
const DashboardPage = lazy(() => import('@/features/agent/DashboardPage'));
const ApplicationsPage = lazy(() => import('@/features/agent/ApplicationsPage'));
const CardsDepositsPage = lazy(() => import('@/features/agent/CardsDepositsPage'));
const CreditsPage = lazy(() => import('@/features/agent/CreditsPage'));
const QrAccountsPage = lazy(() => import('@/features/agent/QrAccountsPage'));
const SmsServicePage = lazy(() => import('@/features/agent/SmsServicePage'));
const CashbackPage = lazy(() => import('@/features/agent/CashbackPage'));
const PremiesPage = lazy(() => import('@/features/back-office/PremiesPage'));
const TestsPage = lazy(() => import('@/features/back-office/TestsPage'));
const ReportsPage = lazy(() => import('@/features/back-office/ReportsPage'));
const DataJournalPage = lazy(() => import('@/features/back-office/DataJournalPage'));
const AbsSearchPage = lazy(() => import('@/features/technical/AbsSearchPage'));
const LimitsPage = lazy(() => import('@/features/technical/LimitsPage'));
const TransactionsPage = lazy(() => import('@/features/technical/TransactionsPage'));
const DocumentsPage = lazy(() => import('@/features/technical/DocumentsPage'));
const ProductsPage = lazy(() => import('@/features/products/ProductsPage'));
const ChairmanReportsPage = lazy(() => import('@/features/analytics/ChairmanReportsPage'));
const DirectorReportsPage = lazy(() => import('@/features/analytics/DirectorReportsPage'));
const SystemLogsPage = lazy(() => import('@/features/analytics/SystemLogsPage'));
const DailyTasksPage = lazy(() => import('@/features/analytics/DailyTasksPage'));
const KnowledgeBasePage = lazy(() => import('@/features/knowledge-base/KnowledgeBasePage'));

const pageComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  dashboard: DashboardPage,
  applications: ApplicationsPage,
  'cards-deposits': CardsDepositsPage,
  credits: CreditsPage,
  'qr-accounts': QrAccountsPage,
  'sms-service': SmsServicePage,
  cashback: CashbackPage,
  premies: PremiesPage,
  tests: TestsPage,
  reports: ReportsPage,
  'data-journal': DataJournalPage,
  'abs-search': AbsSearchPage,
  limits: LimitsPage,
  transactions: TransactionsPage,
  documents: DocumentsPage,
  products: ProductsPage,
  'chairman-reports': ChairmanReportsPage,
  'director-reports': DirectorReportsPage,
  'system-logs': SystemLogsPage,
  'daily-tasks': DailyTasksPage,
  'knowledge-base': KnowledgeBasePage,
};

// ─── Loading Fallback ───────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex-1 bg-background p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="rounded-lg bg-white p-4 md:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ─── Placeholder for unbuilt pages ──────────────────────────────
function PlaceholderPage({ pageId }: { pageId: string }) {
  return (
    <div className="flex-1 bg-background p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Страница в разработке</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Раздел «{pageId}» находится в стадии разработки</p>
      </div>
      <div className="rounded-lg bg-white p-4 md:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Construction className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">В разработке</p>
          <p className="text-sm">Данный раздел находится в стадии разработки</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function Home() {
  const { currentPage } = useNavigationStore();
  const { isAuthenticated, user, resetActivityTimer } = useAuthStore();

  // Reset auto-logout timer on user activity
  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      resetActivityTimer();
    }
  }, [isAuthenticated, resetActivityTimer]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [handleActivity]);

  // ── Auth Gate: Show login when not authenticated ────────────
  // if (!isAuthenticated || !user) {
  //   return (
  //     <Suspense fallback={
  //       <div className="min-h-screen flex items-center justify-center bg-background">
  //         <Skeleton className="h-96 w-full max-w-md rounded-xl" />
  //       </div>
  //     }>
  //       <LoginPage />
  //     </Suspense>
  //   );
  // }

  // ── Portal Layout ───────────────────────────────────────────
  const PageComponent = pageComponents[currentPage];

  return PageComponent ? (
    <Suspense fallback={<PageLoader />}>
      <PageComponent />
    </Suspense>
  ) : (
    <PlaceholderPage pageId={currentPage} />
  );
}
