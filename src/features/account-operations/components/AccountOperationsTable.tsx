import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OperationTransaction } from '../services/account-operations-service';
import { ArrowUpDown } from 'lucide-react';

interface AccountOperationsTableProps {
  transactions: OperationTransaction[];
}

type SortKey = keyof OperationTransaction;

export const AccountOperationsTable: React.FC<AccountOperationsTableProps> = ({ transactions }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const formatAmount = (amount?: string) => {
    if (!amount) return "";
    const num = parseFloat(amount.replace(",", "."));
    if (isNaN(num)) return "";
    return num.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = React.useMemo(() => {
    if (!sortConfig) return transactions;

    return [...transactions].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      
      const numA = parseFloat(aStr.replace(',', '.'));
      const numB = parseFloat(bStr.replace(',', '.'));

      if (!isNaN(numA) && !isNaN(numB)) {
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, sortConfig]);

  const renderSortIcon = (key: SortKey) => {
    if (sortConfig?.key === key) {
      return (
        <ArrowUpDown 
          className={`ml-1 h-3 w-3 inline transition-transform ${
            sortConfig.direction === 'desc' ? 'rotate-180 text-primary' : 'text-primary'
          }`} 
        />
      );
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 inline text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

  const Th = ({ children, sortKey, className = "" }: { children: React.ReactNode, sortKey: SortKey, className?: string }) => (
    <TableHead 
      className={`cursor-pointer group hover:bg-muted/50 select-none ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {children}
        {renderSortIcon(sortKey)}
      </div>
    </TableHead>
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-md bg-muted/20">
        Нет данных для отображения
      </div>
    );
  }

  return (
    <div className="rounded-md border relative">
      <div className="overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <Th sortKey="DOCDOPER" className="whitespace-nowrap">Дата документа</Th>
              <Th sortKey="TXTDSCR" className="min-w-[200px]">Назначение</Th>
              <Th sortKey="MOVD" className="text-right justify-end whitespace-nowrap">Дебет</Th>
              <Th sortKey="MOVC" className="text-right justify-end whitespace-nowrap">Кредит</Th>
              <Th sortKey="CLIENTCOR" className="min-w-[150px]">Клиент корр.</Th>
              <Th sortKey="ACCCOR" className="whitespace-nowrap">Счет корр.</Th>
              <Th sortKey="NAMEBCR" className="min-w-[150px]">Банк корр.</Th>
              <Th sortKey="MOVDN" className="text-right justify-end whitespace-nowrap">Оборот по дебету</Th>
              <Th sortKey="MOVCN" className="text-right justify-end whitespace-nowrap">Оборот по кредиту</Th>
              <Th sortKey="doper" className="whitespace-nowrap">Дата операции</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((tx, idx) => (
              <TableRow key={`${tx.DOCDOPER}-${idx}`} className="hover:bg-muted/50">
                <TableCell className="whitespace-nowrap text-xs">
                  {tx.DOCDOPER || 'N/A'} {tx.EXECDT || ''}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{tx.TXTDSCR || 'N/A'}</TableCell>
                <TableCell className="text-right font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                  {formatAmount(tx.MOVD)}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                  {formatAmount(tx.MOVC)}
                </TableCell>
                <TableCell className="text-xs truncate max-w-[200px]" title={tx.CLIENTCOR}>{tx.CLIENTCOR || 'N/A'}</TableCell>
                <TableCell className="text-xs font-mono">{tx.ACCCOR || 'N/A'}</TableCell>
                <TableCell className="text-xs truncate max-w-[150px]" title={tx.NAMEBCR}>{tx.NAMEBCR || 'N/A'}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatAmount(tx.MOVDN)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatAmount(tx.MOVCN)}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{tx.doper || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-muted/30 border-t p-3 text-xs text-muted-foreground flex justify-between">
        <span>Всего записей: {transactions.length}</span>
        <span>Отображается: {sortedTransactions.length}</span>
      </div>
    </div>
  );
};
