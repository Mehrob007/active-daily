import React, { useState, KeyboardEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, CreditCard, Settings, DollarSign, Globe, Ban, Calendar, X } from 'lucide-react';
import { TransactionsSearchParams } from '../services/transactions-search-service';

interface TransactionsFilterProps {
  onSearch: (filters: TransactionsSearchParams) => void;
  isLoading: boolean;
  isLimitedAccess: boolean;
  initialCardId?: string;
}

export function TransactionsFilter({ onSearch, isLoading, isLimitedAccess, initialCardId }: TransactionsFilterProps) {
  // Filters state
  const [cardNumber, setCardNumber] = useState('');
  const [displayCardNumber, setDisplayCardNumber] = useState('');
  const [cardId, setCardId] = useState(initialCardId || '');
  const [atmId, setAtmId] = useState('');
  const [utrnno, setUtrnno] = useState('');
  const [mcc, setMcc] = useState('');
  const [responseCode, setResponseCode] = useState('');
  const [reqamt, setReqamt] = useState('');
  const [amount, setAmount] = useState('');
  const [conamt, setConamt] = useState('');
  const [acctbal, setAcctbal] = useState('');
  const [netbal, setNetbal] = useState('');
  const [currency, setCurrency] = useState('');
  const [conCurrency, setConCurrency] = useState('');
  const [reversal, setReversal] = useState('');
  const [account, setAccount] = useState('');
  const [excludeTransactionTypes, setExcludeTransactionTypes] = useState('');
  const [excludeAtmIds, setExcludeAtmIds] = useState('');
  const [excludeMcc, setExcludeMcc] = useState('');
  const [excludeAccounts, setExcludeAccounts] = useState('');
  
  // Date and Time
  const initFromDate = new Date();
  initFromDate.setDate(initFromDate.getDate() - 30);
  const [fromDate, setFromDate] = useState(initFromDate.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

  // Transaction Types Tags
  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);
  const [tagInputVal, setTagInputVal] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayCardNumber(raw);
    setCardNumber(raw.replace(/\s/g, ''));
  };

  const addTag = (raw: string) => {
    const newTags = raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    if (!newTags.length) return;
    setTransactionTypes(prev => Array.from(new Set([...prev, ...newTags])));
    setTagInputVal('');
  };

  const removeTag = (idx: number) => {
    setTransactionTypes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      addTag(tagInputVal);
    } else if (e.key === 'Backspace' && !tagInputVal && transactionTypes.length) {
      removeTag(transactionTypes.length - 1);
    }
  };

  const handleSearchClick = () => {
    const params: TransactionsSearchParams = {};
    if (cardNumber) params.cardNumber = cardNumber;
    if (cardId) params.cardId = cardId;
    if (atmId) params.atmId = atmId;
    if (utrnno) params.utrnno = Number(utrnno);
    if (transactionTypes.length > 0) params.transactionTypes = transactionTypes;
    if (mcc) params.mcc = Number(mcc);
    if (responseCode) params.responseCode = responseCode;
    if (reqamt) params.reqamt = Number(reqamt);
    if (amount) params.amount = Number(amount);
    if (conamt) params.conamt = Number(conamt);
    if (acctbal) params.acctbal = Number(acctbal);
    if (netbal) params.netbal = Number(netbal);
    if (currency) params.currency = Number(currency);
    if (conCurrency) params.conCurrency = Number(conCurrency);
    if (reversal) params.reversal = Number(reversal);
    if (account) params.account = account;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (fromTime) params.fromTime = fromTime;
    if (toTime) params.toTime = toTime;
    if (excludeTransactionTypes) params.excludeTransactionTypes = excludeTransactionTypes;
    if (excludeAtmIds) params.excludeAtmIds = excludeAtmIds;
    if (excludeMcc) params.excludeMcc = excludeMcc;
    if (excludeAccounts) params.excludeAccounts = excludeAccounts;

    onSearch(params);
  };

  const clearFilters = () => {
    setCardNumber('');
    setDisplayCardNumber('');
    if (!isLimitedAccess) setCardId('');
    setAtmId('');
    setUtrnno('');
    setMcc('');
    setResponseCode('');
    setReqamt('');
    setAmount('');
    setConamt('');
    setAcctbal('');
    setNetbal('');
    setCurrency('');
    setConCurrency('');
    setReversal('');
    setAccount('');
    setTransactionTypes([]);
    setExcludeTransactionTypes('');
    setExcludeAtmIds('');
    setExcludeMcc('');
    setExcludeAccounts('');
    setFromTime('');
    setToTime('');
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  };

  return (
    <Card className="border-slate-200 shadow-sm mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Identifiers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-indigo-500" /> Идентификаторы
            </h3>
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="space-y-1.5">
                <Label htmlFor="cardNumber" className="text-xs font-medium text-slate-500">Номер карты</Label>
                <Input id="cardNumber" value={displayCardNumber} onChange={handleCardNumberChange} disabled={isLoading} placeholder="**** **** **** ****" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cardId" className="text-xs font-medium text-slate-500">ID карты</Label>
                <Input id="cardId" value={cardId} onChange={(e) => setCardId(e.target.value)} disabled={isLoading || isLimitedAccess} placeholder="Идентификатор карты" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="atmId" className="text-xs font-medium text-slate-500">ATM ID</Label>
                <Input id="atmId" value={atmId} onChange={(e) => setAtmId(e.target.value)} disabled={isLoading} placeholder="Терминал" className="h-9" />
              </div>
            </div>
          </div>

          {/* Operation params */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Settings className="mr-2 h-4 w-4 text-emerald-500" /> Параметры операции
            </h3>
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="space-y-1.5">
                <Label htmlFor="utrnno" className="text-xs font-medium text-slate-500">UTRNNO</Label>
                <Input id="utrnno" value={utrnno} onChange={(e) => setUtrnno(e.target.value)} disabled={isLoading} placeholder="Номер операции" className="h-9" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500">Типы транзакций</Label>
                <div className={`flex flex-wrap gap-1.5 items-center p-1.5 border rounded-md min-h-[36px] bg-white ${isLoading ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-1 focus-within:ring-ring'}`}>
                  {transactionTypes.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 rounded px-1.5 py-0.5 text-xs font-medium">
                      {tag}
                      {!isLoading && (
                        <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-800">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {!isLoading && (
                    <input
                      className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder:text-muted-foreground px-1"
                      value={tagInputVal}
                      onChange={(e) => setTagInputVal(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => tagInputVal.trim() && addTag(tagInputVal)}
                      placeholder={transactionTypes.length === 0 ? "313, 760..." : ""}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mcc" className="text-xs font-medium text-slate-500">MCC</Label>
                <Input id="mcc" value={mcc} onChange={(e) => setMcc(e.target.value)} disabled={isLoading} placeholder="MCC код" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="responseCode" className="text-xs font-medium text-slate-500">Response code</Label>
                <Input id="responseCode" value={responseCode} onChange={(e) => setResponseCode(e.target.value)} disabled={isLoading} placeholder="-1, 01, 02..." className="h-9" />
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-amber-500" /> Суммы
            </h3>
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reqamt" className="text-xs font-medium text-slate-500">Запрош. сумма</Label>
                  <Input type="number" id="reqamt" value={reqamt} onChange={(e) => setReqamt(e.target.value)} disabled={isLoading} placeholder="reqamt" className="h-9" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-xs font-medium text-slate-500">Сумма опер.</Label>
                  <Input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isLoading} placeholder="amount" className="h-9" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="conamt" className="text-xs font-medium text-slate-500">Сумма в валюте</Label>
                  <Input type="number" id="conamt" value={conamt} onChange={(e) => setConamt(e.target.value)} disabled={isLoading} placeholder="conamt" className="h-9" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acctbal" className="text-xs font-medium text-slate-500">Доступ. баланс</Label>
                  <Input type="number" id="acctbal" value={acctbal} onChange={(e) => setAcctbal(e.target.value)} disabled={isLoading} placeholder="acctbal" className="h-9" min="0" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="netbal" className="text-xs font-medium text-slate-500">Баланс карты</Label>
                <Input type="number" id="netbal" value={netbal} onChange={(e) => setNetbal(e.target.value)} disabled={isLoading} placeholder="netbal" className="h-9" min="0" />
              </div>
            </div>
          </div>

          {/* Currencies & Others */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Globe className="mr-2 h-4 w-4 text-blue-500" /> Валюты и прочее
            </h3>
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="text-xs font-medium text-slate-500">Валюта (код)</Label>
                  <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={isLoading} placeholder="972, 840..." className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="conCurrency" className="text-xs font-medium text-slate-500">Валюта конверс.</Label>
                  <Input id="conCurrency" value={conCurrency} onChange={(e) => setConCurrency(e.target.value)} disabled={isLoading} placeholder="972, 978..." className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reversal" className="text-xs font-medium text-slate-500">Reversal (0/1)</Label>
                  <Input id="reversal" value={reversal} onChange={(e) => setReversal(e.target.value)} disabled={isLoading} placeholder="0 или 1" maxLength={1} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account" className="text-xs font-medium text-slate-500">Счет</Label>
                  <Input id="account" value={account} onChange={(e) => setAccount(e.target.value)} disabled={isLoading} placeholder="Номер счета" className="h-9" />
                </div>
              </div>
            </div>
          </div>

          {/* Exceptions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Ban className="mr-2 h-4 w-4 text-red-500" /> Исключения
            </h3>
            <div className="space-y-3 bg-red-50/50 p-4 rounded-lg border border-red-100">
              <div className="space-y-1.5">
                <Label htmlFor="excludeTransactionTypes" className="text-xs font-medium text-slate-500">Искл. типы транз.</Label>
                <Input id="excludeTransactionTypes" value={excludeTransactionTypes} onChange={(e) => setExcludeTransactionTypes(e.target.value)} disabled={isLoading} placeholder="659, 760..." className="h-9 bg-white border-red-200" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="excludeAtmIds" className="text-xs font-medium text-slate-500">Искл. ATM ID</Label>
                <Input id="excludeAtmIds" value={excludeAtmIds} onChange={(e) => setExcludeAtmIds(e.target.value)} disabled={isLoading} placeholder="ATM1, ATM2..." className="h-9 bg-white border-red-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="excludeMcc" className="text-xs font-medium text-slate-500">Искл. MCC</Label>
                  <Input id="excludeMcc" value={excludeMcc} onChange={(e) => setExcludeMcc(e.target.value)} disabled={isLoading} placeholder="6011..." className="h-9 bg-white border-red-200" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="excludeAccounts" className="text-xs font-medium text-slate-500">Искл. счета</Label>
                  <Input id="excludeAccounts" value={excludeAccounts} onChange={(e) => setExcludeAccounts(e.target.value)} disabled={isLoading} placeholder="Номера счетов" className="h-9 bg-white border-red-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-teal-500" /> Период
            </h3>
            <div className="space-y-3 bg-teal-50/30 p-4 rounded-lg border border-teal-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fromDate" className="text-xs font-medium text-slate-500">Дата с</Label>
                  <Input type="date" id="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} disabled={isLoading} className="h-9 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="toDate" className="text-xs font-medium text-slate-500">Дата по</Label>
                  <Input type="date" id="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} disabled={isLoading} className="h-9 bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fromTime" className="text-xs font-medium text-slate-500">Время с</Label>
                  <Input type="time" id="fromTime" value={fromTime} onChange={(e) => setFromTime(e.target.value)} disabled={isLoading} className="h-9 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="toTime" className="text-xs font-medium text-slate-500">Время по</Label>
                  <Input type="time" id="toTime" value={toTime} onChange={(e) => setToTime(e.target.value)} disabled={isLoading} className="h-9 bg-white" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSearchClick} disabled={isLoading} className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Поиск..." : "Найти транзакции"}
          </Button>
          <Button onClick={clearFilters} disabled={isLoading} variant="outline" className="flex-1 sm:flex-none w-full sm:w-auto">
            Очистить фильтры
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
