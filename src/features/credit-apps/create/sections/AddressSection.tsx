import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreditApplicationFormValues } from '../CreditApplicationForm';

export function AddressSection({ form }: { form: UseFormReturn<CreditApplicationFormValues> }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800">Адрес регистрации / проживания</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Полный адрес</FormLabel>
              <FormControl>
                <Input placeholder="г. Душанбе, ул. Рудаки 1, кв 45" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
