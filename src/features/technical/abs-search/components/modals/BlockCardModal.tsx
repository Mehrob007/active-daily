import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { absService } from '../../services/abs-service';
import { toast } from '@/hooks/use-toast';

interface BlockCardModalProps {
  cardId: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

const BLOCK_OPTIONS = [
  {
    value: "5",
    label: "5 - Операции запрещены (клиент не сможет разблокировать в приложении)",
  },
  {
    value: "6",
    label: "6 - Карта утеряна, банкомат зажует карту (сможет использовать в приложении)",
  },
  {
    value: "24",
    label: "24 - Временная блокировка по просьбе клиента (сможет разблокировать)",
  },
];

export const BlockCardModal: React.FC<BlockCardModalProps> = ({ cardId, onClose, onRefresh }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!cardId || !selectedReason) return;
    setIsLoading(true);
    try {
      await absService.blockCard(cardId, selectedReason);
      toast({ title: 'Успешно', description: 'Карта успешно заблокирована' });
      onRefresh();
      onClose();
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось заблокировать карту', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!cardId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-bank-red/20">
        <DialogHeader>
          <DialogTitle className="text-bank-red">Блокировка карты</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Выберите тип блокировки</Label>
            <Select onValueChange={setSelectedReason} value={selectedReason}>
              <SelectTrigger className="w-full h-auto text-left py-3 items-start [&>span]:line-clamp-2">
                <SelectValue placeholder="Выберите тип..." />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="py-2">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button 
            className="bg-bank-red hover:bg-bank-red/90 text-white" 
            onClick={handleConfirm} 
            disabled={!selectedReason || isLoading}
          >
            {isLoading ? 'Блокировка...' : 'Заблокировать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
