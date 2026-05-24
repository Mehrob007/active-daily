'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Search, 
  Settings2, 
  Save, 
  RotateCcw,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { processingService } from '../services/processing-service';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const LIMIT_DESCRIPTIONS: Record<string, string> = {
  LMTTZ285: "Чужой ВПН в месяц(сумма)",
  LMTTZ292: "Чужой ПОС в день(кол-во)",
  LMTTZ272: "Наш АТМ в день(кол-во)",
  LMTTZ288: "Чужой АТМ в день(кол-во)",
  LMTTZ362: "Корректировка лимита",
  LMTTZ363: "Корректировка лимита",
  LMTTZ271: "Наш АТМ в день(сумма)",
  LMTTZ273: "Наш АТМ в месяц(сумма)",
  LMTTZ280: "Наш ЕПОС в день(кол-во)",
  LMTTZ281: "Наш ЕПОС в месяц(сумма)",
  LMTTZ268: "Наш ПВН в день(кол-во)",
  LMTTZ270: "Наш ПВН в месяц(кол-во)",
  LMTTZ283: "Чужой ПВН в день(сумма)",
  LMTTZ290: "Чужой АТМ в месяц(кол-во)",
  LMTTZ274: "Наш АТМ в месяц(кол-во)",
  LMTTZ294: "Чужой ПОС в месяц(кол-во)",
  LMTTZ371: "Наш АТМ в день(сумма)",
  LMTTZ276: "Наш ПОС в день(кол-во)",
  LMTTZ278: "Наш ПОС в месяц(кол-во)",
  LMTTZ282: "Наш ЕПОС в месяц(кол-во)",
  LMTTZ297: "Чужой ЕПОС в месяц(сумма)",
  LMTTZ269: "Наш ПВН в месяц(сумма)",
  LMTTZ279: "Наш ЕПОС в день(сумма)",
  LMTTZ286: "Чужой ВПН в месяц(кол-во)",
  LMTTZ298: "Чужой ЕПОС в месяц(кол-во)",
  LMTTZ289: "Чужой АТМ в месяц(сумма)",
  LMTTZ291: "Чужой ПОС в день(сумма)",
  LMTTZ296: "Чужой ЕПОС в день(кол-во)",
  LMTTZ275: "Наш ПОС в день(сумма)",
  LMTTZ287: "Чужой АТМ в день(сумма)",
  LMTTZ293: "Чужой ПОС в месяц(сумма)",
  LMTTZ369: "Технический лимит системы",
  LMTTZ284: "Чужой ПВН в день(кол-во)",
  LMTTZ370: "Системный лимит безопасности",
  LMTTZ372: "Общий лимит расходов(кол-во)",
  LMTTZ267: "Наш ПВН в день(сумма)",
  LMTTZ295: "Чужой ЕПОС в день(сумма)",
  LMTTZ277: "Наш ПОС в месяц(сумма)",
};

const getCurrencyCode = (code: string | number) => {
  const c = String(code);
  if (c === '972') return 'TJS';
  if (c === '840') return 'USD';
  if (c === '978') return 'EUR';
  return c;
};

