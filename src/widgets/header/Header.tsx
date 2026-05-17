'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { getBreadcrumbsForPath } from '@/config/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Bell,
  Menu,
  LogOut,
  User,
  ChevronRight,
} from 'lucide-react';

// ─── Header Component ──────────────────────────────────────────
export default function Header() {
  const { currentPage, setMobileOpen } = useNavigationStore();
  const { user, logout } = useAuthStore();
  const isMobile = useIsMobile();

  const breadcrumbs = getBreadcrumbsForPath(currentPage);
  const initials =
    (user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '');

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/60 bg-white px-4 md:px-6',
        'shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
      )}
    >
      {/* Mobile Hamburger */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-bank-red hover:bg-bank-active"
          onClick={() => setMobileOpen(true)}
          aria-label="Открыть меню навигации"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Breadcrumb */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </BreadcrumbSeparator>
                )}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-muted-foreground hover:text-bank-red"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-bank-red hover:bg-bank-active"
          aria-label="Уведомления"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bank-red ring-2 ring-white" />
        </Button>

        {/* User Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                  'hover:bg-bank-active outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40 focus-visible:ring-offset-1'
                )}
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback className="bg-bank-active text-[10px] font-semibold text-bank-red">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium leading-tight text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[11px] leading-tight text-muted-foreground">
                      {user.branch}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-lg border border-border/60"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1 py-1">
                  <p className="text-sm font-semibold leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || user.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="gap-2.5 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Профиль</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2.5 cursor-pointer"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
