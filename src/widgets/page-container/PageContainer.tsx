'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function PageContainer({
  title,
  subtitle,
  children,
  actions,
}: PageContainerProps) {
  return (
    <div className="flex-1 bg-background p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="mt-3 sm:mt-0 shrink-0">{actions}</div>}
      </div>

      {/* Content Card */}
      <div
        className={cn(
          'rounded-lg bg-white p-4 md:p-6',
          'shadow-[0_2px_4px_rgba(0,0,0,0.05)]'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default PageContainer;
