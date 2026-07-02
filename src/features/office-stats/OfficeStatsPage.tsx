'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Users, PieChart, LineChart, TrendingUp, Download, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function OfficeStatsPage() {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState("office");
  const [year, setYear] = useState(currentYear.toString());

  const mockOfficeData = [
    { id: 1, month: 'Январь', cardsSold: 120, turnovers: 50000, newClients: 45, planProgress: 85 },
    { id: 2, month: 'Февраль', cardsSold: 145, turnovers: 62000, newClients: 52, planProgress: 95 },
    { id: 3, month: 'Март', cardsSold: 180, turnovers: 85000, newClients: 70, planProgress: 110 },
  ];

  const mockEmployeeData = [
    { id: 1, name: 'Иванов Иван', position: 'Старший менеджер', cards: 50, score: 9.5, premia: '1200 TJS' },
    { id: 2, name: 'Петрова Анна', position: 'Специалист', cards: 42, score: 8.8, premia: '900 TJS' },
    { id: 3, name: 'Сидоров Олег', position: 'Кассир', cards: 30, score: 9.0, premia: '850 TJS' },
  ];

  return (
    <PageContainer
      title="Статистика офиса"
      description="Отчетность и аналитика по вашему филиалу и сотрудникам."
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="office" className="flex gap-2">
              <Building className="w-4 h-4" />
              <span>По офису</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex gap-2">
              <Users className="w-4 h-4" />
              <span>По сотрудникам</span>
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

      {activeTab === "office" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Продажи карт</CardTitle>
                <PieChart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">445</div>
                <p className="text-xs text-muted-foreground mt-1">+12% к прошлому кварталу</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Общий оборот</CardTitle>
                <LineChart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">197,000 TJS</div>
                <p className="text-xs text-muted-foreground mt-1">+8% к прошлому кварталу</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Выполнение плана</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">96.6%</div>
                <p className="text-xs text-muted-foreground mt-1">Осталось 3.4% до цели</p>
              </CardContent>
            </Card>
          </div>

          {/* Table Report Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Сводная таблица по офису ({year})</CardTitle>
              <CardDescription>
                Нажмите на строку месяца, чтобы обновить графики ниже.
              </CardDescription>
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
                  {mockOfficeData.map((row) => (
                    <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell>{row.cardsSold}</TableCell>
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

          {/* Chart Placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">График по картам (Recharts)</p>
              <p className="text-xs text-muted-foreground">ChartReportCards component</p>
            </Card>
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <LineChart className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">График по финансам (Recharts)</p>
              <p className="text-xs text-muted-foreground">ChartReportFinance component</p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "employees" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по сотрудникам ({year})</CardTitle>
              <CardDescription>
                Показатели KPI, продажи и премии каждого сотрудника вашего офиса.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Продано карт</TableHead>
                    <TableHead>Оценка качества</TableHead>
                    <TableHead className="text-right">Предв. премия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployeeData.map((row) => (
                    <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.position}</TableCell>
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

          {/* Chart Placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-80 flex flex-col items-center justify-center border-dashed bg-muted/10">
              <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Спецификация сотрудника (Recharts)</p>
              <p className="text-xs text-muted-foreground">Отображается при клике на строку</p>
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