export default function ProcessingLimitsPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [displayCardNumber, setDisplayCardNumber] = useState("");
  const [limitData, setLimitData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingLimit, setEditingLimit] = useState<any>(null);
  const [newValue, setNewValue] = useState("");

  const formatCardNumber = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleSearch = async () => {
    const rawNum = displayCardNumber.replace(/\s/g, "");
    if (rawNum.length !== 16) {
      toast({ title: 'Ошибка', description: 'Введите 16 цифр номера карты', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await processingService.getLimits(rawNum);
      const formatted = data.map((l: any) => ({
        ...l,
        description: LIMIT_DESCRIPTIONS[l.name] || `Лимит ${l.name}`,
        currentValue: Number(l.currentValue) || 0,
        value: Number(l.value) || 0,
        newValue: null,
      }));
      setLimitData(formatted);
      toast({ title: 'Успешно', description: `Загружено ${formatted.length} лимитов` });
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
      setLimitData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLimit = async () => {
    if (!editingLimit || !newValue) return;
    
    setIsSaving(true);
    const rawNum = displayCardNumber.replace(/\s/g, "");
    try {
      await processingService.updateLimit(rawNum, editingLimit.name, newValue);
      
      // Update local state
      setLimitData(prev => prev.map(l => 
        l.name === editingLimit.name ? { ...l, value: Number(newValue) } : l
      ));
      
      toast({ title: 'Успешно', description: `Лимит ${editingLimit.name} обновлен` });
      setEditingLimit(null);
    } catch (err: any) {
      toast({ title: 'Ошибка обновления', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer title="Лимиты карт" subtitle="Поиск и изменение лимитов по номеру карты в ПЦ">
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[300px] space-y-1.5">
            <Label htmlFor="cardNum" className="text-xs uppercase font-bold text-slate-500">Номер банковской карты</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="cardNum"
                placeholder="0000 0000 0000 0000"
                value={displayCardNumber}
                onChange={(e) => setDisplayCardNumber(formatCardNumber(e.target.value))}
                className="h-12 pl-10 font-mono text-lg tracking-wider"
                disabled={isLoading || isSaving}
              />
            </div>
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={displayCardNumber.replace(/\s/g, "").length !== 16 || isLoading || isSaving}
            className="h-12 px-8 bg-bank-red hover:bg-bank-red/90 text-white shadow-lg shadow-bank-red/20"
          >
            {isLoading ? <RefreshCw className="size-5 animate-spin mr-2" /> : <Search className="size-5 mr-2" />}
            Найти лимиты
          </Button>
        </div>
      </div>

      {limitData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Settings2 className="size-4 text-bank-red" />
              Лимиты для карты {displayCardNumber}
            </h3>
            <Badge variant="outline" className="bg-white">{limitData.length} записей</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3 text-left">Наименование и ID</th>
                  <th className="px-6 py-3 text-right">Текущее значение</th>
                  <th className="px-6 py-3 text-right">Значение лимита</th>
                  <th className="px-6 py-3 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {limitData.map((limit) => (
                  <tr key={limit.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{limit.description}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {limit.name}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">
                      {limit.currentValue.toLocaleString('ru-RU')} {getCurrencyCode(limit.currency)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-bank-red">
                      {limit.value.toLocaleString('ru-RU')} {getCurrencyCode(limit.currency)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs border-bank-red/20 text-bank-red hover:bg-bank-red/5"
                        onClick={() => {
                          setEditingLimit(limit);
                          setNewValue(String(limit.value));
                        }}
                      >
                        Изменить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
          <RefreshCw className="size-10 text-bank-red animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Загрузка данных из ПЦ...</p>
        </div>
      )}

      {!isLoading && limitData.length === 0 && displayCardNumber.replace(/\s/g, "").length === 16 && (
        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 py-20 flex flex-col items-center justify-center text-slate-400">
          <AlertCircle className="size-12 mb-4 opacity-20" />
          <h3 className="text-lg font-bold">Лимиты не найдены</h3>
          <p>Проверьте номер карты или попробуйте позже</p>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingLimit} onOpenChange={() => !isSaving && setEditingLimit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Изменение лимита</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="text-xs uppercase font-bold text-slate-400 mb-1">Выбранный лимит</div>
              <div className="font-bold text-slate-700">{editingLimit?.description}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {editingLimit?.name}</div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="limitVal">Новое значение ({editingLimit ? getCurrencyCode(editingLimit.currency) : ''})</Label>
              <Input
                id="limitVal"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                autoFocus
                className="h-12 text-lg font-bold"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditingLimit(null)} disabled={isSaving}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateLimit} 
              disabled={isSaving || !newValue}
              className="bg-bank-red hover:bg-bank-red/90 text-white"
            >
              {isSaving ? <RefreshCw className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageContainer>
  );
}
