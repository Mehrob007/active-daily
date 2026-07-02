'use client';

import React from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

interface ProductsPageProps {
  type: 'cards' | 'credits' | 'accounts' | 'deposits' | 'transfers';
}

const titles = {
  cards: 'Карты',
  credits: 'Кредиты',
  accounts: 'Счета',
  deposits: 'Депозиты',
  transfers: 'Переводы',
};

const descriptions = {
  cards: 'Управление карточными продуктами банка',
  credits: 'Управление кредитными продуктами',
  accounts: 'Управление текущими счетами',
  deposits: 'Управление депозитными продуктами',
  transfers: 'Управление системами денежных переводов',
};

const mockData = [
  { id: 1, name: 'Standard Product 1', type: 'Local', status: 'Active', updated: '2023-10-01' },
  { id: 2, name: 'Premium Product 2', type: 'International', status: 'Active', updated: '2023-10-05' },
  { id: 3, name: 'Basic Product 3', type: 'Local', status: 'Inactive', updated: '2023-09-20' },
];

export function ProductsPage({ type }: ProductsPageProps) {
  return (
    <PageContainer
      title={titles[type]}
      subtitle={descriptions[type]}
    >
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить продукт
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список продуктов</CardTitle>
          <CardDescription>
            {mockData.length} продуктов найдено.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Обновлено</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status === 'Active' ? 'Активно' : 'Неактивно'}
                      </span>
                    </TableCell>
                    <TableCell>{item.updated}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
