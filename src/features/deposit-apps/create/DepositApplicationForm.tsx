'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

const DEPOSIT_CURRENCIES = ['TJS', 'USD', 'EUR', 'RUB'];
const DEPOSIT_TYPES = ['Срочный', 'Накопительный', 'Сберегательный', 'До востребования'];

const formSchema = z.object({
  clientCode: z.string().min(1, 'Обязательное поле'),
  isCapitalize: z.boolean().default(false),
  typeOfDeposit: z.string().min(1, 'Обязательное поле'),
  withdrawAccount: z.string().optional(),
  accruedAccount: z.string().min(1, 'Обязательное поле'),
  depositTermMonth: z.string().min(1, 'Обязательное поле'),
  sumOfDeposit: z.string().min(1, 'Обязательное поле'),
  depositCurrency: z.string().min(1, 'Обязательное поле'),
});

export type DepositApplicationFormValues = z.infer<typeof formSchema>;

export function DepositApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DepositApplicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientCode: '',
      isCapitalize: false,
      typeOfDeposit: '',
      withdrawAccount: '',
      accruedAccount: '',
      depositTermMonth: '',
      sumOfDeposit: '',
      depositCurrency: 'TJS',
    },
  });

  const onSubmit = async (data: DepositApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Sending data:', data);
      await new Promise(r => setTimeout(r, 1000)); // Mock API delay
      toast.success('Заявка на депозит успешно сохранена!');
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error('Произошла ошибка при сохранении данных');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Новая заявка на депозит"
      description="Заполните параметры депозита и укажите реквизиты клиента."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-[800px]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-slate-800">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Код клиента</FormLabel>
                      <FormControl>
                        <Input placeholder="Например: 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="typeOfDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип депозита</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPOSIT_TYPES.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-6 items-center p-4 bg-muted/20 rounded-lg border">
                <FormField
                  control={form.control}
                  name="isCapitalize"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Капитализация процентов</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="accruedAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Счет начисления (обязательно)</FormLabel>
                      <FormControl>
                        <Input placeholder="Номер счета" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="withdrawAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Счет вывода (опционально)</FormLabel>
                      <FormControl>
                        <Input placeholder="Номер счета" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="sumOfDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сумма</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depositCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Валюта</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Валюта" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPOSIT_CURRENCIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depositTermMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Срок (мес.)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
              Очистить
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Сохранить
            </Button>
          </div>
        </form>
      </Form>
    </PageContainer>
  );
}
