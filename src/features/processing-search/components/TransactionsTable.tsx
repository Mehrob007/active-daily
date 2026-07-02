import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProcessingTransaction, getCurrencyCode } from '../services/transactions-search-service';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionsTableProps {
  transactions: ProcessingTransaction[];
  exchangeRates: { USD: number; EUR: number; RUB: number };
  onExport: () => void;
}

const formatAmount = (value: any) => {
  if (value == null || isNaN(Number(value))) return "0";
  return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const formatCardNumber = (cardNumber: string) => {
  if (!cardNumber) return '';
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
};

export function TransactionsTable({ transactions, exchangeRates, onExport }: TransactionsTableProps) {

  const getStatusBadge = (responseCode: string, reversal: number, responseDescription: string) => {
    if (reversal === 1) {
      return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300">Reversal</Badge>;
    }
    const code = parseInt(responseCode, 10);
    if (code === 0) {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Успешно</Badge>;
    }
    if (code > 0 && code < 100) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" title={responseDescription}>Ошибка: {code}</Badge>;
    }
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200" title={responseDescription}>Ожидание: {code}</Badge>;
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Найденные транзакции ({transactions.length})
        </CardTitle>
        <Button onClick={onExport} variant="outline" size="sm" className="h-8">
          <Download className="mr-2 h-4 w-4" />
          Экспорт в Excel
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px] relative">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">Дата</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">Статус</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">Номер карты</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">ID карты</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">Тип операции</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600 text-right">Сумма (валюта)</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600 text-right">Сумма в вал. карты</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600 text-right">Дост. баланс</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600 text-right">Сумма в TJS</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">UTRNNO</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">ID терминала</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">ID ATM</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">Запрош. сумма</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">Адрес терминала</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">MCC</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">Счет</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-slate-600">ID транзакции</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const isUSD = tx.conCurrency === 840;
                const isEUR = tx.conCurrency === 978;
                const isRUB = tx.conCurrency === 643;
                const rate = isUSD ? exchangeRates.USD : isEUR ? exchangeRates.EUR : isRUB ? exchangeRates.RUB : 1;
                const amountTJS = Math.round((tx.conamt || 0) * rate);

                return (
                  <TableRow key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="whitespace-nowrap text-sm text-slate-600">
                      {tx.localTransactionDate || "N/A"}<br/>
                      <span className="text-slate-400 text-xs">{tx.localTransactionTime || ""}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tx.responseCode, tx.reversal, tx.responseDescription)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-700 whitespace-nowrap">
                      {tx.cardNumber ? formatCardNumber(tx.cardNumber) : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{tx.cardId || "N/A"}</TableCell>
                    <TableCell className="text-sm text-slate-700 max-w-[200px] truncate" title={tx.transactionTypeName}>
                      {tx.transactionTypeName || "N/A"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap font-medium text-slate-700">
                      {formatAmount(tx.amount)} <span className="text-xs text-slate-500">{getCurrencyCode(tx.currency)}</span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap font-medium text-slate-700">
                      {formatAmount(tx.conamt)} <span className="text-xs text-slate-500">{getCurrencyCode(tx.conCurrency)}</span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap text-sm text-slate-600">
                      {formatAmount(tx.acctbal)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap font-semibold text-indigo-700 bg-indigo-50/30">
                      {formatAmount(amountTJS)} <span className="text-xs">TJS</span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{tx.utrnno || "N/A"}</TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{tx.terminalId || "N/A"}</TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{tx.atmId || "N/A"}</TableCell>
                    <TableCell className="text-right whitespace-nowrap text-sm text-slate-600">{formatAmount(tx.reqamt)}</TableCell>
                    <TableCell className="text-sm text-slate-600 min-w-[150px] truncate" title={tx.terminalAddress}>{tx.terminalAddress || "N/A"}</TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{tx.mcc || "N/A"}</TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{tx.account || "N/A"}</TableCell>
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">{tx.id}</TableCell>
                  </TableRow>
                )
              })}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={17} className="h-32 text-center text-slate-500">
                    Нет данных для отображения
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
