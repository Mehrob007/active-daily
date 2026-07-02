'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Users, PieChart, LineChart, TrendingUp, Download, Building, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BankStatsPage() {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState("bank");
  const [year, setYear] = useState(currentYear.toString());

  const mockBankData = [
    { id: 1, month: 'Январь', cardsSold: 1250, turnovers: 540000, newClients: 450, planProgress: 98 },
    { id: 2, month: 'Февраль', cardsSold: 1405, turnovers: 620000, newClients: 520, planProgress: 105 },
    { id: 3, month: 'Март', cardsSold: 1800, turnovers: 850000, newClients: 700, planProgress: 112 },
  ];

  const mockBranchData = [
    { id: 1, name: 'Главный Офис', city: 'Душанбе', cardsSold: 600, turnovers: 350000, planProgress: 110 },
    { id: 2, name: 'Филиал Север', city: 'Худжанд', cardsSold: 450, turnovers: 280000, planProgress: 95 },
    { id: 3, name: 'Филиал Юг', city: 'Бохтар', cardsSold: 355, turnovers: 220000, planProgress: 102 },
  ];

  const mockEmployeeData = [
    { id: 1, name: 'Смирнов Алексей', branch: 'Главный Офис', cards: 85, score: 9.8, premia: '2500 TJS' },
    { id: 2, name: 'Алиева Зарина', branch: 'Филиал Север', cards: 78, score: 9.5, premia: '2100 TJS' },
    { id: 3, name: 'Каримов Тимур', branch: 'Филиал Юг', cards: 65, score: 9.0, premia: '1800 TJS' },
  ];

  return (
    <PageContainer
      title="Статистика банка"
      description="Глобальная отчетность и аналитика по всему банку, филиалам и сотрудникам."
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="bank" className="flex gap-2">
              <Landmark className="w-4 h-4" />
              <span className="hidden sm:inline">По банку</span>
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex gap-2">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">По филиалам</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">По сотрудникам</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full md:w-auto gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Год" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025 год</SelectItem>
              <SelectItem value="2024">2024 год</SelectItem>
              <SelectItem value="2023">2023 год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {activeTab === "bank" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Всего карт продано</CardTitle>
                <PieChart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,455</div>
                <p className="text-xs text-muted-foreground mt-1">+18% к прошлому кварталу</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Общий оборот банка</CardTitle>
                <LineChart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,010,000 TJS</div>
                <p className="text-xs text-muted-foreground mt-1">+14% к прошлому кварталу</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Выполнение плана</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">105.2%</div>
                <p className="text-xs text-muted-foreground mt-1">План перевыполнен</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Сводная таблица по Банку ({year})</CardTitle>
              <CardDescription>Общие показатели по всем филиалам. Нажмите на месяц для обновления графиков.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Месяц</TableHead>
                    <TableHead>Продано карт</TableHead>
                    <TableHead>Новые клиенты</TableHead>
                    <TableHead>Обороты (TJS)</TableHead>
                    <TableHead className="text-right">План (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBankData.map((row) => (
                    <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell>{row.cardsSold.toLocaleString()}</TableCell>
                      <TableCell>{row.newClients}</TableCell>
                      <TableCell>{row.turnovers.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={row.planProgress >= 100 ? "text-green-600 font-semibold" : "text-amber-600"}>
                          {row.planProgress}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Глобальный график по картам</p>
              <p className="text-xs text-muted-foreground">ChartReportCards component</p>
            </Card>
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <LineChart className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Глобальный график по финансам</p>
              <p className="text-xs text-muted-foreground">ChartReportFinance component</p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "branches" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Рейтинг филиалов и МХБ ({year})</CardTitle>
              <CardDescription>Сравнение показателей эффективности между филиалами.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Филиал</TableHead>
                    <TableHead>Город</TableHead>
                    <TableHead>Продано карт</TableHead>
                    <TableHead>Обороты (TJS)</TableHead>
                    <TableHead className="text-right">Выполнение плана</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBranchData.map((row) => (
                    <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.city}</TableCell>
                      <TableCell>{row.cardsSold}</TableCell>
                      <TableCell>{row.turnovers.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{row.planProgress}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Сравнение филиалов (Карты)</p>
            </Card>
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <LineChart className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Сравнение филиалов (Обороты)</p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "employees" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <CardHeader>
              <CardTitle>ТОП Сотрудников ({year})</CardTitle>
              <CardDescription>Глобальный рейтинг сотрудников по всему банку.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Филиал</TableHead>
                    <TableHead>Продано карт</TableHead>
                    <TableHead>Оценка качества</TableHead>
                    <TableHead className="text-right">Предв. премия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployeeData.map((row) => (
                    <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>{row.cards}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {row.score} / 10
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">{row.premia}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Динамика продаж сотрудника</p>
            </Card>
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <LineChart className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Финансовый план сотрудника</p>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
