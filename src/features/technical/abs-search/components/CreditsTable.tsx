import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/banking';
import { Button } from '@/components/ui/button';
import { Credit } from '../types';

interface CreditsTableProps {
  data: Credit[];
  isLoading: boolean;
  onOpenGraph: (referenceId: string) => void;
  onOpenDetails: (referenceId: string) => void;
  onOpenRepay: (credit: Credit) => void;
}

export const CreditsTable: React.FC<CreditsTableProps> = ({
  data,
  isLoading,
  onOpenGraph,
  onOpenDetails,
  onOpenRepay,
}) => {
  const columns: ColumnDef<Credit>[] = [
    { accessorKey: 'contractNumber', header: 'Номер договора' },
    { accessorKey: 'amount', header: 'Сумма' },
    { accessorKey: 'currency', header: 'Валюта' },
    { accessorKey: 'statusName', header: 'Статус' },
    { accessorKey: 'productName', header: 'Продукт' },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => {
        const credit = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => credit.referenceId && onOpenGraph(credit.referenceId)}>
              График
            </Button>
            <Button size="sm" variant="outline" onClick={() => credit.referenceId && onOpenDetails(credit.referenceId)}>
              Детали
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenRepay(credit)}>
              Погасить
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={10}
      isLoading={isLoading}
      emptyMessage="У клиента нет кредитов"
    />
  );
};
