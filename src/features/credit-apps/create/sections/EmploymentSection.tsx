import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreditApplicationFormValues } from '../CreditApplicationForm';

export function EmploymentSection({ form }: { form: UseFormReturn<CreditApplicationFormValues> }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800">Трудоустройство и Доходы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workplace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Место работы</FormLabel>
                <FormControl>
                  <Input placeholder="Название организации" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employmentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дата трудоустройства</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Основной доход (ЗП)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Сумма в сомони" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalIncomeSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Источник доп. дохода</FormLabel>
                <FormControl>
                  <Input placeholder="Например: Аренда" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalIncomeAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сумма доп. дохода</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Сумма в сомони" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
