'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import TablePremies from './components/TablePremies';
import { CalendarDays, Users } from 'lucide-react';

export default function OperatorPremiesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель',
    'Май', 'Июнь', 'Июль', 'Август',
    'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <PageContainer 
      title="Премии сотрудников" 
      subtitle="Просмотр и корректировка ежемесячных премий персонала"
    >
      <div className="space-y-6">
        {}
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Выбор месяца</Label>
                  <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                     <SelectTrigger className="w-48 h-11 bg-white border-slate-200">
                        <CalendarDays className="size-4 mr-2 text-bank-red" />
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        {monthNames.map((name, i) => (
                           <SelectItem key={i+1} value={String(i+1)}>{name}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Выбор года</Label>
                  <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                     <SelectTrigger className="w-32 h-11 bg-white border-slate-200">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        {years.map(y => (
                           <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="flex-1 flex justify-end">
                  <div className="flex items-center gap-2 text-slate-400">
                     <Users className="size-4" />
                     <span className="text-xs font-medium uppercase tracking-tighter">Список всех активных сотрудников</span>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {}
        <TablePremies month={month} year={year} />
      </div>
    </PageContainer>
  );
}
