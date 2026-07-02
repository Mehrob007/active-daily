import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface AbsStatementTableProps {
  data: any[];
  loading: boolean;
}

export function AbsStatementTable({ data, loading }: AbsStatementTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 border rounded-md">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
        <span className="text-slate-500">Загрузка выписки из АБС...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 border rounded-md">
        <span className="text-slate-500">Нет данных для отображения в выписке</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 overflow-x-auto h-[600px] relative">
      <Table className="min-w-max">
        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Дата операции (DOPER)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Дата документа (DOCDOPER)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Время (EXECDT)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Описание (TXTDSCR)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Дебет (MOVD)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Кредит (MOVC)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Баланс (SumBalOut)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Валютная дата (DVAL)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Референс (REFER)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Номер документа (NUMDOC)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Клиент корр. (CLIENTCOR)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Счет корр. (ACCCOR)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Банк корр. (NAMEBCR)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">Курс (kurs)</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">CMSFL</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">KNP</TableHead>
            <TableHead className="whitespace-nowrap font-medium text-slate-700">TXT_BUCH</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tx, idx) => (
            <TableRow key={idx} className="hover:bg-slate-50/50">
              <TableCell className="whitespace-nowrap">{tx.doper || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.DOCDOPER || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.EXECDT || 'N/A'}</TableCell>
              <TableCell className="max-w-[300px] truncate" title={tx.TXTDSCR}>{tx.TXTDSCR || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap font-medium text-red-600">{tx.MOVD || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap font-medium text-emerald-600">{tx.MOVC || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap font-semibold">{tx.sumBalOut || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.DVAL || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.REFER || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.NUMDOC || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.CLIENTCOR || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.ACCCOR || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap max-w-[200px] truncate" title={tx.NAMEBCR}>{tx.NAMEBCR || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.kurs || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.CMSFL || 'N/A'}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.KNP || 'N/A'}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={tx.TXT_BUCH}>{tx.TXT_BUCH || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
