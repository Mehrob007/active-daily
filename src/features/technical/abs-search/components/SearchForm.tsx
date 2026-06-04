import React, { useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Info } from 'lucide-react';
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
  const selectedOpt = TYPE_SEARCH_CLIENT.find(opt => opt.value === searchType);
  const isApiMissing = selectedOpt?.disabled || false;

  
  useEffect(() => {
    if (!selectedOpt) return;
    const type = selectedOpt.type;
    
    let val = searchQuery;
    if (type === 'phone' || type === 'inn' || type === 'account' || type === 'card4' || type === 'cardId') {
      val = val.replace(/\D/g, '');
    } else if (type === 'code') {
      val = val.replace(/[^0-9.]/g, '');
    }
    
    if (type === 'inn') {
      val = val.slice(0, 9);
    } else if (type === 'account') {
      val = val.slice(0, 20);
    } else if (type === 'card4') {
      val = val.slice(0, 4);
    }

    if (val !== searchQuery) {
      setSearchQuery(val);
    }
  }, [searchType, selectedOpt, searchQuery, setSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!selectedOpt) return;
    const type = selectedOpt.type;

    if (type === 'phone' || type === 'inn' || type === 'account' || type === 'card4' || type === 'cardId') {
      val = val.replace(/\D/g, '');
    } else if (type === 'code') {
      val = val.replace(/[^0-9.]/g, '');
    }

    if (type === 'inn') {
      val = val.slice(0, 9);
    } else if (type === 'account') {
      val = val.slice(0, 20);
    } else if (type === 'card4') {
      val = val.slice(0, 4);
    }

    setSearchQuery(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSearchDisabled) {
      onSearch();
    }
  };

  const getValidationFeedback = () => {
    if (!selectedOpt) return null;
    const type = selectedOpt.type;
    const len = searchQuery.length;

    if (len === 0) return null;

    if (type === 'phone') {
      if (len < 9) return { isValid: false, text: "Слишком короткий номер. Минимальная длина — 9 цифр." };
      if (len > 12) return { isValid: false, text: "Слишком длинный номер. Максимальная длина — 12 цифр." };
      if (len === 12 && !searchQuery.startsWith('992')) return { isValid: true, text: "Рекомендуется вводить номер в формате 992XXXXXXXXX", isWarning: true };
      return { isValid: true, text: "Формат номера телефона корректен" };
    }

    if (type === 'inn') {
      if (len < 9) return { isValid: false, text: `ИНН должен состоять из 9 цифр (введено: ${len}/9).` };
      return { isValid: true, text: "ИНН заполнен корректно" };
    }

    if (type === 'account') {
      if (len < 20) return { isValid: false, text: `Номер счета должен состоять из 20 цифр (введено: ${len}/20).` };
      return { isValid: true, text: "Номер счета заполнен корректно" };
    }

    return null;
  };

  const feedback = getValidationFeedback();

  const isSearchDisabled =
    !searchQuery.trim() ||
    isSearching ||
    isApiMissing ||
    (selectedOpt?.type === 'inn' && searchQuery.length !== 9) ||
    (selectedOpt?.type === 'account' && searchQuery.length !== 20) ||
    (selectedOpt?.type === 'phone' && (searchQuery.length < 9 || searchQuery.length > 12));

  return (
    <div className="mb-6 space-y-4">
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Тип поиска
        </Label>
        <div className="flex flex-wrap gap-2">
          {TYPE_SEARCH_CLIENT.map((opt) => {
            const isActive = searchType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSearchType(opt.value)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-bank-red bg-bank-active text-bank-red shadow-sm'
                    : opt.disabled
                    ? 'border-border/40 bg-slate-50/50 text-muted-foreground/60 cursor-not-allowed hover:bg-slate-50/50'
                    : 'border-border/60 bg-white text-muted-foreground hover:bg-slate-50 hover:text-foreground'
                }`}
              >
                {opt.label}
                {opt.disabled && (
                  <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-muted-foreground/80 font-normal">нет API</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2" />
            <Input
              placeholder={selectedOpt?.placeholder || "Введите данные для поиска..."}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isApiMissing}
              className={`h-12 pl-11 pr-4 text-base transition-all duration-200 border-2 ${
                isApiMissing 
                  ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                  : feedback && !feedback.isValid
                  ? 'border-destructive/60 focus-visible:ring-destructive'
                  : feedback && feedback.isValid && !feedback.isWarning
                  ? 'border-emerald-500/60 focus-visible:ring-emerald-500'
                  : 'border-border/60 focus-visible:ring-bank-red'
              }`}
            />
          </div>
          <Button
            onClick={onSearch}
            disabled={isSearchDisabled}
            className={`h-12 gap-2 bg-bank-red px-8 text-white hover:bg-bank-red/90 shrink-0 transition-all ${
              isSearchDisabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'
            }`}
          >
            {isSearching ? 'Поиск...' : 'Найти'}
          </Button>
        </div>

        {}
        {feedback && (
          <div className={`text-sm flex items-center gap-1.5 mt-1 animate-in fade-in duration-200 ${
            feedback.isWarning 
              ? 'text-amber-600' 
              : feedback.isValid 
              ? 'text-emerald-600' 
              : 'text-destructive'
          }`}>
            {feedback.isValid ? (
              feedback.isWarning ? (
                <Info className="size-4 shrink-0" />
              ) : (
                <CheckCircle className="size-4 shrink-0" />
              )
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {}
        {isApiMissing && (
          <div className="rounded-xl bg-amber-50/50 border border-amber-200/80 p-4 text-sm text-amber-900 flex items-start gap-3 mt-2 animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-800">Функция временно недоступна</p>
              <p className="text-xs text-amber-700/90 leading-relaxed">
                Для этого метода поиска (<strong>{selectedOpt?.label}</strong>) на бэкенде отсутствует API-интеграция. Пожалуйста, используйте поиск по мобильному номеру, ИНН, коду клиента или номеру счета.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
