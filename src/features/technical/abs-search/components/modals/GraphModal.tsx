import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/banking';
import { absService } from '../../services/abs-service';
import { ColumnDef } from '@tanstack/react-table';

interface GraphModalProps {
  referenceId: string | null;
  onClose: () => void;
}

export const GraphModal: React.FC<GraphModalProps> = ({ referenceId, onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (referenceId) {
      setIsLoading(true);
      absService.getCreditGraphs(referenceId)
        .then(setData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [referenceId]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'payDate', header: 'Дата' },
    { accessorKey: 'amount', header: 'Сумма' },
    { accessorKey: 'mainAmount', header: 'Основной долг' },
    { accessorKey: 'percentAmount', header: 'Проценты' },
    { accessorKey: 'balance', header: 'Остаток' },
  ];

  return (
    <Dialog open={!!referenceId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>График платежей по кредиту {referenceId}</DialogTitle>
        </DialogHeader>
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          pageSize={12}
        />
      </DialogContent>
    </Dialog>
  );
};
