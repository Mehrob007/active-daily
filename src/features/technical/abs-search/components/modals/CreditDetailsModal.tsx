import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { loanSoapService } from '../../services/loan-service';

interface CreditDetailsModalProps {
  referenceId: string | null;
  onClose: () => void;
}

export const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({ referenceId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [arrayData, setArrayData] = useState<{ title: string; data: any[] } | null>(null);

  useEffect(() => {
    if (referenceId) {
      const timer = setTimeout(() => {
        setIsLoading(true);
        loanSoapService.getLoanDetails(referenceId)
          .then(setData)
          .catch(console.error)
          .finally(() => setIsLoading(false));
      }, 0);
      return () => clearTimeout(timer);
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
                {Array.isArray(value) ? (
                  <button 
                    onClick={() => setArrayData({ title: key, data: value })}
                    className="text-left mt-1 text-xs text-[#b91c1c] hover:underline font-semibold"
                  >
                    Посмотреть ({value.length})
                  </button>
                ) : (
                  <span className="font-medium">{String(value)}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">Данные не найдены</div>
        )}
      </DialogContent>

      <Dialog open={!!arrayData} onOpenChange={(open) => !open && setArrayData(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="uppercase">Детали: {arrayData?.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {arrayData?.data.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(item).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-muted-foreground text-xs uppercase font-bold">{k}</span>
                      <span className="font-medium break-all">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {arrayData?.data.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">Пустой список</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
