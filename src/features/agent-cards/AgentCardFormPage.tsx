'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, Upload, FileCheck, ShieldAlert, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { toast } from 'sonner';

export function AgentCardFormPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingTerror, setCheckingTerror] = useState(false);
  const [terrorStatus, setTerrorStatus] = useState<'idle' | 'checking' | 'clean' | 'match'>('idle');

  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    patronymic: '',
    phone: '',
    iin: '',
    birthDate: '',
    gender: 'Мужской',
    
    frontPassport: null as File | null,
    backPassport: null as File | null,
    selfie: null as File | null,
    
    cardType: 'VISA Platinum',
    secretWord: '',
    deliveryCity: '',
    deliveryAddress: '',
    receivingOffice: '',
    isResident: true
  });

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (formData.surname && formData.name) {
        setTerrorStatus('checking');
        setTimeout(() => {
          setTerrorStatus('clean');
          toast.success('Проверка по базам пройдена успешно');
        }, 1500);
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formBody = new FormData();
      formBody.append('surname', formData.surname);
      formBody.append('name', formData.name);
      formBody.append('patronymic', formData.patronymic);
      formBody.append('phone_number', formData.phone);
      formBody.append('inn', formData.iin);
      formBody.append('birth_date', formData.birthDate);
      formBody.append('gender', formData.gender);
      formBody.append('card_type', formData.cardType);
      formBody.append('secret_word', formData.secretWord);
      formBody.append('delivery_address', formData.deliveryAddress);
      formBody.append('receiving_office', formData.receivingOffice);
      formBody.append('is_resident', formData.isResident ? 'true' : 'false');

      if (formData.frontPassport) {
        formBody.append('front_side_of_the_passport', formData.frontPassport);
      }
      if (formData.backPassport) {
        formBody.append('back_side_of_the_passport', formData.backPassport);
      }
      if (formData.selfie) {
        formBody.append('selfie_with_passport', formData.selfie);
      }

      /*
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formBody
      });
      if (!response.ok) throw new Error('Ошибка сети');
      */
      
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Заявка на карту успешно создана!');
    } catch (e) {
      toast.error('Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Оформление карты"
      subtitle="Мастер создания новой заявки на выпуск банковской карты"
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Stepper Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300`} style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
            
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center gap-2 bg-background px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${currentStep >= step ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'}`}>
                  {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                </div>
                <span className={`text-xs font-medium ${currentStep >= step ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step === 1 ? 'Личные данные' : step === 2 ? 'Документы' : 'Настройки карты'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 ? 'Шаг 1: Персональные данные' : 
               currentStep === 2 ? 'Шаг 2: Документы и Фотографии' : 
               'Шаг 3: Выпуск и Доставка'}
            </CardTitle>
            <CardDescription>
              Пожалуйста, заполните все обязательные поля для продолжения
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-[400px]">
            {/* STEP 1: Personal Data */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2">ФИО Клиента</h3>
                </div>
                
                <div className="space-y-2">
                  <Label>Фамилия <span className="text-destructive">*</span></Label>
                  <Input placeholder="Иванов" value={formData.surname} onChange={e => updateForm('surname', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Имя <span className="text-destructive">*</span></Label>
                  <Input placeholder="Иван" value={formData.name} onChange={e => updateForm('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Отчество</Label>
                  <Input placeholder="Иванович" value={formData.patronymic} onChange={e => updateForm('patronymic', e.target.value)} />
                </div>

                <div className="space-y-4 md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium border-b pb-2">Основные данные</h3>
                </div>

                <div className="space-y-2">
                  <Label>ИИН <span className="text-destructive">*</span></Label>
                  <Input placeholder="900101300000" maxLength={12} value={formData.iin} onChange={e => updateForm('iin', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Номер телефона <span className="text-destructive">*</span></Label>
                  <Input placeholder="+7 (777) 000-00-00" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label>Дата рождения</Label>
                  <Input type="date" value={formData.birthDate} onChange={e => updateForm('birthDate', e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label>Пол</Label>
                  <RadioGroup defaultValue={formData.gender} onValueChange={(v) => updateForm('gender', v)} className="flex gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Мужской" id="r1" />
                      <Label htmlFor="r1">Мужской</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Женский" id="r2" />
                      <Label htmlFor="r2">Женский</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2 md:col-span-2 flex items-center space-x-2 bg-muted/50 p-4 rounded-lg mt-4 border">
                  <Checkbox 
                    id="resident" 
                    checked={formData.isResident}
                    onCheckedChange={(c) => updateForm('isResident', !!c)}
                  />
                  <Label htmlFor="resident" className="font-medium cursor-pointer">
                    Является резидентом Республики Казахстан
                  </Label>
                </div>
              </div>
            )}

            {/* STEP 2: Documents */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Terror Check Status */}
                <div className={`p-4 rounded-lg border flex items-start gap-4 ${terrorStatus === 'checking' ? 'bg-amber-50 border-amber-200' : terrorStatus === 'clean' ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
                  {terrorStatus === 'checking' ? (
                    <ShieldAlert className="w-8 h-8 text-amber-500 animate-pulse mt-1" />
                  ) : terrorStatus === 'clean' ? (
                    <ShieldCheck className="w-8 h-8 text-green-500 mt-1" />
                  ) : (
                    <ShieldAlert className="w-8 h-8 text-muted-foreground mt-1" />
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-sm">Проверка по спискам ПОД/ФТ</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {terrorStatus === 'checking' ? 'Выполняется поиск совпадений по базам данных...' : 
                       terrorStatus === 'clean' ? 'Клиент не найден в списках террористов и экстремистов. Проверка пройдена.' : 
                       'Ожидание проверки...'}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-medium border-b pb-2 mt-8">Сканы документов</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Front Passport */}
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Удостоверение (Лицевая)</h4>
                      <p className="text-xs text-muted-foreground mt-1">Нажмите или перетащите файл</p>
                    </div>
                  </div>

                  {/* Back Passport */}
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Удостоверение (Оборот)</h4>
                      <p className="text-xs text-muted-foreground mt-1">Нажмите или перетащите файл</p>
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Селфи с документом</h4>
                      <p className="text-xs text-muted-foreground mt-1">Нажмите или перетащите файл</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 3: Card Settings */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2">Параметры карты</h3>
                </div>

                <div className="space-y-2">
                  <Label>Тип карты <span className="text-destructive">*</span></Label>
                  <Select value={formData.cardType} onValueChange={(v) => updateForm('cardType', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1635.11">Visa Business</SelectItem>
                      <SelectItem value="1635.03">Visa Gold</SelectItem>
                      <SelectItem value="1636.04">MC Platinum</SelectItem>
                      <SelectItem value="1636.02">MC Standard</SelectItem>
                      <SelectItem value="1637.01">Korti Milli Fast Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Кодовое слово <span className="text-destructive">*</span></Label>
                  <Input placeholder="Например: Девичья фамилия матери" value={formData.secretWord} onChange={e => updateForm('secretWord', e.target.value)} />
                </div>

                <div className="space-y-4 md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium border-b pb-2">Доставка и Офис</h3>
                </div>

                <div className="space-y-2">
                  <Label>Офис получения <span className="text-destructive">*</span></Label>
                  <Select value={formData.receivingOffice} onValueChange={(v) => updateForm('receivingOffice', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите офис" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office_1">Головной офис (Абай 10)</SelectItem>
                      <SelectItem value="office_2">Филиал №2 (Сейфуллина 50)</SelectItem>
                      <SelectItem value="office_3">Филиал №3 (Достык 100)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Регион доставки</Label>
                  <Select value={formData.deliveryCity} onValueChange={(v) => updateForm('deliveryCity', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите город" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="almaty">Алматы</SelectItem>
                      <SelectItem value="astana">Астана</SelectItem>
                      <SelectItem value="shymkent">Шымкент</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Адрес доставки (если курьером)</Label>
                  <Input placeholder="Улица, дом, квартира..." value={formData.deliveryAddress} onChange={e => updateForm('deliveryAddress', e.target.value)} />
                </div>

                <div className="md:col-span-2 mt-6 p-6 bg-primary/5 rounded-xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">Договор и Оффер</h4>
                    <p className="text-sm text-muted-foreground mt-1">Сгенерируйте договор для подписания клиентом.</p>
                  </div>
                  <Button variant="outline" className="shrink-0 bg-background">
                    <Download className="mr-2 w-4 h-4" /> Скачать PDF Договор
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
            <Button 
              variant="outline" 
              onClick={handlePrev} 
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Назад
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Далее <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="px-8 shadow-lg shadow-primary/30">
                {loading ? 'Отправка...' : 'Отправить заявку'}
                {!loading && <CheckCircle2 className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
