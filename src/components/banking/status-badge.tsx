'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Mapping of status keys to Russian display labels */
const STATUS_LABELS: Record<string, string> = {
  // Common statuses
  active: 'Активен',
  approved: 'Одобрено',
  completed: 'Выполнено',
  paid: 'Оплачено',
  calculated: 'Рассчитано',
  pending: 'В ожидании',
  in_progress: 'В процессе',
  inProgress: 'В процессе',
  rejected: 'Отклонено',
  failed: 'Ошибка',
  blocked: 'Заблокировано',
  closed: 'Закрыто',
  cancelled: 'Отменено',
  draft: 'Черновик',
  reversed: 'Возвращено',
  // Application-specific
  debit: 'Дебет',
  credit: 'Кредит',
  transfer: 'Перевод',
  // Account types
  current: 'Текущий',
  savings: 'Сберегательный',
  card: 'Картовый',
  deposit: 'Депозитный',
  // Product types
  debit_card: 'Дебетовая карта',
  credit_card: 'Кредитная карта',
  prepaid: 'Предоплаченная',
};

type StatusColorVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info';

const STATUS_VARIANT_MAP: Record<string, StatusColorVariant> = {
  // Success / positive
  active: 'success',
  approved: 'success',
  completed: 'success',
  paid: 'success',
  calculated: 'success',
  // Warning / in-flight
  pending: 'warning',
  in_progress: 'warning',
  inProgress: 'warning',
  // Danger / negative
  rejected: 'danger',
  failed: 'danger',
  blocked: 'danger',
  closed: 'danger',
  cancelled: 'danger',
  reversed: 'danger',
  // Neutral
  draft: 'neutral',
};

const VARIANT_CLASSES: Record<StatusColorVariant, string> = {
  success: 'bg-bank-success/15 text-bank-success border-bank-success/20',
  warning: 'bg-bank-warning/15 text-bank-warning border-bank-warning/20',
  danger: 'bg-bank-red/15 text-bank-red border-bank-red/20',
  neutral: 'bg-muted text-muted-foreground border-border/60',
  info: 'bg-bank-info/15 text-bank-info border-bank-info/20',
};

function getStatusVariant(status: string): StatusColorVariant {
  return STATUS_VARIANT_MAP[status] ?? 'info';
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = getStatusVariant(status);
  const label = getStatusLabel(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md px-2.5 py-0.5 text-xs font-medium capitalize',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {label}
    </Badge>
  );
}
