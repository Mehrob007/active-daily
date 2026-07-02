import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomsTransaction } from '../../services/customs-service';
import { getPaymentStatus, formatDateForDisplay, CUSTOMS_COLUMNS_TRANSLATION } from '../../utils/customs-utils';
import { ArrowUpDown, Loader2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface CustomsDataTableProps {
  data: CustomsTransaction[];
  loading: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  selectedRows: (string | number)[];
  onToggleSelect: (id: string | number, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean) => void;
  payingIds: Set<string | number>;
  onPaySingle: (row: CustomsTransaction) => void;
}

export function CustomsDataTable({
  data,
  loading,
  sortField,
  sortDirection,
  onSort,
  selectedRows,
  onToggleSelect,
  onToggleSelectAll,
  payingIds,
  onPaySingle,
}: CustomsDataTableProps) {
  
  const tableHeaders = useMemo(() => {
    if (data.length === 0) return [];
    const firstRow = data[0];
    const excludedHeaders = ['payedAt', 'isPayed', 'errorMsg'];
    const allKeys = Object.keys(firstRow).filter((header) => !excludedHeaders.includes(header));

    const orderedKeys = [];
    if (allKeys.includes('id')) orderedKeys.push('id');
    if (allKeys.includes('status')) orderedKeys.push('status');
    if (allKeys.includes('statusABS')) orderedKeys.push('statusABS');
    
    allKeys.forEach((key) => {
      if (key !== 'id' && key !== 'status' && key !== 'statusABS') {
        orderedKeys.push(key);
      }
    });

    return orderedKeys;
  }, [data]);

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const renderStatus = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending') {
      return (
        <div className="flex items-center text-amber-500 font-medium">
          <Clock className="mr-2 h-4 w-4" /> Pending
        </div>
      );
    }
    if (s === 'success') {
      return (
        <div className="flex items-center text-emerald-600 font-medium">
          <CheckCircle2 className="mr-2 h-4 w-4" /> Success
        </div>
      );
    }
    if (s === 'failed') {
      return (
        <div className="flex items-center text-red-600 font-medium">
          <XCircle className="mr-2 h-4 w-4" /> Failed
        </div>
      );
    }
    return (
      <div className="flex items-center text-slate-500">
        <AlertCircle className="mr-2 h-4 w-4" /> {status}
      </div>
    );
  };

  const renderStatusABS = (statusABS: string | null | undefined, errorMsg?: string) => {
    const s = statusABS || 'Ожидает проверки';
    if (s === 'Оплачено в АБС') {
      return (
        <div className="flex items-center text-emerald-600 font-medium">
          <CheckCircle2 className="mr-2 h-4 w-4" /> Оплачено в АБС
        </div>
      );
    }
    if (s === 'Ошибка АБС') {
      return (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center text-red-600 font-medium">
            <XCircle className="mr-2 h-4 w-4" /> Ошибка АБС
          </div>
          {errorMsg && (
            <span className="text-xs text-red-500 max-w-[200px] break-words whitespace-normal font-normal">
              Ошибка: {errorMsg}
            </span>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center text-amber-500 font-medium">
        <Clock className="mr-2 h-4 w-4" /> Ожидает проверки
      </div>
    );
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 border rounded-md">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
        <span className="text-slate-500">Загрузка данных...</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader className="bg-slate-50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[50px] sticky left-0 z-20 bg-slate-50 border-r">
              <Checkbox
                checked={allSelected ? true : isIndeterminate ? 'indeterminate' : false}
                onCheckedChange={(checked) => onToggleSelectAll(!!checked)}
              />
            </TableHead>
            {tableHeaders.map((header) => (
              <TableHead key={header} className="whitespace-nowrap">
                <Button 
                   variant="ghost" 
                   onClick={() => onSort(header)} 
                   className="font-semibold px-2 hover:bg-transparent -ml-2 text-slate-700"
                >
                  {CUSTOMS_COLUMNS_TRANSLATION[header] || header}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            ))}
            <TableHead className="whitespace-nowrap font-semibold text-slate-700">Оплачено в</TableHead>
            <TableHead className="text-right whitespace-nowrap sticky right-0 bg-slate-50 z-20 border-l font-semibold text-slate-700">
              Действия
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={tableHeaders.length + 3} className="h-32 text-center text-slate-500">
                Нет данных для отображения
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const paymentStatus = getPaymentStatus(row);
              const isPaid = paymentStatus === 'already_paid' || paymentStatus === 'paid';
              const isPaying = payingIds.has(row.id);
              const absStatus = row.statusABS || 'Ожидает проверки';

              const rowBgClass = absStatus === 'Оплачено в АБС'
                ? 'bg-emerald-50/40 hover:bg-emerald-50/60 dark:bg-emerald-950/10'
                : (absStatus === 'Ожидает проверки' && isPaid)
                  ? 'bg-amber-50/30 hover:bg-amber-50/50 dark:bg-amber-950/5'
                  : 'hover:bg-slate-50/50';

              return (
                <TableRow 
                  key={row.id} 
                  className={rowBgClass}
                >
                  <TableCell className="sticky left-0 bg-inherit border-r z-10">
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked) => onToggleSelect(row.id, !!checked)}
                    />
                  </TableCell>
                  {tableHeaders.map((header) => {
                    let value = row[header];
                    
                    if (
                      header.toLowerCase().includes('date') ||
                      header === 'docDate' ||
                      header === 'dataOpr'
                    ) {
                      value = formatDateForDisplay(value as string);
                    } else if (header === 'status') {
                      return <TableCell key={header}>{renderStatus(value as string)}</TableCell>;
                    } else if (header === 'statusABS') {
                      return <TableCell key={header}>{renderStatusABS(value as string, row.errorMsg)}</TableCell>;
                    }
                    
                    return (
                      <TableCell key={header} className="whitespace-nowrap max-w-[200px] truncate" title={String(value || '')}>
                        {value}
                      </TableCell>
                    );
                  })}
                  <TableCell className="whitespace-nowrap text-sm">
                    {isPaid ? (
                      <div className="flex flex-col text-emerald-600 font-medium">
                        <span className="flex items-center"><CheckCircle2 className="mr-1 h-4 w-4"/> Оплачено</span>
                        <span className="text-xs text-slate-500 font-normal mt-1">{formatDateForDisplay(row.payedAt)}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right sticky right-0 bg-inherit border-l z-10">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (String(row.status).toLowerCase() === 'success') {
                          onPaySingle(row);
                        }
                      }}
                      disabled={
                        isPaying ||
                        (isPaid && absStatus === 'Оплачено в АБС') ||
                        (isPaid && absStatus === 'Ожидает проверки') ||
                        String(row.status).toLowerCase() !== 'success'
                      }
                      title={isPaid && absStatus === 'Ожидает проверки' ? 'Оплата уже отправлена, ожидаем подтверждения АБС' : undefined}
                      className={
                        (isPaid && absStatus === 'Оплачено в АБС')
                          ? 'bg-slate-100 text-slate-400 hover:bg-slate-100'
                          : (isPaid && absStatus === 'Ожидает проверки')
                            ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-50'
                            : 'bg-primary hover:bg-primary/90'
                      }
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Оплачивается...
                        </>
                      ) : (isPaid && absStatus === 'Оплачено в АБС') ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                          Оплачено
                        </>
                      ) : (isPaid && absStatus === 'Ожидает проверки') ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 text-amber-500 animate-pulse" />
                          Ожидает АБС...
                        </>
                      ) : (
                        'Оплатить'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
