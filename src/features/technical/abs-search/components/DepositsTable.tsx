import React, { useState, useMemo } from 'react';
import { Deposit } from '../types';
import { DepositCard } from './DepositCard';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface DepositsTableProps {
  data: Deposit[];
  isLoading: boolean;
  onOpenDetails: (deposit: Deposit) => void;
}

type FilterStatus = 'all' | 'ACTUAL' | 'CLOSED' | 'CLOSED_EARLY';

export const DepositsTable: React.FC<DepositsTableProps> = ({ data, isLoading, onOpenDetails }) => {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredDeposits = useMemo(() => {
    if (activeFilter === 'all') return data;
    return data.filter(d => d.AgreementData?.Status?.Code === activeFilter);
  }, [data, activeFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <div className="relative">
           <div className="size-16 rounded-full border-4 border-slate-100 border-t-bank-red animate-spin" />
           <Search className="absolute inset-0 m-auto size-6 text-slate-300" />
        </div>
        <p className="mt-4 text-slate-500 font-medium uppercase tracking-widest text-xs">Поиск депозитов в АБС...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <h3 className="text-lg font-bold text-slate-400">У клиента нет открытых депозитов</h3>
      </div>
    );
  }

  const filters = [
    { label: 'Все', value: 'all' as const },
    { label: 'Актуален', value: 'ACTUAL' as const },
    { label: 'Закрыт', value: 'CLOSED' as const },
    { label: 'Закрыт досрочно', value: 'CLOSED_EARLY' as const },
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={activeFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(f.value)}
            className={`rounded-full px-6 h-9 font-bold text-xs transition-all ${
              activeFilter === f.value 
                ? "bg-bank-red text-white hover:bg-bank-red/90 shadow-lg shadow-bank-red/20 border-transparent" 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 gap-4">
        {filteredDeposits.map((deposit, idx) => (
          <DepositCard 
            key={deposit.AgreementData?.Code || idx} 
            deposit={deposit}
            isSelected={selectedId === deposit.AgreementData?.Code}
            onClick={() => {
              setSelectedId(deposit.AgreementData?.Code || null);
              onOpenDetails(deposit);
            }}
          />
        ))}
      </div>

      {filteredDeposits.length === 0 && (
         <div className="py-20 text-center text-slate-400 border border-dashed rounded-3xl">
            По вашему фильтру ничего не найдено
         </div>
      )}
    </div>
  );
};
