'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, CreditCard, Wallet, Landmark, PiggyBank, Copy, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SEARCH_TYPES = [
  { value: 'client/info/search?phoneNumber=', label: 'По номеру телефона (АБС)' },
  { value: 'client/info/client-index?clientIndex=', label: 'По коду клиента (АБС)' },
  { value: 'byCardId', label: 'По номеру карты (ATM)' },
  { value: 'byAccount', label: 'По номеру счета (ATM)' },
  { value: 'byName', label: 'По ФИО (ATM)' },
  { value: 'byLast4', label: 'По последним 4 цифрам (ATM)' },
];

export function ABSSearchPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState(SEARCH_TYPES[0].value);
  const [clientData, setClientData] = useState<any | null>(null);
  
  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error('Введите данные для поиска');
      return;
    }
    
    setLoading(true);
    setClientData(null);
    try {
      // Имитация API запроса для демонстрации красивого UI
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Имитируем успешный ответ
      setClientData({
        client_code: '12345678',
        name: 'Иван',
        surname: 'Иванов',
        patronymic: 'Иванович',
        tax_code: '123456789',
        document_number: 'A1234567',
        phone: '+992 90 000 00 00',
        dob: '01.01.1990',
        cards: [
          { id: '1', mask: '4314 **** **** 1234', type: 'Visa Gold', status: 'Активна', balance: '1 500 TJS' },
          { id: '2', mask: '5048 **** **** 5678', type: 'Корти Милли', status: 'Активна', balance: '5 000 TJS' },
        ],
        accounts: [
          { id: '1', number: '20202972000000012345', balance: '1 500 TJS', status: 'Открыт' },
        ],
        credits: [],
        deposits: [],
      });
      toast.success('Клиент успешно найден');
    } catch (error) {
      toast.error('Ошибка при поиске клиента');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано в буфер обмена');
  };

  return (
    <PageContainer
      title="Поиск клиентов в АБС"
      subtitle="Единый интерфейс поиска клиентов и управления их продуктами"
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Параметры поиска</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Тип поиска" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input 
                placeholder="Введите значение для поиска..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading || !searchQuery} className="w-full sm:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Найти
              </Button>
            </div>
          </CardContent>
        </Card>

        {clientData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Карточка профиля клиента */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle>Профиль клиента</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold">
                    {clientData.name[0]}{clientData.surname[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{clientData.surname} {clientData.name} {clientData.patronymic}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-primary" onClick={() => copyToClipboard(clientData.client_code)}>
                      Код: {clientData.client_code} <Copy className="h-3 w-3" />
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ИНН:</span>
                    <span className="font-medium flex items-center gap-1 cursor-pointer" onClick={() => copyToClipboard(clientData.tax_code)}>
                      {clientData.tax_code} <Copy className="h-3 w-3 opacity-50" />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Паспорт:</span>
                    <span className="font-medium flex items-center gap-1 cursor-pointer" onClick={() => copyToClipboard(clientData.document_number)}>
                      {clientData.document_number} <Copy className="h-3 w-3 opacity-50" />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Телефон:</span>
                    <span className="font-medium flex items-center gap-1 cursor-pointer" onClick={() => copyToClipboard(clientData.phone)}>
                      {clientData.phone} <Copy className="h-3 w-3 opacity-50" />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Дата рождения:</span>
                    <span className="font-medium">{clientData.dob}</span>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    <FileText className="h-4 w-4 mr-2" /> Документы
                  </Button>
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Экспорт
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Карточка с табами (продукты) */}
            <Card className="lg:col-span-2">
              <Tabs defaultValue="cards" className="w-full h-full flex flex-col">
                <CardHeader className="pb-0">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="cards" className="flex gap-2"><CreditCard className="h-4 w-4" /> <span className="hidden sm:inline">Карты</span> ({clientData.cards.length})</TabsTrigger>
                    <TabsTrigger value="accounts" className="flex gap-2"><Wallet className="h-4 w-4" /> <span className="hidden sm:inline">Счета</span> ({clientData.accounts.length})</TabsTrigger>
                    <TabsTrigger value="credits" className="flex gap-2"><Landmark className="h-4 w-4" /> <span className="hidden sm:inline">Кредиты</span> ({clientData.credits.length})</TabsTrigger>
                    <TabsTrigger value="deposits" className="flex gap-2"><PiggyBank className="h-4 w-4" /> <span className="hidden sm:inline">Депозиты</span> ({clientData.deposits.length})</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="flex-1 mt-4">
                  <TabsContent value="cards" className="m-0 h-full">
                    {clientData.cards.length > 0 ? (
                      <div className="space-y-4">
                        {clientData.cards.map((card: any) => (
                          <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-14 bg-gradient-to-br from-primary/80 to-primary/40 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                {card.type.substring(0, 4)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{card.mask}</p>
                                <p className="text-xs text-muted-foreground">{card.type} • {card.status}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{card.balance}</p>
                              <div className="flex gap-2 mt-1">
                                <Button variant="ghost" size="sm" className="h-6 text-xs px-2">ПИН</Button>
                                <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-destructive">Блок</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 text-muted-foreground">У клиента нет карт</div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="accounts" className="m-0">
                    {clientData.accounts.length > 0 ? (
                      <div className="space-y-4">
                        {clientData.accounts.map((acc: any) => (
                          <div key={acc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm font-mono">{acc.number}</p>
                              <p className="text-xs text-muted-foreground">{acc.status}</p>
                            </div>
                            <p className="font-bold text-primary">{acc.balance}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 text-muted-foreground">У клиента нет счетов</div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="credits" className="m-0">
                    <div className="text-center p-8 text-muted-foreground">Нет активных кредитов</div>
                  </TabsContent>
                  
                  <TabsContent value="deposits" className="m-0">
                    <div className="text-center p-8 text-muted-foreground">Нет открытых депозитов</div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
