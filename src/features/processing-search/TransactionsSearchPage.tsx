'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as xlsx from 'xlsx';

import { PageContainer } from '@/widgets/page-container/PageContainer';
import { TransactionsFilter } from './components/TransactionsFilter';
import { TransactionsChart } from './components/TransactionsChart';
import { TransactionsTable } from './components/TransactionsTable';

import {
  ProcessingTransaction,
  TransactionsSearchParams,
  fetchTransactionsSearch,
  getCurrencyCode
} from './services/transactions-search-service';
import { conversionService } from '@/features/agent-qr/services/conversion-service';
import { getTransactionTypeValue } from './utils/dataTrans';

export function TransactionsSearchPage({ initialCardId }: { initialCardId?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<ProcessingTransaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, EUR: 1, RUB: 1 });
  
  // Dummy logic for limited access based on your rules, just passing false for now
  const isLimitedAccess = false; 

  useEffect(() => {
    // Fetch initial conversion rates
    loadConversionRates();
  }, []);

  const loadConversionRates = async () => {
    try {
      const ratesData = await conversionService.fetchConversionRates();
      const newRates = { USD: 1, EUR: 1, RUB: 1 };
      
      ratesData.forEach((r) => {
        if (r.type === 'from' && r.currencyTo === 'TJS') {
          if (r.currencyFrom === 'USD') newRates.USD = r.amountTo / r.amount;
          if (r.currencyFrom === 'EUR') newRates.EUR = r.amountTo / r.amount;
          if (r.currencyFrom === 'RUB') newRates.RUB = r.amountTo / r.amount;
        }
      });
      setExchangeRates(newRates);
    } catch (err) {
      console.error('Failed to load conversion rates', err);
    }
  };

  const handleSearch = async (params: TransactionsSearchParams) => {
    setIsLoading(true);
    setTransactions([]);
    
    try {
      const results = await fetchTransactionsSearch(params);
      
      // Process results to append nationalAmount
      const processed = results.map(tx => {
        let nationalAmount = tx.amount;
        if (tx.currency !== 972) {
          const isUSD = tx.conCurrency === 840;
          const isEUR = tx.conCurrency === 978;
          const isRUB = tx.conCurrency === 643;
          const rate = isUSD ? exchangeRates.USD : isEUR ? exchangeRates.EUR : isRUB ? exchangeRates.RUB : 1;
          nationalAmount = Math.round((tx.conamt || 0) * rate);
        }
        return {
          ...tx,
          transactionTypeNumber: Number(tx.transactionType),
          nationalAmount
        };
      });

      // Optionally filter by transaction types mapped value if we had that logic
      // In the old code, it filtered by getTransactionTypeValue, but the API might do it now.
      
      setTransactions(processed);
      if (processed.length === 0) {
        toast.info("По заданным критериям не найдено транзакций.");
      } else {
        toast.success(`Найдено ${processed.length} транзакций`);
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка при поиске транзакций");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const exportData = transactions.map((t) => {
      const isUSD = t.conCurrency === 840;
      const isEUR = t.conCurrency === 978;
      const isRUB = t.conCurrency === 643;
      const rate = isUSD ? exchangeRates.USD : isEUR ? exchangeRates.EUR : isRUB ? exchangeRates.RUB : 1;
      const amountTJS = Math.round((t.conamt || 0) * rate);

      return {
        Дата: t.localTransactionDate || "",
        Время: t.localTransactionTime || "",
        Статус: t.responseDescription || "",
        "Код ответа": t.responseCode || "",
        "Reversal (0/1)": t.reversal || 0,
        "Номер карты": t.cardNumber || "",
        "ID карты": t.cardId || "",
        "Тип операции": t.transactionTypeName || "",
        "Код операции": t.transactionType || "",
        "Сумма (валюта)": t.amount || 0,
        Валюта: getCurrencyCode(t.currency),
        "Сумма в валюте карты": t.conamt || 0,
        "Валюта карты": getCurrencyCode(t.conCurrency),
        "Доступный баланс": t.acctbal || 0,
        "Баланс карты": t.netbal || 0,
        "Сумма в TJS": amountTJS,
        "UTRNNO (ПЦ)": t.utrnno || "",
        "ID терминала": t.terminalId || "",
        "ID ATM": t.atmId || "",
        "Запрошенная сумма": t.reqamt || 0,
        "Адрес терминала": t.terminalAddress || "",
        "MCC код": t.mcc || "",
        Счет: t.account || "",
        "ID транзакции": t.id || "",
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Транзакции");
    xlsx.writeFile(workbook, "Transactions_Search.xlsx");
  };

  return (
    <PageContainer
      title="Поиск транзакций"
      description="Универсальный поиск по транзакциям процессинга"
      breadcrumb={[
        { label: 'Главная', href: '/' },
        { label: 'Поиск по процессингу' },
        { label: 'Поиск транзакций' },
      ]}
    >
      <div className="space-y-6">
        <TransactionsFilter 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          isLimitedAccess={isLimitedAccess}
          initialCardId={initialCardId}
        />

        <TransactionsChart transactions={transactions} />

        {transactions.length > 0 && (
          <TransactionsTable 
            transactions={transactions} 
            exchangeRates={exchangeRates} 
            onExport={handleExport} 
          />
        )}
      </div>
    </PageContainer>
  );
}
