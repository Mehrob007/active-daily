import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  History,
  Key,
  RefreshCw,
  Shield,
  Unlock,
} from 'lucide-react';
import { Card, Account } from '../types';
import { useNavigationStore } from '@/stores/navigation-store';

interface CardsTableProps {
  data: Card[];
  accounts: Account[];
  isLoading: boolean;
  onOpenServices: (card: Card) => void;
  onOpenPin: (card: Card) => void;
  onOpenLimits: (card: Card) => void;
  onBlockCard: (cardId: string) => void;
  onUnblockCard: (cardId: string) => void;
  onResetPin: (cardId: string) => void;
  clientId?: string;
}

export const CardsTable: React.FC<CardsTableProps> = ({
  data,
  accounts,
  isLoading,
  onOpenServices,
  onOpenPin,
  onOpenLimits,
  onBlockCard,
  onUnblockCard,
  onResetPin,
  clientId,
}) => {
  const navigate = useNavigationStore((state) => state.navigate);

  const columns: ColumnDef<Card>[] = [
    { 
      accessorKey: 'cardId', 
      header: 'ID Карты',
      cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.cardId}</span>
    },
    { 
      accessorKey: 'CardNumber', 
      header: 'Номер карты',
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.CardNumber || row.original.details?.cardNumberMask || row.original.cardId || '-'}
        </span>
      )
    },
    { 
      accessorKey: 'cardTypeDisplay', 
      header: 'Тип',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.cardTypeDisplay || row.original.CardTypeName || row.original.details?.cardTypeName || row.original.type || '-'}
        </span>
      )
    },
    { 
      accessorKey: 'statusName', 
      header: 'Статус АБС',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-normal">
          {row.original.statusName || '-'}
        </Badge>
      )
    },
    { 
      id: 'statusPc', 
      header: 'Статус ПЦ',
      cell: ({ row }) => {
        const desc = row.original.details?.statusDescription || '-';
        const hot = row.original.details?.hotCardStatus || '-';
        const isValid = desc.toLowerCase().includes('valid');
        return (
          <span className={`text-xs font-semibold ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
            {desc} ({hot})
          </span>
        );
      }
    },
    { 
      id: 'absBalances', 
      header: 'Остатки в АБС',
      cell: ({ row }) => {
        const accs = row.original.details?.accounts || [];
        if (accs.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="space-y-1 font-mono text-xs">
            {accs.map((acc: any, i: number) => {
              const absAcc = accounts.find((a: any) => a.Number === acc.number);
              return (
                <div key={i} className="border-b border-border/20 last:border-0 pb-0.5 last:pb-0 font-medium">
                  {absAcc ? `${Number(absAcc.Balance).toFixed(2)} ${absAcc.Currency?.Code || ''}` : '-'}
                </div>
              );
            })}
          </div>
        );
      }
    },
    { 
      id: 'pcBalances', 
      header: 'Остатки в ПЦ',
      cell: ({ row }) => {
        const accs = row.original.details?.accounts || [];
        if (accs.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="space-y-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {accs.map((acc: any, i: number) => {
              const currMap: Record<string, string> = {
                '972': 'TJS',
                '840': 'USD',
                '978': 'EUR',
              };
              return (
                <div key={i} className="border-b border-border/20 last:border-0 pb-0.5 last:pb-0">
                  {Number(acc.balance).toFixed(2)} {currMap[acc.currency] || acc.currency}
                </div>
              );
            })}
          </div>
        );
      }
    },
    { 
      id: 'pinDenial', 
      header: 'PIN ош.',
      cell: ({ row }) => {
        const counter = Number(row.original.details?.pinDenialCounter || 0);
        const hasError = counter >= 3;
        return (
          <span className={`font-mono font-bold ${hasError ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-muted-foreground'}`}>
            {counter}
          </span>
        );
      }
    },
    { 
      id: 'services', 
      header: 'Уведомления',
      cell: ({ row }) => {
        const svcs = row.original.services || [];
        const active = svcs.filter((s: any) => s.identification?.serviceId === '300' || s.identification?.serviceId === '330');
        if (active.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="space-y-1 text-xs">
            {active.map((s: any, i: number) => {
              const type = s.identification?.serviceId === '300' ? 'SMS' : '3DS';
              return (
                <div key={i} className="whitespace-nowrap font-mono text-muted-foreground flex items-center gap-1">
                  <span>{s.extNumber}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-muted/30">
                    {type}
                  </Badge>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => {
        const card = row.original;
        const pinError = Number(card.details?.pinDenialCounter || 0) >= 3;
        return (
          <div className="flex flex-col gap-1 min-w-[150px]">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2 font-medium w-full"
              onClick={() => onOpenServices(card)}
            >
              <Phone className="size-3 mr-1 shrink-0" /> Уведомления
            </Button>
            
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7 px-1 font-medium"
                onClick={() => navigate('transactions', { cardId: card.cardId, clientId })}
              >
                <History className="size-3 mr-0.5 shrink-0" /> Ист.
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="bg-slate-700 hover:bg-slate-800 text-white text-[11px] h-7 px-1 font-medium"
                onClick={() => window.open(`http://10.64.1.10/services/tariff_by_idn.php?idn=${card.cardId}`, '_blank')}
              >
                Тариф
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7 px-1 font-medium"
                onClick={() => onOpenPin(card)}
              >
                <Key className="size-3 mr-0.5 shrink-0" /> ПИН
              </Button>

              {pinError ? (
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] h-7 px-1 font-medium"
                  onClick={() => onResetPin(card.cardId)}
                >
                  <RefreshCw className="size-3 mr-0.5 shrink-0" /> Сброс
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7 px-1 font-medium"
                  onClick={() => onOpenLimits(card)}
                >
                  Лимит
                </Button>
              )}
            </div>

            {card.details?.hotCardStatus === '0' ? (
              <Button
                size="sm"
                className="bg-bank-red hover:bg-bank-red/90 text-white text-[11px] h-7 px-2 font-medium w-full"
                onClick={() => onBlockCard(card.cardId)}
              >
                <Shield className="size-3 mr-1 shrink-0" /> Заблокировать
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] h-7 px-2 font-medium w-full"
                onClick={() => onUnblockCard(card.cardId)}
              >
                <Unlock className="size-3 mr-1 shrink-0" /> Разблокировать
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={10}
      isLoading={isLoading}
      emptyMessage="У клиента нет карт"
    />
  );
};
