'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ChevronLeft, ChevronRight, FileText, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function calculateTotalPremia(worker: any) {
  if (!worker) return 0;
  
  const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

  const card_sales = safeArray(worker.CardSales)[0] || {};
  const turnover = safeArray(worker.CardTurnovers)[0] || {};
  const service = safeArray(worker.ServiceQuality)[0] || {};
  const mobile_bank = safeArray(worker.MobileBank)[0] || {};

  const basePremia =
      (mobile_bank.mobile_bank_connects * 10 || 0) +
      (turnover.card_turnovers_prem || 0) +
      (turnover.active_cards_perms || 0) +
      (card_sales.cards_prem || 0) +
      (worker.salary_project || 0);

  const callCenter = service.call_center === 0 ? 0 : service.call_center;
  let callPercent = 0;

  if (callCenter >= 0 && callCenter <= 1) callPercent = -30;
  else if (callCenter > 1 && callCenter <= 3) callPercent = -20;
  else if (callCenter > 3 && callCenter <= 5) callPercent = -10;
  else if (callCenter > 5 && callCenter <= 7) callPercent = 0;
  else if (callCenter > 7 && callCenter <= 9) callPercent = 10;
  else if (callCenter > 9 && callCenter <= 10) callPercent = 20;

  const tests = service.tests === 0 ? 0 : service.tests;
  let testPercent = 0;

  if (tests >= 0 && tests <= 2) testPercent = -10;
  else if (tests > 2 && tests <= 4) testPercent = -5;
  else if (tests > 4 && tests <= 6) testPercent = 0;
  else if (tests > 6 && tests <= 8) testPercent = 5;
  else if (tests > 8 && tests <= 9) testPercent = 10;
  else if (tests > 9 && tests <= 10) testPercent = 15;

  const totalCoef = (callPercent + testPercent) / 100;
  const calculatedPremia = basePremia * (1 + totalCoef);

  const maxAllowedPremia = (worker.Salary || 5000) * 1.5;

  return Math.min(calculatedPremia, maxAllowedPremia);
}

export function MyPremiePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (m: number, y: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      // Пример запроса по аналогии со старым кодом
      const res = await fetch(`${baseURL}/workers/reports?month=${m}&year=${y}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      
      if (!json || Object.keys(json).length === 0) {
        throw new Error('Нет данных');
      }
      setData(json);
    } catch (err) {
      console.warn("Failed to fetch worker premia, using fallback mock data.");
      // Подставляем моки, чтобы UI работал для верстки
      setData({
        ID: 1,
        Salary: 3500,
        plan: 5000,
        CardSales: [{ cards_prem: 150 }],
        MobileBank: [{ mobile_bank_connects: 12 }],
        salary_project: 200,
        CardTurnovers: [{ card_turnovers_prem: 400.5, active_cards_perms: 100 }],
        ServiceQuality: [{ call_center: 8, complaint: 0, tests: 9 }]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(month, year);
  }, [month, year]);

  const handlePrev = () => {
    let m = month - 1;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m);
    setYear(y);
  };

  const handleNext = () => {
    let m = month + 1;
    let y = year;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  const getMonthName = (m: number) => {
    const names = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    return names[m - 1];
  };

  if (loading && !data) {
    return (
      <PageContainer title="Моя премия">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer title="Моя премия">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </PageContainer>
    );
  }

  const total = calculateTotalPremia(data);
  const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];
  
  const qualityData = safeArray(data?.ServiceQuality)[0] || {};
  const callCenterValue = qualityData?.call_center || 0;
  const testsValue = qualityData?.tests || 0;
  const complaintValue = qualityData?.complaint || 0;

  const plan = data?.plan || 0;
  const planProgress = plan > 0 ? Math.min((total / plan) * 100, 100) : 0;

  return (
    <PageContainer
      title="Моя премия"
      description="Ежемесячный отчет по начислениям и качеству работы."
    >
      <div className="space-y-6">
        
        {/* Header / Month Selector */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
              <Button variant="ghost" size="icon" onClick={handlePrev} disabled={loading}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="w-40 text-center font-semibold text-lg">
                {getMonthName(month)} {year}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNext} disabled={loading}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Начислено премии</p>
                <p className="text-4xl font-bold text-primary">{total.toFixed(2)} <span className="text-xl">TJS</span></p>
              </div>
            </div>
          </CardContent>
          
          {plan > 0 && (
            <div className="px-6 pb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Выполнение плана: {planProgress.toFixed(1)}%</span>
                <span className="font-medium">Цель: {plan} TJS</span>
              </div>
              <Progress value={planProgress} className="h-2" />
            </div>
          )}
        </Card>

        {/* 3 Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card Sales */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Продажа карт и доп. продуктов
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-4 space-y-4 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Карты</span>
                  <span className="font-semibold">{safeArray(data?.CardSales)[0]?.cards_prem || 0} TJS</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Мобильный банк</span>
                  <span className="font-semibold">{(safeArray(data?.MobileBank)[0]?.mobile_bank_connects || 0) * 10} TJS</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">ЗП Проект</span>
                  <span className="font-semibold">{data?.salary_project || 0} TJS</span>
                </div>
              </div>
              <div className="p-4 bg-primary/5 border-t mt-auto">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-primary">Итого</span>
                  <span className="font-bold text-lg">
                    {(
                      (safeArray(data?.CardSales)[0]?.cards_prem || 0) +
                      ((safeArray(data?.MobileBank)[0]?.mobile_bank_connects || 0) * 10) +
                      (data?.salary_project || 0)
                    ).toFixed(1)} TJS
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Turnovers */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Обороты по картам
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-4 space-y-4 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Оборот дебет + остаток</span>
                  <span className="font-semibold">{safeArray(data?.CardTurnovers)[0]?.card_turnovers_prem?.toFixed(3) || 0} TJS</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Активные карты</span>
                  <span className="font-semibold">{safeArray(data?.CardTurnovers)[0]?.active_cards_perms?.toFixed(3) || 0} TJS</span>
                </div>
              </div>
              <div className="p-4 bg-blue-500/5 border-t mt-auto">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-600">Итого</span>
                  <span className="font-bold text-lg">
                    {(
                      (safeArray(data?.CardTurnovers)[0]?.card_turnovers_prem || 0) +
                      (safeArray(data?.CardTurnovers)[0]?.active_cards_perms || 0)
                    ).toFixed(3)} TJS
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Качество обслуживания
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-4 space-y-4 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Средняя оценка</span>
                  <span className="font-semibold">{callCenterValue} Балла</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Жалобы + ОЗ</span>
                  <span className="font-semibold text-destructive">{complaintValue} ШТ.</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Тесты</span>
                  <span className="font-semibold">{testsValue} Балла</span>
                </div>
              </div>
              <div className="p-4 bg-orange-500/5 border-t mt-auto text-xs text-muted-foreground">
                Баллы влияют на итоговый коэффициент премии (штрафы или бонусы).
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Reports & Charts Button/Placeholder */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto shadow-md">
            <Link href="/my-premie/reports">
              <FileText className="w-4 h-4 mr-2" />
              Подробный отчет
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground text-center sm:text-right">
            Аналитика и графики доступны в подробном отчете.
          </p>
        </div>

      </div>
    </PageContainer>
  );
}
