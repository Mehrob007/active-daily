import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/banking';
import { Deposit } from '../types';

interface DepositsTableProps {
  data: Deposit[];
  isLoading: boolean;
}

export const DepositsTable: React.FC<DepositsTableProps> = ({ data, isLoading }) => {
  const columns: ColumnDef<Deposit>[] = [
    { 
      accessorKey: 'AgreementData.Code', 
      header: 'Номер договора', 
      cell: ({row}) => row.original?.AgreementData?.Code 
    },
    { 
      accessorKey: 'BalanceAccounts[0].Balance', 
      header: 'Остаток', 
      cell: ({row}) => row.original?.BalanceAccounts?.[0]?.Balance 
    },
    { 
      accessorKey: 'AgreementData.Status.Name', 
      header: 'Статус', 
      cell: ({row}) => row.original?.AgreementData?.Status?.Name 
    },
    { 
      accessorKey: 'AgreementData.Product.Name', 
      header: 'Продукт', 
      cell: ({row}) => row.original?.AgreementData?.Product?.Name 
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={10}
      isLoading={isLoading}
      emptyMessage="У клиента нет депозитов"
    />
  );
};
