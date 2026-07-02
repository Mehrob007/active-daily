import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionTypeItem } from '../../services/transaction-agent-service';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalData: TransactionTypeItem, updatedData: TransactionTypeItem) => void;
  data: TransactionTypeItem | null;
  loading?: boolean;
}

export const TRANSACTION_TYPES_OPTIONS = [
  { value: "2", label: "Снятие" },
  { value: "1", label: "Пополнение" },
  { value: "3", label: "Параметры" },
  { value: "4", label: "Мусор" },
];

export function EditTransactionModal({ isOpen, onClose, onSave, data, loading }: EditTransactionModalProps) {
  const [formData, setFormData] = useState<TransactionTypeItem | null>(null);

  useEffect(() => {
    if (data) {
      setFormData({ ...data, number: String(data.number) });
    } else {
      setFormData(null);
    }
  }, [data]);

  if (!formData || !data) return null;

  const handleSave = () => {
    onSave(data, formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактирование типа транзакции</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="id">ID</Label>
            <Input id="id" value={formData.id} disabled className="bg-slate-50" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Тип транзакции (Type)</Label>
            <Input id="type" value={formData.type} disabled className="bg-slate-50" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Название операции</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="number">Вид операции</Label>
            <Select
              value={String(formData.number)}
              onValueChange={(val) => setFormData({ ...formData, number: val })}
            >
              <SelectTrigger id="number">
                <SelectValue placeholder="Выберите вид операции" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
