'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_TRANSFERS = [
  { id: 1, name: 'Внутрибанковский перевод', transferType: 'Внутренний', direction: 'Исходящий', currency: 'TJS', currencyTo: 'TJS', feePercent: 0, isActive: true },
  { id: 2, name: 'Перевод по СБП (Россия)', transferType: 'Международный', direction: 'Исходящий', currency: 'TJS', currencyTo: 'RUB', feePercent: 1.5, isActive: true },
  { id: 3, name: 'Western Union', transferType: 'Международный', direction: 'Двусторонний', currency: 'USD', currencyTo: 'USD', feePercent: 3, isActive: false },
];

export function ProductsTransfersPage() {
  const [data, setData] = useState(MOCK_TRANSFERS);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingTransfer(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (transfer: any) => {
    setEditingTransfer(transfer);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить перевод?')) {
      setData(prev => prev.filter(c => c.id !== id));
      toast.success('Перевод удален');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success(editingTransfer ? 'Перевод обновлен' : 'Перевод создан');
      setIsSheetOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="Справочник: Переводы"
      description="Управление системами денежных переводов, комиссиями и лимитами транзакций."
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Список переводов</CardTitle>
            <CardDescription>Всего систем: {data.length}</CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить перевод
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип перевода</TableHead>
                  <TableHead>Направление</TableHead>
                  <TableHead>Валюта (От ➔ К)</TableHead>
                  <TableHead>Комиссия (%)</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(tr => (
                  <TableRow key={tr.id}>
                    <TableCell>{tr.id}</TableCell>
                    <TableCell className="font-medium">{tr.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {tr.transferType}
                      </Badge>
                    </TableCell>
                    <TableCell>{tr.direction}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tr.currency}</Badge> ➔ <Badge variant="secondary">{tr.currencyTo}</Badge>
                    </TableCell>
                    <TableCell>{tr.feePercent}%</TableCell>
                    <TableCell>
                      {tr.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Активен</Badge>
                      ) : (
                        <Badge variant="secondary">Неактивен</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(tr)}>
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tr.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sheet Modal for Create/Edit */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingTransfer ? 'Редактирование перевода' : 'Создание нового перевода'}</SheetTitle>
            <SheetDescription>
              Настройте параметры перевода, валютные пары, комиссии и лимиты.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSave} className="space-y-6 mt-6">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="main">Основа</TabsTrigger>
                <TabsTrigger value="limits">Суммы и Комиссии</TabsTrigger>
                <TabsTrigger value="channels">Каналы</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 border rounded-lg p-4 bg-muted/10">
                
                <TabsContent value="main" className="space-y-4 m-0">
                  <div className="space-y-2">
                    <Label>Название перевода</Label>
                    <Input defaultValue={editingTransfer?.name} placeholder="Например, Золотая Корона" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Тип перевода</Label>
                      <Select defaultValue={editingTransfer?.transferType || "Внутренний"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Внутренний">Внутренний</SelectItem>
                          <SelectItem value="Международный">Международный</SelectItem>
                          <SelectItem value="Межбанковский">Межбанковский</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Направление</Label>
                      <Select defaultValue={editingTransfer?.direction || "Исходящий"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Исходящий">Исходящий</SelectItem>
                          <SelectItem value="Входящий">Входящий</SelectItem>
                          <SelectItem value="Двусторонний">Двусторонний</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Валюта отправки</Label>
                      <Select defaultValue={editingTransfer?.currency || "TJS"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TJS">TJS</SelectItem>
                          <SelectItem value="RUB">RUB</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Валюта получения</Label>
                      <Select defaultValue={editingTransfer?.currencyTo || "TJS"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TJS">TJS</SelectItem>
                          <SelectItem value="RUB">RUB</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Банка</Label>
                      <Input type="number" defaultValue={editingTransfer?.bankId || "0"} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="limits" className="space-y-4 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Мин. сумма</Label>
                      <Input type="number" defaultValue={editingTransfer?.minAmount || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label>Макс. сумма/транзакция</Label>
                      <Input type="number" defaultValue={editingTransfer?.maxAmountPerTransaction || "0"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Макс. сумма/день</Label>
                      <Input type="number" defaultValue={editingTransfer?.maxAmountPerDay || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label>Бесплатные переводы</Label>
                      <Input type="number" defaultValue={editingTransfer?.freeTransfersCount || "0"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Комиссия (%)</Label>
                      <Input type="number" defaultValue={editingTransfer?.feePercent || "0"} step="0.1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Фикс. комиссия</Label>
                      <Input type="number" defaultValue={editingTransfer?.feeFixed || "0"} />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Время исполнения</Label>
                    <Input defaultValue={editingTransfer?.executionTime} placeholder="Например: Моментально или 1-3 раб. дня" />
                  </div>
                </TabsContent>

                <TabsContent value="channels" className="space-y-6 m-0 py-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Активен</Label>
                      <p className="text-sm text-muted-foreground">Система переводов включена</p>
                    </div>
                    <Switch defaultChecked={editingTransfer?.isActive !== false} />
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Label>Доступные каналы (каждый с новой строки)</Label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Мобильное приложение&#10;Филиалы&#10;Банкоматы"
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <SheetFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Сохранить
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
