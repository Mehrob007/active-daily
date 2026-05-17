import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, StatusBadge } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Account } from '../types';

interface AccountsTableProps {
  data: Account[];
  isLoading: boolean;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({ data, isLoading }) => {
  const columns: ColumnDef<Account>[] = [
    { 
      accessorKey: 'Number', 
      header: 'Номер счёта', 
      cell: ({ row }) => <span className="font-mono">{row.getValue('Number')}</span> 
    },
    { 
      accessorKey: 'Balance', 
      header: 'Баланс', 
      cell: ({ row }) => <span className="font-semibold tabular-nums">{row.getValue('Balance')}</span> 
    },
    { 
      accessorKey: 'Currency.Code', 
      header: 'Валюта', 
      cell: ({ row }) => <Badge variant="outline">{row.original?.Currency?.Code}</Badge> 
    },
    { 
      accessorKey: 'Status.Name', 
      header: 'Статус', 
      cell: ({ row }) => <StatusBadge status={row.original?.Status?.Name === 'Открыт' ? 'active' : 'closed'} /> 
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={10}
      isLoading={isLoading}
      emptyMessage="У клиента нет счетов"
    />
  );
};
