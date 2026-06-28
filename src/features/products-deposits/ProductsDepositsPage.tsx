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

const MOCK_DEPOSITS = [
  { id: 1, name: 'Срочный стандарт', depositType: 'Срочный', currency: 'TJS', interestRate: 15, termInMonths: 12, capitalization: 'Ежемесячно', isActive: true },
  { id: 2, name: 'Накопительный', depositType: 'Накопительный', currency: 'TJS', interestRate: 10, termInMonths: 6, capitalization: 'В конце срока', isActive: true },
  { id: 3, name: 'Валютный премиум', depositType: 'Срочный', currency: 'USD', interestRate: 5, termInMonths: 24, capitalization: 'Ежеквартально', isActive: false },
];

export function ProductsDepositsPage() {
  const [data, setData] = useState(MOCK_DEPOSITS);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingDeposit(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (deposit: any) => {
    setEditingDeposit(deposit);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить депозит?')) {
      setData(prev => prev.filter(c => c.id !== id));
      toast.success('Депозит удален');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success(editingDeposit ? 'Депозит обновлен' : 'Депозит создан');
      setIsSheetOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="Справочник: Депозиты"
      description="Управление депозитными продуктами, процентными ставками и условиями вкладов."
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Список депозитов</CardTitle>
            <CardDescription>Всего продуктов: {data.length}</CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить депозит
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название депозита</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Валюта</TableHead>
                  <TableHead>Срок (мес)</TableHead>
                  <TableHead>Ставка (%)</TableHead>
                  <TableHead>Капитализация</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(dep => (
                  <TableRow key={dep.id}>
                    <TableCell>{dep.id}</TableCell>
                    <TableCell className="font-medium">{dep.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {dep.depositType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{dep.currency}</Badge>
                    </TableCell>
                    <TableCell>{dep.termInMonths}</TableCell>
                    <TableCell>{dep.interestRate}%</TableCell>
                    <TableCell>{dep.capitalization}</TableCell>
                    <TableCell>
                      {dep.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Активен</Badge>
                      ) : (
                        <Badge variant="secondary">Неактивен</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(dep)}>
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dep.id)}>
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
            <SheetTitle>{editingDeposit ? 'Редактирование депозита' : 'Создание нового депозита'}</SheetTitle>
            <SheetDescription>
              Настройте параметры вклада, процентные ставки и логику продукта.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSave} className="space-y-6 mt-6">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="main">Основа</TabsTrigger>
                <TabsTrigger value="params">Параметры</TabsTrigger>
                <TabsTrigger value="logic">Логика</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 border rounded-lg p-4 bg-muted/10">
                
                <TabsContent value="main" className="space-y-4 m-0">
                  <div className="space-y-2">
                    <Label>Название депозита</Label>
                    <Input defaultValue={editingDeposit?.name} placeholder="Например, Срочный Плюс" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Тип депозита</Label>
                      <Select defaultValue={editingDeposit?.depositType || "Срочный"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Срочный">Срочный</SelectItem>
                          <SelectItem value="Накопительный">Накопительный</SelectItem>
                          <SelectItem value="До востребования">До востребования</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Валюта</Label>
                      <Select defaultValue={editingDeposit?.currency || "TJS"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TJS">TJS (Сомони)</SelectItem>
                          <SelectItem value="USD">USD (Доллар)</SelectItem>
                          <SelectItem value="EUR">EUR (Евро)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Банка</Label>
                      <Input type="number" defaultValue={editingDeposit?.bankId || "0"} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="params" className="space-y-4 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Мин. сумма</Label>
                      <Input type="number" defaultValue={editingDeposit?.minAmount || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label>Макс. сумма</Label>
                      <Input type="number" defaultValue={editingDeposit?.maxAmount || "0"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Срок (мес)</Label>
                      <Input type="number" defaultValue={editingDeposit?.termInMonths || "12"} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ставка (%)</Label>
                      <Input type="number" defaultValue={editingDeposit?.interestRate || "10"} step="0.1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Капитализация</Label>
                    <Select defaultValue={editingDeposit?.capitalization || "Ежемесячно"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ежемесячно">Ежемесячно</SelectItem>
                        <SelectItem value="Ежеквартально">Ежеквартально</SelectItem>
                        <SelectItem value="В конце срока">В конце срока</SelectItem>
                        <SelectItem value="Ежегодно">Ежегодно</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Штраф при досрочном снятии (%)</Label>
                    <Input type="number" defaultValue={editingDeposit?.earlyWithdrawalPenalty || "0"} step="0.1" />
                  </div>
                </TabsContent>

                <TabsContent value="logic" className="space-y-6 m-0 py-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Активен</Label>
                      <p className="text-sm text-muted-foreground">Доступен для открытия</p>
                    </div>
                    <Switch defaultChecked={editingDeposit?.isActive !== false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Онлайн открытие</Label>
                      <p className="text-sm text-muted-foreground">Можно открыть через приложение</p>
                    </div>
                    <Switch defaultChecked={editingDeposit?.onlineOpening} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Пополнение</Label>
                      <p className="text-sm text-muted-foreground">Разрешено пополнение вклада</p>
                    </div>
                    <Switch defaultChecked={editingDeposit?.replenishmentAllowed} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Частичное снятие</Label>
                      <p className="text-sm text-muted-foreground">До неснижаемого остатка</p>
                    </div>
                    <Switch defaultChecked={editingDeposit?.partialWithdrawalAllowed} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Автопролонгация</Label>
                      <p className="text-sm text-muted-foreground">Автоматическое продление срока</p>
                    </div>
                    <Switch defaultChecked={editingDeposit?.autoProlongation} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Плавающая ставка</Label>
                      <p className="text-sm text-muted-foreground">Может меняться со временем</p>
                    </div>
                    <Switch defaultChecked={editingDeposit?.interestRateVariable} />
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
