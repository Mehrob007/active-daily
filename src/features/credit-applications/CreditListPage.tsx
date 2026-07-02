'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Search, Filter, Loader2, Eye, Edit, Trash2 } from 'lucide-react';

const mockData = [
  {
    id: 1,
    date: '2025-08-04T10:00:00Z',
    fullName: 'Иванов Иван Иванович',
    phone: '+992900000000',
    loanType: 'ПОТРЕБИТЕЛЬСКИЙ КРЕДИТ',
    amount: '15000',
    status: 'Принято',
    statusColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 2,
    date: '2025-08-03T15:30:00Z',
    fullName: 'Петров Петр Петрович',
    phone: '+992911111111',
    loanType: 'АВТОКРЕДИТ',
    amount: '50000',
    status: 'Передано в обработку',
    statusColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 3,
    date: '2025-08-01T09:15:00Z',
    fullName: 'Сидоров Сидор Сидорович',
    phone: '+992922222222',
    loanType: 'ПОД ЗАЛОГ ЗОЛОТА',
    amount: '5000',
    status: 'Одобрено',
    statusColor: 'bg-green-100 text-green-800'
  }
];

export function CreditListPage() {
  const [loading, setLoading] = useState(false);
  const [archive, setArchive] = useState(false);
  const [search, setSearch] = useState('');

  const handleExport = () => {
    console.log("Exporting...");
  };

  return (
    <PageContainer
      title="Заявки на кредиты"
      description="Управление заявками на получение кредитов."
    >
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Tabs 
            value={archive ? "archive" : "active"} 
            onValueChange={(v) => setArchive(v === 'archive')}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="active">Активные заявки</TabsTrigger>
              <TabsTrigger value="archive">Архив</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ФИО или телефону..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Тип кредита</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : mockData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Нет заявок
                    </TableCell>
                  </TableRow>
                ) : (
                  mockData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">#{row.id}</TableCell>
                      <TableCell>{new Date(row.date).toLocaleString('ru-RU')}</TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.loanType}</TableCell>
                      <TableCell>{row.amount} TJS</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={row.statusColor}>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Просмотр">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Редактировать">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" title="Удалить">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
