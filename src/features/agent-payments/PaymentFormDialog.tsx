import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api-client';

interface PaymentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm = {
  cashback_amount: '',
  beneficiary_idn: '',
  beneficiary_iban: '',
  beneficiary_name: '',
  payment_details: '',
  payer_idn: '',
  payer_name: '',
  payer_iban: '',
  bic: '',
};

export function PaymentFormDialog({ isOpen, onClose, onSuccess }: PaymentFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<'internal' | 'domestic'>('internal');
  const [formData, setFormData] = useState({ ...emptyForm });

  const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['cashback_amount', 'beneficiary_idn', 'beneficiary_iban', 'beneficiary_name', 'payment_details', 'payer_idn', 'payer_name', 'payer_iban'];
    if (paymentType === 'domestic') {
      requiredFields.push('bic');
    }

    const isEmptyField = requiredFields.some(field => {
      const value = formData[field as keyof typeof formData];
      return value === undefined || value === null || value.toString().trim() === '';
    });

    if (isEmptyField) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(formData.cashback_amount);
    if (isNaN(amount)) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите корректную сумму',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        beneficiary_idn: formData.beneficiary_idn,
        beneficiary_iban: formData.beneficiary_iban,
        beneficiary_name: formData.beneficiary_name,
        payment_details: formData.payment_details,
        payer_idn: formData.payer_idn,
        payer_name: formData.payer_name,
        payer_iban: formData.payer_iban,
        cashback_amount: amount,
      };

      if (paymentType === 'domestic') {
        payload.bic = formData.bic;
      }

      await apiClient.post(`${BACKEND_URL}/payments`, payload, { baseURL: '' });
      
      toast({
        title: 'Успех',
        description: 'Платёж успешно создан',
      });
      
      setFormData({ ...emptyForm });
      setPaymentType('internal');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Ошибка создания платежа',
        description: error.message || 'Не удалось создать платёж',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать новый платеж</DialogTitle>
          <DialogDescription>
            Заполните данные для создания внутрибанковского или межбанковского платежа.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label>Тип платежа</Label>
            <RadioGroup 
              value={paymentType} 
              onValueChange={(val) => setPaymentType(val as 'internal' | 'domestic')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="internal" id="internal" />
                <Label htmlFor="internal" className="cursor-pointer font-normal">Внутрибанковский</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="domestic" id="domestic" />
                <Label htmlFor="domestic" className="cursor-pointer font-normal">Межбанковский</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cashback_amount">Сумма перевода *</Label>
              <Input
                id="cashback_amount"
                name="cashback_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.cashback_amount}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-4 rounded-md border p-4 bg-muted/20">
              <h4 className="font-medium">Отправитель</h4>
              <div className="space-y-2">
                <Label htmlFor="payer_name">Имя отправителя *</Label>
                <Input
                  id="payer_name"
                  name="payer_name"
                  value={formData.payer_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payer_idn">ИНН отправителя *</Label>
                <Input
                  id="payer_idn"
                  name="payer_idn"
                  value={formData.payer_idn}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payer_iban">Счёт отправителя *</Label>
                <Input
                  id="payer_iban"
                  name="payer_iban"
                  value={formData.payer_iban}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4 bg-muted/20">
              <h4 className="font-medium">Получатель</h4>
              <div className="space-y-2">
                <Label htmlFor="beneficiary_name">Имя получателя *</Label>
                <Input
                  id="beneficiary_name"
                  name="beneficiary_name"
                  value={formData.beneficiary_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiary_idn">ИНН получателя *</Label>
                <Input
                  id="beneficiary_idn"
                  name="beneficiary_idn"
                  value={formData.beneficiary_idn}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiary_iban">Счёт получателя *</Label>
                <Input
                  id="beneficiary_iban"
                  name="beneficiary_iban"
                  value={formData.beneficiary_iban}
                  onChange={handleChange}
                />
              </div>
              {paymentType === 'domestic' && (
                <div className="space-y-2">
                  <Label htmlFor="bic">БИК банка получателя *</Label>
                  <Input
                    id="bic"
                    name="bic"
                    value={formData.bic}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="payment_details">Детали платежа (Назначение) *</Label>
              <Input
                id="payment_details"
                name="payment_details"
                value={formData.payment_details}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Создание...' : 'Создать платеж'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
