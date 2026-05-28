import React, { useState } from 'react';
import { Credit } from '../types';
import { CreditCardItem } from './CreditCardItem';

interface CreditsTableProps {
  data: Credit[];
  isLoading: boolean;
  onOpenGraph: (referenceId: string) => void;
  onOpenDetails: (referenceId: string) => void;
  onOpenRepay: (credit: Credit) => void;
}

const STATUS_FILTERS = ['Все', 'Актуален', 'Закрыт', 'Закрыт досрочно'];

export const CreditsTable: React.FC<CreditsTableProps> = ({
  data,
  isLoading,
  onOpenGraph,
  onOpenDetails,
  onOpenRepay,
}) => {
  const [filter, setFilter] = useState('Все');

  const filteredData = data.filter((credit) => {
    if (filter === 'Все') return true;
    return credit.statusName?.toLowerCase() === filter.toLowerCase();
  });

  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground">Загрузка кредитов...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#b91c1c] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards List */}
      {filteredData.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground bg-white rounded-3xl">
          У клиента нет кредитов {filter !== 'Все' ? `со статусом "${filter}"` : ''}
        </div>
      ) : (
        <div className="flex flex-col gap-4 bg-slate-200/50 p-6 rounded-3xl">
          {filteredData.map((credit, idx) => (
            <CreditCardItem 
              key={credit.contractNumber || idx} 
              credit={credit} 
              onOpenDetails={onOpenDetails} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
