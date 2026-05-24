'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Award, 
  TrendingUp, 
  UserCheck, 
  CreditCard,
  Smartphone,
  Briefcase,
  Star,
  MessageCircle,
  FileCheck
} from 'lucide-react';
import { workerPremieService, WorkerPremieData } from '../../services/worker-premie-service';
import { calculateTotalPremia } from '@/lib/calculate-premia';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель',
  'Май', 'Июнь', 'Июль', 'Август',
  'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export default function MyPremiePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  
  const [data, setData] = useState<WorkerPremieData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (m: number, y: number) => {
    setIsLoading(true);
    try {
      const result = await workerPremieService.fetchWorkerData(m, y);
      if (!result || Object.keys(result).length === 0) {
        setData(null);
        toast({ title: 'Информация', description: 'Нет данных за выбранный период', variant: 'default' });
      } else {
        setData(result);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить данные премии', variant: 'destructive' });
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(month, year);
  }, [month, year, loadData]);

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

  const total = data ? calculateTotalPremia(data) : 0;
  const cardSales = data?.CardSales?.[0]?.cards_prem || 0;
  const mobileBank = (data?.MobileBank?.[0]?.mobile_bank_connects || 0) * 10;
  const salaryProject = data?.salary_project || 0;
  
  const cardTurnover = data?.CardTurnovers?.[0]?.card_turnovers_prem || 0;
  const activeCards = data?.CardTurnovers?.[0]?.active_cards_perms || 0;
  
  const quality = data?.ServiceQuality?.[0] || { call_center: 0, complaint: 0, tests: 0 };

  return (
    <PageContainer title="Моя премия" subtitle="Расчет и статистика вашей ежемесячной премии">
      
      {/* Controls & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border shadow-sm">
          <Button variant="ghost" size="icon" onClick={handlePrev} disabled={isLoading} className="rounded-lg">
            <ChevronLeft className="size-5" />
          </Button>
          <div className="px-4 py-2 text-center min-w-[140px]">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-600">
              {MONTH_NAMES[month - 1]} {year}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNext} disabled={isLoading} className="rounded-lg">
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
           <Card className="border-none shadow-md bg-bank-red text-white overflow-hidden relative min-w-[200px]">
              <div className="absolute right-[-10px] top-[-10px] opacity-10">
                 <Award className="size-24" />
              </div>
              <CardHeader className="pb-2 pt-4 px-5">
                 <CardTitle className="text-[10px] uppercase font-bold tracking-widest opacity-80">Итого к выплате</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                 {isLoading ? <Skeleton className="h-8 w-24 bg-white/20" /> : <div className="text-3xl font-black">{total.toFixed(1)} <span className="text-sm font-normal">TJS</span></div>}
              </CardContent>
           </Card>

           <Card className="border-none shadow-md bg-slate-800 text-white min-w-[200px]">
              <CardHeader className="pb-2 pt-4 px-5">
                 <CardTitle className="text-[10px] uppercase font-bold tracking-widest opacity-80">Ваш план</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                 {isLoading ? <Skeleton className="h-8 w-24 bg-white/20" /> : <div className="text-3xl font-black">{(data?.plan || 0).toLocaleString()} <span className="text-sm font-normal">TJS</span></div>}
              </CardContent>
           </Card>
        </div>
      </div>

      {!isLoading && !data ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <Award className="size-16 text-slate-200 mb-4" />
           <h3 className="text-xl font-bold text-slate-400">Данные за этот период не найдены</h3>
           <Button variant="link" onClick={() => loadData(month, year)} className="mt-2 text-bank-red">Попробовать обновить</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Section 1: Sales */}
          <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="h-1.5 bg-emerald-500" />
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                  <TrendingUp className="size-4 text-emerald-500" />
                  Продажи и доп. продукты
                </CardTitle>
                <Badge variant="outline" className="bg-white text-emerald-600 border-emerald-100">
                   {isLoading ? '...' : (cardSales + mobileBank + salaryProject).toFixed(1)} TJS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="flex justify-between items-center group/row">
                  <div className="flex items-center gap-3 text-slate-600 group-hover/row:text-slate-900 transition-colors">
                     <div className="p-2 rounded-lg bg-emerald-50 group-hover/row:bg-emerald-100 transition-colors"><CreditCard className="size-4 text-emerald-600" /></div>
                     <span className="text-sm font-medium">Банковские карты</span>
                  </div>
                  <b className="font-mono text-slate-900">{isLoading ? '...' : cardSales} <span className="text-[10px] font-normal text-slate-400">TJS</span></b>
               </div>
               <div className="flex justify-between items-center group/row">
                  <div className="flex items-center gap-3 text-slate-600 group-hover/row:text-slate-900 transition-colors">
                     <div className="p-2 rounded-lg bg-emerald-50 group-hover/row:bg-emerald-100 transition-colors"><Smartphone className="size-4 text-emerald-600" /></div>
                     <span className="text-sm font-medium">Мобильный банк</span>
                  </div>
                  <b className="font-mono text-slate-900">{isLoading ? '...' : mobileBank} <span className="text-[10px] font-normal text-slate-400">TJS</span></b>
               </div>
               <div className="flex justify-between items-center group/row">
                  <div className="flex items-center gap-3 text-slate-600 group-hover/row:text-slate-900 transition-colors">
                     <div className="p-2 rounded-lg bg-emerald-50 group-hover/row:bg-emerald-100 transition-colors"><Briefcase className="size-4 text-emerald-600" /></div>
                     <span className="text-sm font-medium">Зарплатный проект</span>
                  </div>
                  <b className="font-mono text-slate-900">{isLoading ? '...' : salaryProject} <span className="text-[10px] font-normal text-slate-400">TJS</span></b>
               </div>
            </CardContent>
          </Card>

          {/* Section 2: Turnovers */}
          <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="h-1.5 bg-blue-500" />
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                  <RefreshCw className="size-4 text-blue-500" />
                  Обороты по картам
                </CardTitle>
                <Badge variant="outline" className="bg-white text-blue-600 border-blue-100">
                   {isLoading ? '...' : (cardTurnover + activeCards).toFixed(3)} TJS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="flex justify-between items-center group/row">
                  <div className="flex items-center gap-3 text-slate-600 group-hover/row:text-slate-900 transition-colors">
                     <div className="p-2 rounded-lg bg-blue-50 group-hover/row:bg-blue-100 transition-colors"><TrendingUp className="size-4 text-blue-600" /></div>
                     <span className="text-sm font-medium">Дебет + остаток</span>
                  </div>
                  <b className="font-mono text-slate-900">{isLoading ? '...' : cardTurnover.toFixed(3)} <span className="text-[10px] font-normal text-slate-400">TJS</span></b>
               </div>
               <div className="flex justify-between items-center group/row">
                  <div className="flex items-center gap-3 text-slate-600 group-hover/row:text-slate-900 transition-colors">
                     <div className="p-2 rounded-lg bg-blue-50 group-hover/row:bg-blue-100 transition-colors"><UserCheck className="size-4 text-blue-600" /></div>
                     <span className="text-sm font-medium">Активные карты</span>
                  </div>
                  <b className="font-mono text-slate-900">{isLoading ? '...' : activeCards.toFixed(3)} <span className="text-[10px] font-normal text-slate-400">TJS</span></b>
               </div>
            </CardContent>
          </Card>

          {/* Section 3: Quality */}
          <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="h-1.5 bg-amber-500" />
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                  <Star className="size-4 text-amber-500" />
                  Качество обслуживания
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="flex justify-between items-center group/row">
                  <div className="flex items-center gap-3 text-slate-600 group-hover/row:text-slate-900 transition-colors">
                     <div className="p-2 rounded-lg bg-amber-50 group-hover/row:bg-amber-100 transition-colors"><Star className="size-4 text-amber-600" /></div>
                     <span className="text-sm font-medium">Средняя оценка</span>
                  </div>
                  <b className="text-slate-900">{isLoading ? '...' : quality.call_center} <span className="text-[10px] font-normal text-slate-400 italic">балла</span></b>
               </div>
               <div className="flex justify-between items-center group/row">
                  <div className="flex items-center gap-3 text-slate-600 group-hover/row:text-slate-900 transition-colors">
                     <div className="p-2 rounded-lg bg-amber-50 group-hover/row:bg-amber-100 transition-colors"><MessageCircle className="size-4 text-amber-600" /></div>
                     <span className="text-sm font-medium">Жалобы + ОЗ</span>
                  </div>
                  <b className="text-slate-900">{isLoading ? '...' : quality.complaint} <span className="text-[10px] font-normal text-slate-400 italic">шт.</span></b>
               </div>
               <div className="flex justify-between items-center group/row">
                  <div className="flex items-center gap-3 text-slate-600 group-hover/row:text-slate-900 transition-colors">
                     <div className="p-2 rounded-lg bg-amber-50 group-hover/row:bg-amber-100 transition-colors"><FileCheck className="size-4 text-amber-600" /></div>
                     <span className="text-sm font-medium">Тестирование</span>
                  </div>
                  <b className="text-slate-900">{isLoading ? '...' : quality.tests} <span className="text-[10px] font-normal text-slate-400 italic">балла</span></b>
               </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs leading-relaxed max-w-2xl">
         <p className="font-bold mb-2 uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Star className="size-3" /> Особенности расчета
         </p>
         <ul className="list-disc pl-5 space-y-1">
            <li>Расчет премии производится на основании показателей за календарный месяц.</li>
            <li>Максимально допустимая сумма премии ограничена коэффициентом 1.5 от вашего оклада.</li>
            <li>Оценки за качество обслуживания и тесты могут как увеличивать, так и уменьшать итоговый коэффициент премии.</li>
            <li>Премия за "Мобильный банк" рассчитывается по ставке 10 TJS за каждое подключение.</li>
         </ul>
      </div>

    </PageContainer>
  );
}
