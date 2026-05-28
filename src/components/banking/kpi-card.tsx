'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
}: KPICardProps) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <Card
      className={cn(
        'gap-0 rounded-lg border border-border/60 bg-white py-0 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <CardContent className="flex items-start gap-4 p-5">
        {}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-bank-active">
          <Icon className="size-5 text-bank-red" />
        </div>

        {}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <p className="text-muted-foreground truncate text-sm">{title}</p>
          <p className="text-foreground text-2xl font-bold tracking-tight">
            {value}
          </p>

          {}
          {change && (
            <div className="flex items-center gap-1">
              {isPositive && <TrendingUp className="size-3.5 text-bank-success" />}
              {isNegative && <TrendingDown className="size-3.5 text-bank-red" />}
              {changeType === 'neutral' && (
                <Minus className="size-3.5 text-muted-foreground" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  isPositive && 'text-bank-success',
                  isNegative && 'text-bank-red',
                  changeType === 'neutral' && 'text-muted-foreground',
                )}
              >
                {change}
              </span>
              <span className="text-muted-foreground text-xs">
                vs прошлый месяц
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
