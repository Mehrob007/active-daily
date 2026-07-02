'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PVNSetting } from '../../services/pvn-service';

interface PVNSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PVNSetting) => void;
  onUpdate: (id: number, data: PVNSetting) => void;
  data: PVNSetting | null;
  isEdit: boolean;
}

const emptyForm: PVNSetting = {
  atm_id: '',
  currency: 972,
  cashbox_inn: '',
  cashbox_name: '',
  cashbox_account: '',
  atm_inn: '',
  atm_name: '',
  atm_account: '',
};

const currencyOptions = [
  { value: 810, label: 'RUB' },
  { value: 840, label: 'USD' },
  { value: 978, label: 'EUR' },
  { value: 398, label: 'KZT' },
  { value: 972, label: 'TJS' },
];

export function PVNSettingModal({
  isOpen,
  onClose,
  data,
  onSave,
  onUpdate,
  isEdit,
}: PVNSettingModalProps) {
  const [formData, setFormData] = useState<PVNSetting>(emptyForm);

  useEffect(() => {
    if (isOpen) {
      setFormData(data ? { ...data } : { ...emptyForm });
    }
  }, [isOpen, data]);

  const handleChange = (field: keyof PVNSetting, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (isEdit && formData.ID) {
      onUpdate(formData.ID, formData);
    } else {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактирование настройки ПВН' : 'Новая настройка ПВН'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-1">
          {/* Параметры ПВН */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">Параметры ПВН</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID ПВН (atm_id)</Label>
                <Input
                  placeholder="Например: ATM001"
                  value={formData.atm_id}
                  onChange={(e) => handleChange('atm_id', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Валюта</Label>
                <Select
                  value={String(formData.currency)}
                  onValueChange={(val) => handleChange('currency', parseInt(val, 10))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label} ({opt.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Реквизиты кассы (плательщик) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">Реквизиты кассы (плательщик)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ИНН кассы</Label>
                <Input
                  placeholder="ИНН"
                  value={formData.cashbox_inn}
                  onChange={(e) => handleChange('cashbox_inn', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Наименование кассы</Label>
                <Input
                  placeholder="Наименование"
                  value={formData.cashbox_name}
                  onChange={(e) => handleChange('cashbox_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Счёт кассы</Label>
                <Input
                  placeholder="Номер счёта"
                  value={formData.cashbox_account}
                  onChange={(e) => handleChange('cashbox_account', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Реквизиты ПВН (получатель) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">Реквизиты ПВН (получатель)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ИНН ПВН</Label>
                <Input
                  placeholder="ИНН"
                  value={formData.atm_inn}
                  onChange={(e) => handleChange('atm_inn', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Наименование ПВН</Label>
                <Input
                  placeholder="Наименование"
                  value={formData.atm_name}
                  onChange={(e) => handleChange('atm_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Счёт ПВН</Label>
                <Input
                  placeholder="Номер счёта"
                  value={formData.atm_account}
                  onChange={(e) => handleChange('atm_account', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            {isEdit ? 'Сохранить изменения' : 'Создать настройку'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
