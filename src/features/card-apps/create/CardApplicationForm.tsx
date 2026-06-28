'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Loader2, Save, Download, AlertTriangle, ShieldCheck, FileText, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CardApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState('');
  
  const [terrorCheck, setTerrorCheck] = useState<{status: 'idle' | 'checking' | 'safe' | 'danger'}>({ status: 'idle' });

  const handleSearchClient = async () => {
    if (!phoneSearch) {
      toast.error('Введите номер телефона');
      return;
    }
    setIsSearching(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Клиент найден (Mock)');
    } finally {
      setIsSearching(false);
    }
  };

  const checkTerroristList = async () => {
    setTerrorCheck({ status: 'checking' });
    try {
      await new Promise(r => setTimeout(r, 800));
      setTerrorCheck({ status: 'safe' });
      toast.success('Проверка пройдена. Совпадений не найдено.');
    } catch {
      setTerrorCheck({ status: 'danger' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Заявка успешно создана!');
    } catch {
      toast.error('Ошибка сохранения заявки');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer
      title="Оформление заявки на карту"
      description="Заполните данные клиента для выпуска новой банковской карты."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Секция поиска */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Быстрый поиск клиента</CardTitle>
            <CardDescription>Заполните форму автоматически, найдя клиента по номеру телефона.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 max-w-md space-y-2">
                <Label>Номер телефона</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="992 00 000 0000" 
                    value={phoneSearch}
                    onChange={e => setPhoneSearch(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={handleSearchClient} disabled={isSearching}>
                    {isSearching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                    Найти
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Основные данные (Grid) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Личные данные */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg">Личные данные</CardTitle>
                <CardDescription>ФИО, дата рождения и проверка безопасности.</CardDescription>
              </div>
              {terrorCheck.status === 'safe' && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Безопасно
                </div>
              )}
              {terrorCheck.status === 'danger' && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md animate-pulse">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Совпадение в списке!
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Фамилия <span className="text-red-500">*</span></Label>
                  <Input placeholder="Иванов" required onBlur={checkTerroristList} />
                </div>
                <div className="space-y-2">
                  <Label>Имя <span className="text-red-500">*</span></Label>
                  <Input placeholder="Иван" required onBlur={checkTerroristList} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Отчество</Label>
                  <Input placeholder="Иванович" />
                </div>
                <div className="space-y-2">
                  <Label>Имя на карте (Латиница) <span className="text-red-500">*</span></Label>
                  <Input placeholder="IVAN IVANOV" className="uppercase" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата рождения <span className="text-red-500">*</span></Label>
                  <Input type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Пол <span className="text-red-500">*</span></Label>
                  <Select required>
                    <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Мужской</SelectItem>
                      <SelectItem value="F">Женский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label>Кодовое слово <span className="text-red-500">*</span></Label>
                <Input placeholder="Мама" required />
              </div>
            </CardContent>
          </Card>

          {/* Паспортные данные и файлы */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Паспортные данные</CardTitle>
              <CardDescription>Серия, ИНН и сканы документов.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Серия и номер <span className="text-red-500">*</span></Label>
                  <Input placeholder="A0000000" required />
                </div>
                <div className="space-y-2">
                  <Label>ИНН <span className="text-red-500">*</span></Label>
                  <Input placeholder="123456789" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Кем выдан <span className="text-red-500">*</span></Label>
                  <Input placeholder="МВД РТ" required />
                </div>
                <div className="space-y-2">
                  <Label>Дата выдачи <span className="text-red-500">*</span></Label>
                  <Input type="date" required />
                </div>
              </div>

              <div className="pt-4 space-y-4 border-t mt-4">
                <Label>Прикрепление файлов</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Camera className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-center text-muted-foreground">Лицевая сторона</span>
                    <Input type="file" className="hidden" />
                  </div>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Camera className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-center text-muted-foreground">Прописка</span>
                    <Input type="file" className="hidden" />
                  </div>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <FileText className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-center text-muted-foreground">Справка / Файл</span>
                    <Input type="file" className="hidden" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Адрес и параметры карты */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Адрес проживания</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Регион <span className="text-red-500">*</span></Label>
                  <Select required>
                    <SelectTrigger><SelectValue placeholder="Регион" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dushanbe">Душанбе</SelectItem>
                      <SelectItem value="sughd">Согдийская область</SelectItem>
                      <SelectItem value="khatlon">Хатлонская область</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Район <span className="text-red-500">*</span></Label>
                  <Input placeholder="Район" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Улица <span className="text-red-500">*</span></Label>
                  <Input placeholder="Название улицы" required />
                </div>
                <div className="space-y-2">
                  <Label>Дом/Кв</Label>
                  <Input placeholder="12 / 34" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Настройки карты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Платежная система <span className="text-red-500">*</span></Label>
                <Tabs defaultValue="corti_milli" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="visa">Visa</TabsTrigger>
                    <TabsTrigger value="corti_milli">Корти Милли</TabsTrigger>
                    <TabsTrigger value="mastercard">MasterCard</TabsTrigger>
                  </TabsList>
                  <TabsContent value="visa" className="pt-4">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Выберите тип карты Visa" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa_classic">Visa Classic</SelectItem>
                        <SelectItem value="visa_gold">Visa Gold</SelectItem>
                        <SelectItem value="visa_platinum">Visa Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </TabsContent>
                  <TabsContent value="corti_milli" className="pt-4">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Выберите тип Корти Милли" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm_classic">Корти Милли Classic</SelectItem>
                        <SelectItem value="cm_gold">Корти Милли Gold</SelectItem>
                      </SelectContent>
                    </Select>
                  </TabsContent>
                  <TabsContent value="mastercard" className="pt-4">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Выберите тип MasterCard" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mc_standard">MasterCard Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="pt-4 space-y-3">
                <Label>Дополнительные опции</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sms_inform" defaultChecked />
                  <Label htmlFor="sms_inform" className="font-normal">Подключить SMS-информирование</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="internet_bank" defaultChecked />
                  <Label htmlFor="internet_bank" className="font-normal">Подключить Мобильный банк</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 bg-muted/20 p-4 rounded-lg border">
          <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            Скачать анкету
          </Button>
          <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            Скачать оферту
          </Button>
          <Button type="submit" size="lg" className="w-full sm:w-auto shadow-md" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Создать заявку
          </Button>
        </div>

      </form>
    </PageContainer>
  );
}
