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
import { TerminalAssignItem } from '../../services/terminal-service';
import { POPULAR_CURRENCIES } from '../../utils/currency';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TerminalAssignItem) => void;
  data: TerminalAssignItem | null; // null means create mode
  loading?: boolean;
}

const DEFAULT_STATE: TerminalAssignItem = {
  transactionType: '',
  description: '',
  atmId: '',
  currency: '',
};

export function TerminalModal({ isOpen, onClose, onSave, data, loading }: TerminalModalProps) {
  const [formData, setFormData] = useState<TerminalAssignItem>(DEFAULT_STATE);
  const isEditMode = !!data?.id;

  useEffect(() => {
    if (isOpen) {
      if (data) {
        setFormData({
          ...data,
          currency: data.currency ? String(data.currency) : '',
        });
      } else {
        setFormData(DEFAULT_STATE);
      }
    }
  }, [isOpen, data]);

  const handleSave = () => {
    onSave({
      ...formData,
      currency: formData.currency || null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Редактировать назначение' : 'Создать назначение терминала'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="transactionType">Тип транзакции</Label>
            <Input
              id="transactionType"
              value={formData.transactionType}
              onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
              placeholder="Например: 1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание операции"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="atmId">ATM ID</Label>
            <Input
              id="atmId"
              value={formData.atmId}
              onChange={(e) => setFormData({ ...formData, atmId: e.target.value })}
              placeholder="ID терминала"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="currency">Валюта</Label>
            <Select
              value={formData.currency || 'empty'}
              onValueChange={(val) => setFormData({ ...formData, currency: val === 'empty' ? '' : val })}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_CURRENCIES.map((opt) => (
                  <SelectItem key={opt.value || 'empty'} value={opt.value || 'empty'}>
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
