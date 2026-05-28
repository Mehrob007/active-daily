'use client';

import { Fragment, type ReactNode } from 'react';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Landmark,
  QrCode,
  MessageSquare,
  Gift,
  Award,
  FlaskConical,
  BarChart3,
  Database,
  Search,
  Gauge,
  ArrowLeftRight,
  FolderOpen,
  Package,
  ClipboardList,
  FileBarChart2,
  ScrollText,
  ListChecks,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarItem {
  slug: string;
  label: string;
  icon: ReactNode;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const NAV_GROUPS: SidebarGroup[] = [
  {
    title: 'Агент',
    items: [
      { slug: 'dashboard', label: 'Панель управления', icon: <LayoutDashboard className="h-4 w-4" /> },
      { slug: 'applications', label: 'Заявки', icon: <FileText className="h-4 w-4" /> },
      { slug: 'cards-deposits', label: 'Карты и депозиты', icon: <CreditCard className="h-4 w-4" /> },
      { slug: 'credits', label: 'Кредиты', icon: <Landmark className="h-4 w-4" /> },
      { slug: 'qr-accounts', label: 'QR и счета', icon: <QrCode className="h-4 w-4" /> },
      { slug: 'sms-service', label: 'SMS-сервис', icon: <MessageSquare className="h-4 w-4" /> },
      { slug: 'cashback', label: 'Кэшбэк', icon: <Gift className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Бэк-офис',
    items: [
      { slug: 'premies', label: 'Премии', icon: <Award className="h-4 w-4" /> },
      { slug: 'tests', label: 'Тесты', icon: <FlaskConical className="h-4 w-4" /> },
      { slug: 'reports', label: 'Отчёты', icon: <BarChart3 className="h-4 w-4" /> },
      { slug: 'data-journal', label: 'Журнал данных', icon: <Database className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Технический',
    items: [
      { slug: 'abs-search', label: 'ABS поиск', icon: <Search className="h-4 w-4" /> },
      { slug: 'limits', label: 'Лимиты', icon: <Gauge className="h-4 w-4" /> },
      { slug: 'transactions', label: 'Транзакции', icon: <ArrowLeftRight className="h-4 w-4" /> },
      { slug: 'documents', label: 'Документы', icon: <FolderOpen className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Продукты',
    items: [
      { slug: 'products', label: 'Каталог продуктов', icon: <Package className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Аналитика',
    items: [
      { slug: 'chairman-reports', label: 'Отчёты председателя', icon: <ClipboardList className="h-4 w-4" /> },
      { slug: 'director-reports', label: 'Отчёты директора', icon: <FileBarChart2 className="h-4 w-4" /> },
      { slug: 'system-logs', label: 'Системные логи', icon: <ScrollText className="h-4 w-4" /> },
      { slug: 'daily-tasks', label: 'Ежедневные задачи', icon: <ListChecks className="h-4 w-4" /> },
    ],
  },
];

function SidebarNav() {
  const { currentPage, setCurrentPage, sidebarOpen, toggleSidebar } = useNavigationStore();
  const { user, logout } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-screen border-r border-border bg-card flex flex-col transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {}
      <div className="flex items-center h-14 px-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#C8102E] shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground leading-tight truncate">Activ Daily</span>
              <span className="text-[10px] text-muted-foreground leading-tight">ActivBank</span>
            </div>
          )}
        </div>
        {sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={toggleSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col px-2 gap-1">
          {NAV_GROUPS.map((group, gi) => (
            <Fragment key={group.title}>
              {gi > 0 && <Separator className="my-2" />}
              {sidebarOpen && (
                <span className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </span>
              )}
              {group.items.map((item) => {
                const isActive = currentPage === item.slug;
                const button = (
                  <button
                    key={item.slug}
                    onClick={() => setCurrentPage(item.slug)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left',
                      isActive
                        ? 'bg-[#C8102E] text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <TooltipProvider key={item.slug} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }
                return button;
              })}
            </Fragment>
          ))}
        </nav>
      </ScrollArea>

      {}
      <div className="border-t border-border p-2 shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-bold shrink-0">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Пользователь'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.roleName || 'Сотрудник'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-9 text-muted-foreground hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Выйти</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
}

function TopHeader() {
  const { sidebarOpen, toggleSidebar } = useNavigationStore();
  const currentPage = useNavigationStore((s) => s.currentPage);
  const user = useAuthStore((s) => s.user);

  const allItems = NAV_GROUPS.flatMap((g) => g.items);
  const currentLabel = allItems.find((i) => i.slug === currentPage)?.label || '';

  return (
    <header className="sticky top-0 z-20 flex items-center h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm">
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mr-3 text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
      <h2 className="text-sm font-semibold text-foreground">{currentLabel}</h2>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-muted-foreground hidden sm:block">
          {user ? `${user.firstName} ${user.lastName}` : ''}
        </span>
      </div>
    </header>
  );
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useNavigationStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <TopHeader />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}
