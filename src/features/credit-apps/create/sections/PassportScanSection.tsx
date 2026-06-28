import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Camera, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CreditApplicationFormValues } from '../CreditApplicationForm';

export function PassportScanSection({ form }: { form: UseFormReturn<CreditApplicationFormValues> }) {
  const handleFileChange = (field: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      field.onChange(file);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800">Документы и Фотографии</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="frontPassport"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <FormLabel className="cursor-pointer text-center w-full flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileText size={24} />
                  </div>
                  <span className="font-semibold text-slate-700">Лицевая сторона</span>
                  <span className="text-xs text-slate-500">
                    {field.value ? (field.value as File).name : 'Загрузить файл'}
                  </span>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(field, e)}
                    />
                  </FormControl>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="backPassport"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <FormLabel className="cursor-pointer text-center w-full flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileText size={24} />
                  </div>
                  <span className="font-semibold text-slate-700">Оборотная сторона</span>
                  <span className="text-xs text-slate-500">
                    {field.value ? (field.value as File).name : 'Загрузить файл'}
                  </span>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(field, e)}
                    />
                  </FormControl>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="selfie"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <FormLabel className="cursor-pointer text-center w-full flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Camera size={24} />
                  </div>
                  <span className="font-semibold text-slate-700">Селфи с паспортом</span>
                  <span className="text-xs text-slate-500">
                    {field.value ? (field.value as File).name : 'Сделать фото'}
                  </span>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(field, e)}
                    />
                  </FormControl>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incomeProof"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <FormLabel className="cursor-pointer text-center w-full flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <UploadCloud size={24} />
                  </div>
                  <span className="font-semibold text-slate-700">Справка о доходах</span>
                  <span className="text-xs text-slate-500">
                    {field.value ? (field.value as File).name : 'Документ (необязательно)'}
                  </span>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(field, e)}
                    />
                  </FormControl>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
