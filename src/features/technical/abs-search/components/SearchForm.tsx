import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TYPE_SEARCH_CLIENT } from '../hooks/useAbsSearch';

interface SearchFormProps {
  searchType: string;
  setSearchType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  onSearch: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchType,
  setSearchType,
  searchQuery,
  setSearchQuery,
  isSearching,
  onSearch,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="mb-6 space-y-4">
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Тип поиска
        </Label>
        <div className="flex flex-wrap gap-2">
          {TYPE_SEARCH_CLIENT.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSearchType(opt.value)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                searchType === opt.value
                  ? 'border-bank-red bg-bank-active text-bank-red'
                  : 'border-border/60 bg-white text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2" />
          <Input
            placeholder="Введите данные для поиска..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 pl-11 text-base"
          />
        </div>
        <Button
          onClick={onSearch}
          disabled={!searchQuery.trim() || isSearching}
          className="h-12 gap-2 bg-bank-red px-8 text-white hover:bg-bank-red/90 shrink-0"
        >
          {isSearching ? 'Поиск...' : 'Найти'}
        </Button>
      </div>
    </div>
  );
};
