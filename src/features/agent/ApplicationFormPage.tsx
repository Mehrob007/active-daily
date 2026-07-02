'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Save, DownloadCloud, FileText, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { FileUploader } from './components/FileUploader';
import { applicationFormSchema, type ApplicationFormValues } from './validations/application-schema';
import { 
  visaCards, mcCards, ncCards, docTypes, genders, reginTypes, 
  USTypes, districtTypes, streetTypes 
} from '@/config/constants';

interface ApplicationFormPageProps {
  type: 'card' | 'credit' | 'deposit';
  id?: string;
}

export default function ApplicationFormPage({ type, id }: ApplicationFormPageProps) {
  const isEdit = !!id;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [terrorMatch, setTerrorMatch] = useState<{ fullName: boolean | null, cardName: boolean | null }>({ fullName: null, cardName: null });

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      is_new_client: false,
      identity_verified: false,
      is_resident: false,
      gender: 0,
      product: '',
      account_usd: '',
      account_eur: '',
      account_tjs: '',
      contract_number: '',
      contract_date: '',
    }
  });

  const { watch, setValue } = form;
  const isNewClient = watch('is_new_client');
  const messageType = watch('message_type');
  const phoneNumber = watch('phone_number');

  const handleSearchABS = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error('Введите корректный номер телефона для поиска');
      return;
    }
    
    setSearching(true);
    try {
      // TODO: Replace with real agentService.searchABS(phoneNumber)
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Клиент найден в АБС, данные заполнены');
      
      setValue('name', 'Иван');
      setValue('surname', 'Иванов');
      setValue('patronymic', 'Иванович');
      setValue('inn', '123456789');
      setValue('client_code', 'ABS-999');
      setValue('gender', 0);
    } catch (error) {
      toast.error('Клиент не найден в АБС');
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async (data: ApplicationFormValues) => {
    setLoading(true);
    try {
      console.log('Submitting data:', data);
      

      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(isEdit ? 'Заявка успешно обновлена' : 'Заявка успешно создана');
      router.push(`/${type}-apps/list`);
    } catch (error) {
      toast.error('Ошибка при сохранении заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title={isEdit ? `Редактирование заявки #${id}` : `Новая заявка (${type})`}
      subtitle="Внимательно заполните данные клиента"
      backUrl={`/${type}-apps/list`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Documents Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Документы</CardTitle>
              <CardDescription>Загрузите необходимые сканы паспорта и фото клиента</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="front_side_of_the_passport_file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploader 
                        label="Лицевая сторона паспорта" 
                        value={field.value} 
                        onChange={field.onChange} 
                        placeholderImage="/placeholder-passport-front.png"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="back_side_of_the_passport_file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploader 
                        label="Обратная сторона (Прописка)" 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="selfie_with_passport_file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploader 
                        label="Селфи с паспортом" 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Verification Section */}
          <Card>
            <CardHeader>
              <CardTitle>Верификация и Уведомления</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="identity_verified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Личность подтверждена?</FormLabel>
                      <FormDescription>Я лично проверил документы клиента</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-4 rounded-md border p-4">
                <FormField
                  control={form.control}
                  name="is_new_client"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Отправить SMS?</FormLabel>
                        <FormDescription>Уведомить клиента о статусе заявки</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {isNewClient && (
                  <FormField
                    control={form.control}
                    name="message_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип SMS</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тип сообщения" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="accepted">Заявка принята</SelectItem>
                            <SelectItem value="rejected">Заявка отклонена</SelectItem>
                            <SelectItem value="card_opened">Карта успешно открыта</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {isNewClient && messageType === 'rejected' && (
                  <FormField
                    control={form.control}
                    name="rejection_reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Причина отклонения</FormLabel>
                        <FormControl>
                          <Input placeholder="Например: Несовпадение данных" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Primary Data */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Основные данные</CardTitle>
                <CardDescription>Поиск в АБС доступен по номеру телефона</CardDescription>
              </div>
              <Button type="button" variant="secondary" onClick={handleSearchABS} disabled={searching || !phoneNumber}>
                {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Найти клиента в АБС
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              
              <FormField control={form.control} name="surname" render={({ field }) => (
                <FormItem><FormLabel>Фамилия *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Имя *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="patronymic" render={({ field }) => (
                <FormItem><FormLabel>Отчество</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="birth_date" render={({ field }) => (
                <FormItem><FormLabel>Дата рождения *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="phone_number" render={({ field }) => (
                <FormItem><FormLabel>Телефон *</FormLabel><FormControl><Input {...field} placeholder="992..." /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="secret_word" render={({ field }) => (
                <FormItem><FormLabel>Кодовое слово</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="card_name" render={({ field }) => (
                <FormItem><FormLabel>Имя на карте (Латиница)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="client_code" render={({ field }) => (
                <FormItem><FormLabel>Код клиента (ABS)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Пол</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value.toString()}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {genders.map(g => <SelectItem key={g.value} value={g.value.toString()}>{g.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="is_resident" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-8">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel>Резидент РТ</FormLabel>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Passport Data */}
          <Card>
            <CardHeader>
              <CardTitle>Паспортные данные</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <FormField control={form.control} name="type_of_certificate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип документа</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString() || ''}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {docTypes.map(d => <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="documents_series" render={({ field }) => (
                <FormItem><FormLabel>Серия</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="document_number" render={({ field }) => (
                <FormItem><FormLabel>Номер</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="passport_issued_at" render={({ field }) => (
                <FormItem><FormLabel>Дата выдачи</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="passport_deadline" render={({ field }) => (
                <FormItem><FormLabel>Срок действия</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="issued_by" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Кем выдан</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="inn" render={({ field }) => (
                <FormItem><FormLabel>ИНН</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>
          
          {/* Product Form Additions */}
          <Card>
            <CardHeader>
              <CardTitle>Данные продукта</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="product" render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Выбранный продукт *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Выберите продукт..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem disabled value="headers">--- Карты VISA ---</SelectItem>
                      {visaCards.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      <SelectItem disabled value="headers2">--- Карты Mastercard ---</SelectItem>
                      {mcCards.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      <SelectItem disabled value="headers3">--- Национальные карты ---</SelectItem>
                      {ncCards.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="account_usd" render={({ field }) => (
                <FormItem><FormLabel>Счет USD *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="account_eur" render={({ field }) => (
                <FormItem><FormLabel>Счет EUR *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="account_tjs" render={({ field }) => (
                <FormItem><FormLabel>Счет TJS *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contract_number" render={({ field }) => (
                <FormItem><FormLabel>Номер договора *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contract_date" render={({ field }) => (
                <FormItem><FormLabel>Дата договора *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="receiving_office" render={({ field }) => (
                <FormItem><FormLabel>Офис получения</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 items-center justify-end sticky bottom-0 bg-background/80 backdrop-blur-md p-4 border-t z-10">
             <Button type="button" variant="outline" onClick={() => toast.info('Загрузка оферты...')}>
               <FileText className="mr-2 h-4 w-4" /> Скачать оферту
             </Button>
             <Button type="button" variant="outline" onClick={() => toast.info('Скачивание анкеты...')}>
               <DownloadCloud className="mr-2 h-4 w-4" /> Скачать анкету
             </Button>
             <Button type="submit" disabled={loading}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
               Сохранить заявку
             </Button>
          </div>
          
        </form>
      </Form>
    </PageContainer>
  );
}
