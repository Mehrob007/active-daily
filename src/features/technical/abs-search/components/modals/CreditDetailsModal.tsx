import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { absService } from '../../services/abs-service';

interface CreditDetailsModalProps {
  referenceId: string | null;
  onClose: () => void;
}

export const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({ referenceId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (referenceId) {
      setIsLoading(true);
      absService.getLoanDetails(referenceId)
        .then(setData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [referenceId]);

  return (
    <Dialog open={!!referenceId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Детали кредита {referenceId}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-10 text-center">Загрузка...</div>
        ) : data ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(data).map(([key, value]: [string, any]) => (
              <div key={key} className="flex flex-col border-b pb-1">
                <span className="text-muted-foreground text-xs uppercase font-bold">{key}</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">Данные не найдены</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
