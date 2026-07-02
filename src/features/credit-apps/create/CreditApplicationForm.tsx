'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

import { PassportScanSection } from './sections/PassportScanSection';
import { PersonalDataSection } from './sections/PersonalDataSection';
import { EmploymentSection } from './sections/EmploymentSection';
import { LoanDetailsSection } from './sections/LoanDetailsSection';
import { AddressSection } from './sections/AddressSection';

const fileSchema = z.custom<File>((val) => val instanceof File, 'Файл обязателен').optional();

const formSchema = z.object({
  frontPassport: fileSchema,
  backPassport: fileSchema,
  selfie: fileSchema,
  incomeProof: z.custom<File>((val) => val instanceof File).optional(),

  identityVerified: z.boolean().default(false),
  sendSms: z.boolean().default(false),
  surname: z.string().min(2, 'Обязательное поле'),
  name: z.string().min(2, 'Обязательное поле'),
  middleName: z.string().optional(),
  phone: z.string().min(9, 'Неверный формат телефона'),
  inn: z.string().min(5, 'Неверный ИНН'),
  clientCode: z.string().min(1, 'Обязательное поле'),

  workplace: z.string().min(2, 'Обязательное поле'),
  employmentDate: z.string().min(1, 'Обязательное поле'),
  salary: z.string().min(1, 'Обязательное поле'),
  additionalIncomeSource: z.string().optional(),
  additionalIncomeAmount: z.string().optional(),

  loanType: z.string().min(1, 'Обязательное поле'),
  branchOffice: z.string().min(1, 'Обязательное поле'),
  loanPurpose: z.string().min(2, 'Обязательное поле'),
  loanAmount: z.string().min(1, 'Обязательное поле'),
  loanTerm: z.string().min(1, 'Обязательное поле'),
  creditStatusId: z.string().min(1, 'Обязательное поле'),

  address: z.string().min(5, 'Полный адрес обязателен'),
});

export type CreditApplicationFormValues = z.infer<typeof formSchema>;

export function CreditApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreditApplicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identityVerified: false,
      sendSms: false,
      surname: '',
      name: '',
      middleName: '',
      phone: '',
      inn: '',
      clientCode: '',
      workplace: '',
      employmentDate: '',
      salary: '',
      additionalIncomeSource: '',
      additionalIncomeAmount: '',
      loanType: '',
      branchOffice: '',
      loanPurpose: '',
      loanAmount: '',
      loanTerm: '',
      creditStatusId: '1',
      address: '',
    },
  });

  const onSubmit = async (data: CreditApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Sending data:', data);
      const formData = new FormData();
      if (data.frontPassport) formData.append('front_side_of_the_passport_file', data.frontPassport);
      if (data.backPassport) formData.append('back_side_of_the_passport_file', data.backPassport);
      if (data.selfie) formData.append('selfie_with_passport_file', data.selfie);
      if (data.incomeProof) formData.append('income_proof_document_file', data.incomeProof);

      await new Promise(r => setTimeout(r, 1500));
      
      toast.success('Заявка на кредит успешно создана!');
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
      title="Новая заявка на кредит"
      description="Внимательно заполните данные клиента и прикрепите необходимые документы."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[1200px] pb-24">
          <PassportScanSection form={form} />
          <PersonalDataSection form={form} />
          <EmploymentSection form={form} />
          <LoanDetailsSection form={form} />
          <AddressSection form={form} />

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex justify-end gap-4 z-50">
            <div className="max-w-[1200px] w-full mx-auto flex justify-end gap-4 px-4 md:px-8">
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
                Сбросить
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white min-w-[200px]">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Отправить заявку
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </PageContainer>
  );
}
