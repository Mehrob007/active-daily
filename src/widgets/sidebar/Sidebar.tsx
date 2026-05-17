'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { getFilteredMenu } from '@/config/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { MenuItem } from '@/types';

// ─── Icon Map ──────────────────────────────────────────────────
import {
  LayoutDashboard,
  CreditCard,
  Banknote,
  QrCode,
  MessageSquare,
  Gift,
  Calculator,
  GraduationCap,
  FileBarChart,
  ScrollText,
  Search,
  Shield,
  ArrowLeftRight,
  FolderOpen,
  Package,
  BarChart3,
  TrendingUp,
  Activity,
  ClipboardCheck,
  FileText,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CreditCard,
  Banknote,
  QrCode,
  MessageSquare,
  Gift,
  Calculator,
  GraduationCap,
  FileBarChart,
  ScrollText,
  Search,
  Shield,
  ArrowLeftRight,
  FolderOpen,
  Package,
  BarChart3,
  TrendingUp,
  Activity,
  ClipboardCheck,
  FileText,
};

function MenuIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = iconMap[name];
  return Icon ? <Icon className={className} /> : null;
}

// ─── Sidebar Navigation Item ───────────────────────────────────
function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: MenuItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40 focus-visible:ring-offset-1',
        isActive
          ? 'bg-bank-active text-bank-red'
          : 'text-muted-foreground hover:bg-bank-active/60 hover:text-bank-red',
        collapsed && 'justify-center px-0'
      )}
    >
      <MenuIcon
        name={item.icon}
        className={cn(
          'h-5 w-5 shrink-0',
          isActive
            ? 'text-bank-red'
            : 'text-muted-foreground group-hover:text-bank-red'
        )}
      />
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}
      {!collapsed && item.badge != null && (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bank-red px-1.5 text-[10px] font-semibold text-white">
          {item.badge}
        </span>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          {item.label}
          {item.badge != null && (
            <span className="ml-1.5 text-bank-red">({item.badge})</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

// ─── Group Section ─────────────────────────────────────────────
function NavGroup({
  group,
  collapsed,
}: {
  group: MenuItem;
  collapsed: boolean;
}) {
  const { currentPage, navigate } = useNavigationStore();
  const hasChildren = group.children && group.children.length > 0;

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1">
        {hasChildren &&
          group.children!.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              isActive={currentPage === child.id}
              collapsed={collapsed}
              onClick={() => navigate(child.id)}
            />
          ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Group Header */}
      <p className="px-3 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {group.label}
      </p>
      {/* Group Items */}
      {hasChildren &&
        group.children!.map((child) => (
          <NavItem
            key={child.id}
            item={child}
            isActive={currentPage === child.id}
            collapsed={collapsed}
            onClick={() => navigate(child.id)}
          />
        ))}
    </div>
  );
}

// ─── User Section (bottom) ────────────────────────────────────
function UserSection({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const initials =
    (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '');

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="mx-auto flex h-10 w-10 items-center justify-center">
            <Avatar className="h-10 w-10 border-2 border-bank-active">
              <AvatarImage src={user.avatar} alt={user.firstName} />
              <AvatarFallback className="bg-bank-active text-xs font-semibold text-bank-red">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{user.roleName}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Separator />
      <div className="flex items-center gap-3 px-3 py-2">
        <Avatar className="h-9 w-9 border-2 border-bank-active">
          <AvatarImage src={user.avatar} alt={user.firstName} />
          <AvatarFallback className="bg-bank-active text-xs font-semibold text-bank-red">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.roleName}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-bank-red hover:bg-bank-active"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Выйти</span>
        </Button>
      </div>
    </div>
  );
}

// ─── Main Sidebar Content ──────────────────────────────────────
function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuthStore();
  const { currentPage, navigate } = useNavigationStore();

  const menuItems: MenuItem[] = (user?.roleIds || [5, 9, 10, 11, 12, 13, 14, 17, 18, 21, 22, 23, 26, 27, 31, 32])
    ? getFilteredMenu(user?.roleIds || [5, 9, 10, 11, 12, 13, 14, 17, 18, 21, 22, 23, 26, 27, 31, 32])
    : [];

  // Separate top-level items from groups
  const topItems = menuItems.filter((item) => !item.children);
  const groups = menuItems.filter((item) => item.children);

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden">
      {/* Logo Area */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-border/60 px-4',
          collapsed ? 'justify-center' : 'gap-2.5'
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bank-red text-white">
          {/* <Building2 className="h-4.5 w-4.5" /> */}
          <span className="text-[#fff] font-[900]">
            A
          </span>
        </div>
        {!collapsed && (
          <span className="text-lg font-extrabold tracking-tight text-bank-red">
            ActivBank
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-2 pr-1">
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {/* Top-level items (Dashboard) */}
          {topItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={currentPage === item.id}
              collapsed={collapsed}
              onClick={() => navigate(item.id)}
            />
          ))}

          {/* Grouped items */}
          {groups.map((group) => (
            <NavGroup key={group.id} group={group} collapsed={collapsed} />
          ))}
        </nav>
      </div>

      {/* User Section */}
      <div className="px-2 pb-3">
        <UserSection collapsed={collapsed} />
      </div>
    </div>
  );
}

// ─── Exported Sidebar ──────────────────────────────────────────
export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setMobileOpen } =
    useNavigationStore();
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <Sheet open={sidebarMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Меню навигации</SheetTitle>
          </SheetHeader>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col bg-white border-r border-border/60',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <SidebarContent collapsed={sidebarCollapsed} />

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full',
          'border border-border bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)]',
          'transition-colors hover:bg-bank-active hover:border-bank-red/20',
          'outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40'
        )}
        aria-label={sidebarCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
