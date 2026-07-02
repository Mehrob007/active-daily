'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function OperatorPremiesPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      
      setData([
        {
          ID: 1,
          office: { name: 'Головной офис' },
          first_name: 'Иван',
          last_name: 'Иванов',
          Role: { name: 'Менеджер' },
          CardSales: [{ cards_sailed: 150, cards_sailed_in_general: 200, deb_osd: '50000', out_balance: '120000' }],
          MobileBank: [{ mobile_bank_connects: 45 }],
          CardTurnovers: [{ active_cards_perms: 85 }],
          ServiceQuality: [{ call_center: 9, complaint: 0, tests: 100 }],
          salary_project: '10'
        },
        {
          ID: 2,
          office: { name: 'Филиал Северный' },
          first_name: 'Анна',
          last_name: 'Смирнова',
          Role: { name: 'Специалист' },
          CardSales: [{ cards_sailed: 90, cards_sailed_in_general: 110, deb_osd: '30000', out_balance: '80000' }],
          MobileBank: [{ mobile_bank_connects: 20 }],
          CardTurnovers: [{ active_cards_perms: 70 }],
          ServiceQuality: [{ call_center: 8, complaint: 1, tests: 90 }],
          salary_project: '5'
        }
      ]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast.info('Скачивание отчета началось...');
  };

  const calculateTotalPremia = (worker: any) => {
    const cards = worker.CardSales?.[0]?.cards_sailed || 0;
    const mb = worker.MobileBank?.[0]?.mobile_bank_connects || 0;
    const sq = worker.ServiceQuality?.[0]?.tests || 0;
    return (cards * 10) + (mb * 5) + (sq * 2);
  };

  const filteredData = data.filter(item => {
    const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <PageContainer
      title="Премии сотрудников"
      subtitle="Просмотр и редактирование показателей для расчета премий"
    >
      <div className="flex flex-col gap-6">
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
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Выгрузить Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Показатели за выбранный период</CardTitle>
            <CardDescription>
              Кликните на ячейку для ручного редактирования значений (если у вас есть права).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="h-12 px-4 font-medium">ID</th>
                    <th className="h-12 px-4 font-medium">Отделение</th>
                    <th className="h-12 px-4 font-medium">ФИО</th>
                    <th className="h-12 px-4 font-medium">Должность</th>
                    <th className="h-12 px-4 font-medium text-right">Выпущено карт</th>
                    <th className="h-12 px-4 font-medium text-right">ОДО Итого</th>
                    <th className="h-12 px-4 font-medium text-right">МБ</th>
                    <th className="h-12 px-4 font-medium text-right">Зарплатные проекты</th>
                    <th className="h-12 px-4 font-medium text-right">Остатки (deb_osd)</th>
                    <th className="h-12 px-4 font-medium text-right">Привлечено (out_balance)</th>
                    <th className="h-12 px-4 font-medium text-right">Активные карты %</th>
                    <th className="h-12 px-4 font-medium text-right">Оценка КЦ</th>
                    <th className="h-12 px-4 font-medium text-right">Жалобы</th>
                    <th className="h-12 px-4 font-medium text-right">Тесты</th>
                    <th className="h-12 px-4 font-medium text-right">Итого премия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((worker) => {
                    const cardSales = worker.CardSales?.[0] || {};
                    const mobileBank = worker.MobileBank?.[0] || {};
                    const turnovers = worker.CardTurnovers?.[0] || {};
                    const service = worker.ServiceQuality?.[0] || {};

                    return (
                      <tr key={worker.ID} className="border-t transition-colors hover:bg-muted/30">
                        <td className="p-4">{worker.ID}</td>
                        <td className="p-4">{worker.office?.name || '—'}</td>
                        <td className="p-4 font-medium">{worker.first_name} {worker.last_name}</td>
                        <td className="p-4 text-muted-foreground">{worker.Role?.name || '—'}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{cardSales.cards_sailed || 0}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{cardSales.cards_sailed_in_general || 0}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{mobileBank.mobile_bank_connects || 0}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{worker.salary_project || 0}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{cardSales.deb_osd || '0'}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{cardSales.out_balance || '0'}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{turnovers.active_cards_perms || 0}%</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{service.call_center || 0}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{service.complaint || 0}</td>
                        <td className="p-4 text-right cursor-pointer hover:bg-muted/50">{service.tests || 0}</td>
                        <td className="p-4 text-right font-bold text-primary">
                          {calculateTotalPremia(worker)} ₸
                        </td>
                      </tr>
                    );
                  })}
                  {filteredData.length === 0 && !loading && (
                    <tr>
                      <td colSpan={15} className="h-24 text-center text-muted-foreground">
                        Ничего не найдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
