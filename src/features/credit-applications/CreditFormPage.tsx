'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, UploadCloud, User, Briefcase, FileText, CheckCircle2, Phone, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const loanTypes = [
  "ПОД ЗАЛОГ ЗОЛОТА",
  "ПОТРЕБИТЕЛЬСКИЙ КРЕДИТ",
  "АВТОКРЕДИТ",
  "ДЛЯ РАЗВИТИЯ ХОЗЯЙСТВА",
  "ДЛЯ РАЗВИТИЯ БИЗНЕСА",
  "ПОД ЗАЛОГ ДЕПОЗИТА"
];

const creditStatuses = [
  { value: '1', label: "Принято" },
  { value: '2', label: "Передано в обработку" },
  { value: '3', label: "Обработано" },
  { value: '4', label: "Отказано" },
  { value: '5', label: "Доработка" }
];

export function CreditFormPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    patronymic: '',
    phone: '',
    inn: '',
    client_code: '',
    employment_date: '',
    workplace: '',
    salary: '',
    additional_income_source: '',
    additional_income_amount: '',
    loan_type: '',
    loan_purpose: '',
    loan_term: '',
    loan_amount: '',
    branch_office: '',
    address: '',
    credit_status_id: '1',
    identity_verified: false,
    is_new_client: false,
    
    frontPassport: null as File | null,
    backPassport: null as File | null,
    selfie: null as File | null,
    incomeProof: null as File | null,
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      updateForm(key, e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.surname || !formData.phone || !formData.inn) {
      toast.error('Пожалуйста, заполните обязательные личные данные (ФИО, Телефон, ИНН)');
      return;
    }

    setLoading(true);
    try {
      const formBody = new FormData();
      
      formBody.append('name', formData.name.trim());
      formBody.append('surname', formData.surname.trim());
      formBody.append('patronymic', formData.patronymic.trim());
      formBody.append('phone', formData.phone.trim());
      formBody.append('inn', formData.inn.trim());
      formBody.append('client_code', formData.client_code.trim());
      formBody.append('employment_date', formData.employment_date ? new Date(formData.employment_date).toISOString() : '');
      formBody.append('workplace', formData.workplace.trim());
      formBody.append('salary', formData.salary.trim());
      formBody.append('additional_income_source', formData.additional_income_source.trim());
      formBody.append('additional_income_amount', formData.additional_income_amount.trim());
      formBody.append('loan_type', formData.loan_type);
      formBody.append('loan_purpose', formData.loan_purpose.trim());
      formBody.append('loan_term', formData.loan_term.trim());
      formBody.append('loan_amount', formData.loan_amount.trim());
      formBody.append('branch_office', formData.branch_office.trim());
      formBody.append('address', formData.address.trim());
      formBody.append('credit_status_id', formData.credit_status_id);
      
      formBody.append('identity_verified', String(formData.identity_verified));
      formBody.append('is_new_client', String(formData.is_new_client));

      if (formData.frontPassport) {
        formBody.append('front_side_of_the_passport_file', formData.frontPassport);
      }
      if (formData.backPassport) {
        formBody.append('back_side_of_the_passport_file', formData.backPassport);
      }
      if (formData.selfie) {
        formBody.append('selfie_with_passport_file', formData.selfie);
      }
      if (formData.incomeProof) {
        formBody.append('income_proof_document_file', formData.incomeProof);
      }

      /* 
      const backendUrl = process.env.NEXT_PUBLIC_CREDIT_API_URL;
      const response = await fetch(`${backendUrl}/credits`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formBody
      });
      if (!response.ok) throw new Error('Ошибка при сохранении заявки');
      */

      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Заявка на кредит успешно создана!');
    } catch (e) {
      toast.error('Произошла ошибка при сохранении данных');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Оформление кредита"
      description="Внимательно заполните данные клиента и загрузите необходимые документы."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка: Основная форма */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Личные данные */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Личные данные
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Фамилия <span className="text-red-500">*</span></Label>
                <Input placeholder="Иванов" value={formData.surname} onChange={(e) => updateForm('surname', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Имя <span className="text-red-500">*</span></Label>
                <Input placeholder="Иван" value={formData.name} onChange={(e) => updateForm('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Отчество</Label>
                <Input placeholder="Иванович" value={formData.patronymic} onChange={(e) => updateForm('patronymic', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Телефон <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="+992..." value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ИНН <span className="text-red-500">*</span></Label>
                <Input placeholder="123456789" value={formData.inn} onChange={(e) => updateForm('inn', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Код клиента (АБС)</Label>
                <Input placeholder="Например: 12345" value={formData.client_code} onChange={(e) => updateForm('client_code', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Адрес проживания</Label>
                <Input placeholder="г. Душанбе, ул. Айни..." value={formData.address} onChange={(e) => updateForm('address', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Данные о работе и доходах */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Работа и доходы
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Место работы</Label>
                <Input placeholder="ООО Компания" value={formData.workplace} onChange={(e) => updateForm('workplace', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Дата трудоустройства</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-9" value={formData.employment_date} onChange={(e) => updateForm('employment_date', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Основная заработная плата</Label>
                <Input type="number" placeholder="0.00" value={formData.salary} onChange={(e) => updateForm('salary', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Сумма доп. дохода</Label>
                <Input type="number" placeholder="0.00" value={formData.additional_income_amount} onChange={(e) => updateForm('additional_income_amount', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Источник доп. дохода</Label>
                <Input placeholder="Аренда, фриланс и т.д." value={formData.additional_income_source} onChange={(e) => updateForm('additional_income_source', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Параметры кредита */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Параметры кредита
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Тип кредита</Label>
                <Select value={formData.loan_type} onValueChange={(v) => updateForm('loan_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Статус кредита</Label>
                <Select value={formData.credit_status_id} onValueChange={(v) => updateForm('credit_status_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Сумма кредита</Label>
                <Input type="number" placeholder="0.00" value={formData.loan_amount} onChange={(e) => updateForm('loan_amount', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Срок кредита (мес.)</Label>
                <Input type="number" placeholder="12" value={formData.loan_term} onChange={(e) => updateForm('loan_term', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Цель кредита</Label>
                <Input placeholder="Например: Ремонт квартиры" value={formData.loan_purpose} onChange={(e) => updateForm('loan_purpose', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Отделение получения</Label>
                <Input placeholder="Укажите офис" value={formData.branch_office} onChange={(e) => updateForm('branch_office', e.target.value)} />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Правая колонка: Документы и Настройки */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Подтверждения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Личность подтверждена</Label>
                  <CardDescription>Клиент идентифицирован</CardDescription>
                </div>
                <Switch 
                  checked={formData.identity_verified} 
                  onCheckedChange={(v) => updateForm('identity_verified', v)} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Отправить СМС</Label>
                  <CardDescription>Оповестить клиента</CardDescription>
                </div>
                <Switch 
                  checked={formData.is_new_client} 
                  onCheckedChange={(v) => updateForm('is_new_client', v)} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                Документы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <Label>Паспорт (Лицевая сторона)</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'frontPassport')} />
              </div>

              <div className="space-y-2">
                <Label>Паспорт (Оборотная сторона)</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'backPassport')} />
              </div>

              <div className="space-y-2">
                <Label>Селфи с паспортом</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-600">Справка о доходах (если есть)</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'incomeProof')} />
              </div>

            </CardContent>
          </Card>

          <Button 
            className="w-full h-12 text-md shadow-lg transition-all hover:scale-[1.02]" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {loading ? 'Сохранение...' : 'Сохранить заявку'}
          </Button>
        </div>

      </div>
    </PageContainer>
  );
}
