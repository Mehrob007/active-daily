'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, RefreshCw, CreditCard, Smartphone, PhoneCall, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export function OperatorReportsPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      toast.success('Данные успешно обновлены');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast.info('Формирование отчета в Excel...');
  };

  // Dummy data generators for the reports
  const generateCardsData = () => Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    name: `Сотрудник ${i + 1}`,
    cardsSailed: Math.floor(Math.random() * 200),
    debOsd: Math.floor(Math.random() * 100000),
    outBalance: Math.floor(Math.random() * 500000)
  }));

  const generateMbData = () => Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    name: `Сотрудник ${i + 1}`,
    connects: Math.floor(Math.random() * 50)
  }));

  const generateKcData = () => Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    name: `Сотрудник ${i + 1}`,
    calls: Math.floor(Math.random() * 300),
    rating: (Math.random() * 5).toFixed(1)
  }));

  const generateTestsData = () => Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    name: `Сотрудник ${i + 1}`,
    testsPassed: Math.floor(Math.random() * 10),
    avgScore: Math.floor(Math.random() * 100)
  }));

  return (
    <PageContainer
      title="Отчеты оператора"
      subtitle="Аналитические сводки по различным направлениям работы"
    >
      <div className="flex flex-col gap-6">
        
        {/* Global Filters */}
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Месяц</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Выберите месяц" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Январь</SelectItem>
                  <SelectItem value="2">Февраль</SelectItem>
                  <SelectItem value="3">Март</SelectItem>
                  <SelectItem value="4">Апрель</SelectItem>
                  <SelectItem value="5">Май</SelectItem>
                  <SelectItem value="6">Июнь</SelectItem>
                  <SelectItem value="7">Июль</SelectItem>
                  <SelectItem value="8">Август</SelectItem>
                  <SelectItem value="9">Сентябрь</SelectItem>
                  <SelectItem value="10">Октябрь</SelectItem>
                  <SelectItem value="11">Ноябрь</SelectItem>
                  <SelectItem value="12">Декабрь</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Год</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Выберите год" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium">Поиск сотрудника</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ФИО сотрудника..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Выгрузить Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Reports */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Отчет по картам
            </TabsTrigger>
            <TabsTrigger value="mb" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> Отчет по МБ
            </TabsTrigger>
            <TabsTrigger value="kc" className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4" /> Отчет КЦ
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Отчет Тесты
            </TabsTrigger>
          </TabsList>

          {/* Cards Report */}
          <TabsContent value="cards">
            <Card>
              <CardHeader>
                <CardTitle>Статистика по картам</CardTitle>
                <CardDescription>Количество выпущенных карт и остатки по счетам</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="h-12 px-4 font-medium">ФИО сотрудника</th>
                        <th className="h-12 px-4 font-medium text-right">Выпущено карт</th>
                        <th className="h-12 px-4 font-medium text-right">Остатки (deb_osd)</th>
                        <th className="h-12 px-4 font-medium text-right">Привлечено (out_balance)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateCardsData().map(row => (
                        <tr key={row.id} className="border-t hover:bg-muted/30">
                          <td className="p-4 font-medium">{row.name}</td>
                          <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{row.cardsSailed}</td>
                          <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{row.debOsd.toLocaleString('ru-RU')} ₸</td>
                          <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{row.outBalance.toLocaleString('ru-RU')} ₸</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MB Report */}
          <TabsContent value="mb">
            <Card>
              <CardHeader>
                <CardTitle>Статистика Мобильного Банка</CardTitle>
                <CardDescription>Количество новых подключений к мобильному приложению</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="h-12 px-4 font-medium">ФИО сотрудника</th>
                        <th className="h-12 px-4 font-medium text-right">Количество подключений</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateMbData().map(row => (
                        <tr key={row.id} className="border-t hover:bg-muted/30">
                          <td className="p-4 font-medium">{row.name}</td>
                          <td className="p-4 text-right cursor-pointer hover:bg-muted/50 font-semibold">{row.connects}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KC Report */}
          <TabsContent value="kc">
            <Card>
              <CardHeader>
                <CardTitle>Статистика Колл-центра (КЦ)</CardTitle>
                <CardDescription>Обработанные звонки и средняя оценка качества</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="h-12 px-4 font-medium">ФИО сотрудника</th>
                        <th className="h-12 px-4 font-medium text-right">Количество звонков</th>
                        <th className="h-12 px-4 font-medium text-right">Средняя оценка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateKcData().map(row => (
                        <tr key={row.id} className="border-t hover:bg-muted/30">
                          <td className="p-4 font-medium">{row.name}</td>
                          <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{row.calls}</td>
                          <td className="p-4 text-right cursor-pointer hover:bg-muted/50 text-primary font-medium">{row.rating} / 5.0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Report */}
          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle>Статистика по Тестированию</CardTitle>
                <CardDescription>Количество пройденных тестов и средний балл</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="h-12 px-4 font-medium">ФИО сотрудника</th>
                        <th className="h-12 px-4 font-medium text-right">Пройдено тестов</th>
                        <th className="h-12 px-4 font-medium text-right">Средний балл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateTestsData().map(row => (
                        <tr key={row.id} className="border-t hover:bg-muted/30">
                          <td className="p-4 font-medium">{row.name}</td>
                          <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{row.testsPassed}</td>
                          <td className="p-4 text-right cursor-pointer hover:bg-muted/50 text-green-600 font-medium">{row.avgScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </PageContainer>
  );
}
