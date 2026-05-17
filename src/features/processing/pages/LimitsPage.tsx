'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, RefreshCw } from 'lucide-react';
import { processingService } from '../services/processing-service';
import { toast } from '@/hooks/use-toast';

const LIMIT_NAMES_MAPPING: Record<string, string> = {
  LMTTZ201: 'Дневной лимит выдачи наличных',
  LMTTZ202: 'Месячный лимит выдачи наличных',
  LMTTZ203: 'Дневной лимит покупок',
  LMTTZ204: 'Месячный лимит покупок',
  LMTTZ205: 'Дневной лимит операций в интернете',
  LMTTZ206: 'Месячный лимит операций в интернете',
  LMTTZ207: 'Дневной лимит всех операций',
  LMTTZ208: 'Месячный лимит всех операций',
};

export default function ProcessingLimitsPage() {
  const [formData, setFormData] = useState({
    cardId: '',
    limitName: '',
    limitValue: '',
    cycleType: '4',
    currency: '972',
    cycleLength: '1'
  });
  const [isManualLimitName, setIsManualLimitName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cardId || !formData.limitName || !formData.limitValue) {
      toast({ title: 'Ошибка', description: 'Пожалуйста, заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        limitValue: `${formData.limitValue}00`
      };
      
      await processingService.changeCardLimit(payload);
      toast({ title: 'Успешно', description: 'Лимит успешно изменен' });
      setFormData(prev => ({ ...prev, limitValue: '' }));
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message || 'Ошибка при изменении лимита', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Лимиты процессинга" subtitle="Управление лимитами карт в ПЦ">
      <div className="max-w-2xl mx-auto py-8">
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-bank-red text-white py-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Shield className="size-6" /> Изменение лимита
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cardId" className="text-muted-foreground">ID карты</Label>
                <Input
                  id="cardId"
                  placeholder="Введите ID карты"
                  value={formData.cardId}
                  onChange={(e) => setFormData({...formData, cardId: e.target.value})}
                  className="h-12 text-base font-mono"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Тип лимита</Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm"
                    className="text-bank-red h-auto p-0"
                    onClick={() => setIsManualLimitName(!isManualLimitName)}
                  >
                    {isManualLimitName ? 'Выбрать из списка' : 'Ввести вручную'}
                  </Button>
                </div>
                
                {isManualLimitName ? (
                  <Input
                    placeholder="Напр. LMTTZ201"
                    value={formData.limitName}
                    onChange={(e) => setFormData({...formData, limitName: e.target.value})}
                    className="h-12 text-base font-mono uppercase"
                    disabled={isLoading}
                  />
                ) : (
                  <Select 
                    value={formData.limitName} 
                    onValueChange={(val) => setFormData({...formData, limitName: val})}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Выберите тип лимита" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LIMIT_NAMES_MAPPING).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{key} - {value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limitValue" className="text-muted-foreground">Значение</Label>
                  <Input
                    id="limitValue"
                    type="number"
                    placeholder="0.00"
                    value={formData.limitValue}
                    onChange={(e) => setFormData({...formData, limitValue: e.target.value})}
                    className="h-12 text-base font-bold tabular-nums"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Валюта</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(val) => setFormData({...formData, currency: val})}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="972">TJS</SelectItem>
                      <SelectItem value="840">USD</SelectItem>
                      <SelectItem value="978">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Период</Label>
                <Select 
                  value={formData.cycleType} 
                  onValueChange={(val) => setFormData({...formData, cycleType: val})}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">День</SelectItem>
                    <SelectItem value="4">Месяц</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-bank-red hover:bg-bank-red/90 text-white text-lg font-bold shadow-lg shadow-bank-red/20 transition-all active:scale-[0.98]"
              >
                {isLoading ? <RefreshCw className="size-6 animate-spin" /> : 'Выполнить'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
