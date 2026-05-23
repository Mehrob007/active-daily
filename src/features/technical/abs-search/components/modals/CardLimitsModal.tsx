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

interface CardLimitsModalProps {
  cardId: string | null;
  onClose: () => void;
}

export const CardLimitsModal: React.FC<CardLimitsModalProps> = ({ cardId, onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cardId) {
      setIsLoading(true);
      absService.getCardLimits(cardId)
        .then(setData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [cardId]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'limitType', header: 'Тип лимита' },
    { accessorKey: 'limitValue', header: 'Значение' },
    { accessorKey: 'period', header: 'Период' },
    { accessorKey: 'remaining', header: 'Остаток' },
  ];

  return (
    <Dialog open={!!cardId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Лимиты по карте {cardId}</DialogTitle>
        </DialogHeader>
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          pageSize={10}
        />
      </DialogContent>
    </Dialog>
  );
};
