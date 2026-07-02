'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const LIMIT_NAMES_MAPPING = {
  "LMTTZ201": "Лимит на снятие наличных в банкомате",
  "LMTTZ202": "Лимит на оплату в интернете",
  "LMTTZ203": "Лимит на переводы P2P",
};

const limitSchema = z.object({
  cardId: z.string().min(1, 'Введите ID карты'),
  limitName: z.string().min(1, 'Выберите или введите тип лимита'),
  limitValue: z.string().min(1, 'Введите значение лимита').regex(/^\d+$/, 'Только цифры'),
  cycleType: z.string().min(1, 'Выберите период'),
  currency: z.string().min(1, 'Выберите валюту'),
});

export function ProcessingLimitsPage() {
  const [isManualLimitName, setIsManualLimitName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof limitSchema>>({
    resolver: zodResolver(limitSchema),
    defaultValues: {
      cardId: '',
      limitName: '',
      limitValue: '',
      cycleType: '4', // Месяц по умолчанию
      currency: '972', // TJS по умолчанию
    },
  });

  const onSubmit = async (values: z.infer<typeof limitSchema>) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Отправка данных лимита:', { ...values, limitValue: `${values.limitValue}00` });
      toast.success('Лимит успешно изменен');
      form.reset({ ...values, limitValue: '' });
    } catch (error) {
      toast.error('Ошибка при изменении лимита');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Лимиты ПЦ"
      subtitle="Управление лимитами процессингового центра"
    >
      <div className="max-w-2xl mx-auto">
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Изменение лимита</CardTitle>
            <CardDescription>Изменение параметров лимитов по картам клиентов</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="cardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Карты</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите ID карты" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Тип лимита</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="manual-mode" 
                        checked={isManualLimitName}
                        onCheckedChange={(checked) => {
                          setIsManualLimitName(checked);
                          form.setValue('limitName', '');
                        }}
                      />
                      <label htmlFor="manual-mode" className="text-sm text-muted-foreground cursor-pointer">
                        Ввести вручную
                      </label>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="limitName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {isManualLimitName ? (
                            <Input placeholder="Например: LMTTZ201" {...field} />
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите тип лимита" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(LIMIT_NAMES_MAPPING).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    <span className="font-mono text-muted-foreground mr-2">{key}</span> 
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="limitValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Значение лимита</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Сумма" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cycleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Период</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">День</SelectItem>
                              <SelectItem value="4">Месяц</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
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
                              <SelectItem value="972">TJS</SelectItem>
                              <SelectItem value="840">USD</SelectItem>
                              <SelectItem value="978">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Выполнение...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Сохранить изменения
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
