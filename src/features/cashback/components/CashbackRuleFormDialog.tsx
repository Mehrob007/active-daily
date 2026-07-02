import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus } from 'lucide-react';
import { CashbackSetting } from '../services/cashback-settings-service';

interface CashbackRuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CashbackSetting | null;
  onSave: (data: CashbackSetting) => Promise<void>;
}

const emptyForm: CashbackSetting = {
  card_number: "",
  card_id: "",
  response_code: "",
  reqamt: 0,
  amount: 0,
  conamt: 0,
  acctbal: 0,
  netbal: 0,
  utrnno: 0,
  currency: 0,
  conCurrency: 0,
  reversal: 0,
  transaction_type: [],
  mcc: 0,
  atm_id: "",
  account: "",
  from_date: "",
  to_date: "",
  from_time: "",
  to_time: "",
  exclude_transaction_types: "",
  exclude_atm_ids: "",
  exclude_mcc: "",
  exclude_accounts: "",
  account_withdraw: "",
  idn_withdraw: "",
  full_name_withdraw: "",
  cashback_percentage: 0,
  cashback_name: "",
  cashback_priority: 0,
  is_active: true,
};

export function CashbackRuleFormDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: CashbackRuleFormDialogProps) {
  const [formData, setFormData] = useState<CashbackSetting>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...initialData,
          transaction_type: Array.isArray(initialData.transaction_type) 
            ? initialData.transaction_type 
            : []
        });
      } else {
        setFormData({ ...emptyForm });
      }
      setTagInput("");
    }
  }, [open, initialData]);

  const handleChange = (field: keyof CashbackSetting, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const newTags = tagInput
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    
    if (newTags.length > 0) {
      const currentTags = formData.transaction_type || [];
      handleChange("transaction_type", [...new Set([...currentTags, ...newTags])]);
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    const currentTags = formData.transaction_type || [];
    handleChange(
      "transaction_type", 
      currentTags.filter((_, i) => i !== indexToRemove)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !tagInput) {
      const currentTags = formData.transaction_type || [];
      if (currentTags.length > 0) {
        removeTag(currentTags.length - 1);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {initialData ? 'Редактировать правило кешбэка' : 'Создать правило кешбэка'}
          </DialogTitle>
          <DialogDescription>
            Заполните параметры для автоматического начисления кешбэка.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start h-auto bg-transparent p-0">
              <TabsTrigger 
                value="general" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Основные
              </TabsTrigger>
              <TabsTrigger 
                value="cards_codes" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Карты и Коды
              </TabsTrigger>
              <TabsTrigger 
                value="amounts" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Суммы и Баланс
              </TabsTrigger>
              <TabsTrigger 
                value="limits" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Ограничения
              </TabsTrigger>
              <TabsTrigger 
                value="exclusions" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Исключения
              </TabsTrigger>
              <TabsTrigger 
                value="withdraw" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Вывод
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="general" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Название кешбэка</Label>
                  <Input 
                    value={formData.cashback_name || ''} 
                    onChange={e => handleChange('cashback_name', e.target.value)} 
                    placeholder="Например: Летняя акция 5%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Процент кешбэка (%)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.cashback_percentage === 0 ? '' : formData.cashback_percentage} 
                    onChange={e => handleChange('cashback_percentage', parseFloat(e.target.value) || 0)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Приоритет</Label>
                  <Input 
                    type="number" 
                    value={formData.cashback_priority === 0 ? '' : formData.cashback_priority} 
                    onChange={e => handleChange('cashback_priority', parseInt(e.target.value) || 0)} 
                  />
                </div>
                <div className="space-y-2 col-span-2 flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">Активность правила</Label>
                    <p className="text-sm text-muted-foreground">
                      Включено ли данное правило для обработки транзакций
                    </p>
                  </div>
                  <Switch 
                    checked={formData.is_active} 
                    onCheckedChange={(checked) => handleChange('is_active', checked)} 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cards_codes" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Типы транзакций (Tags)</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background focus-within:ring-1 focus-within:ring-ring">
                    {(formData.transaction_type || []).map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium">
                        {tag}
                        <button type="button" onClick={() => removeTag(i)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      className="flex-1 outline-none bg-transparent min-w-[120px] text-sm"
                      placeholder={formData.transaction_type?.length ? "" : "Введите тип и нажмите Enter"}
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => { if (tagInput.trim()) addTag(); }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Номер карты</Label>
                  <Input value={formData.card_number || ''} onChange={e => handleChange('card_number', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>ID карты</Label>
                  <Input value={formData.card_id || ''} onChange={e => handleChange('card_id', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Код ответа</Label>
                  <Input value={formData.response_code || ''} onChange={e => handleChange('response_code', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>MCC код</Label>
                  <Input type="number" value={formData.mcc === 0 ? '' : formData.mcc} onChange={e => handleChange('mcc', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Счёт</Label>
                  <Input value={formData.account || ''} onChange={e => handleChange('account', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>ATM ID</Label>
                  <Input value={formData.atm_id || ''} onChange={e => handleChange('atm_id', e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="amounts" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Сумма запроса (reqamt)</Label>
                  <Input type="number" step="0.01" value={formData.reqamt === 0 ? '' : formData.reqamt} onChange={e => handleChange('reqamt', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Сумма (amount)</Label>
                  <Input type="number" step="0.01" value={formData.amount === 0 ? '' : formData.amount} onChange={e => handleChange('amount', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Конв. сумма (conamt)</Label>
                  <Input type="number" step="0.01" value={formData.conamt === 0 ? '' : formData.conamt} onChange={e => handleChange('conamt', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Баланс счёта (acctbal)</Label>
                  <Input type="number" step="0.01" value={formData.acctbal === 0 ? '' : formData.acctbal} onChange={e => handleChange('acctbal', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Чистый баланс (netbal)</Label>
                  <Input type="number" step="0.01" value={formData.netbal === 0 ? '' : formData.netbal} onChange={e => handleChange('netbal', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>UTRN</Label>
                  <Input type="number" value={formData.utrnno === 0 ? '' : formData.utrnno} onChange={e => handleChange('utrnno', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Валюта (currency)</Label>
                  <Input type="number" value={formData.currency === 0 ? '' : formData.currency} onChange={e => handleChange('currency', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Конв. валюта</Label>
                  <Input type="number" value={formData.conCurrency === 0 ? '' : formData.conCurrency} onChange={e => handleChange('conCurrency', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Реверсал</Label>
                  <Input type="number" value={formData.reversal === 0 ? '' : formData.reversal} onChange={e => handleChange('reversal', parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата От</Label>
                  <Input type="date" value={formData.from_date || ''} onChange={e => handleChange('from_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Дата До</Label>
                  <Input type="date" value={formData.to_date || ''} onChange={e => handleChange('to_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Время От</Label>
                  <Input type="time" value={formData.from_time || ''} onChange={e => handleChange('from_time', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Время До</Label>
                  <Input type="time" value={formData.to_time || ''} onChange={e => handleChange('to_time', e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exclusions" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Исключить типы транзакций</Label>
                  <Input value={formData.exclude_transaction_types || ''} onChange={e => handleChange('exclude_transaction_types', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Исключить ATM</Label>
                  <Input value={formData.exclude_atm_ids || ''} onChange={e => handleChange('exclude_atm_ids', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Исключить MCC</Label>
                  <Input value={formData.exclude_mcc || ''} onChange={e => handleChange('exclude_mcc', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Исключить счета</Label>
                  <Input value={formData.exclude_accounts || ''} onChange={e => handleChange('exclude_accounts', e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Счёт вывода</Label>
                  <Input value={formData.account_withdraw || ''} onChange={e => handleChange('account_withdraw', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>IDN вывода</Label>
                  <Input value={formData.idn_withdraw || ''} onChange={e => handleChange('idn_withdraw', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>ФИО вывода</Label>
                  <Input value={formData.full_name_withdraw || ''} onChange={e => handleChange('full_name_withdraw', e.target.value)} />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
