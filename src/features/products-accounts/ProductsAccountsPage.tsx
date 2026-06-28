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

const MOCK_ACCOUNTS = [
  { id: 1, name: 'Сберегательный', accountType: 'Сберегательный', currency: 'TJS', interestOnBalance: 12, isActive: true, overdraftAllowed: false },
  { id: 2, name: 'Текущий (Зарплатный)', accountType: 'Текущий', currency: 'TJS', interestOnBalance: 0, isActive: true, overdraftAllowed: true },
  { id: 3, name: 'Валютный счет', accountType: 'Текущий', currency: 'USD', interestOnBalance: 2, isActive: false, overdraftAllowed: false },
];

export function ProductsAccountsPage() {
  const [data, setData] = useState(MOCK_ACCOUNTS);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [overdraftAllowed, setOverdraftAllowed] = useState(false);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setOverdraftAllowed(false);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (account: any) => {
    setEditingAccount(account);
    setOverdraftAllowed(account.overdraftAllowed);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить счет?')) {
      setData(prev => prev.filter(c => c.id !== id));
      toast.success('Счет удален');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success(editingAccount ? 'Счет обновлен' : 'Счет создан');
      setIsSheetOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="Справочник: Счета"
      description="Управление банковскими счетами, тарифами, комиссиями и возможностями овердрафта."
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Список типов счетов</CardTitle>
            <CardDescription>Всего продуктов: {data.length}</CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить счет
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название счета</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Валюта</TableHead>
                  <TableHead>Остаток (%)</TableHead>
                  <TableHead>Овердрафт</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(acc => (
                  <TableRow key={acc.id}>
                    <TableCell>{acc.id}</TableCell>
                    <TableCell className="font-medium">{acc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {acc.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{acc.currency}</Badge>
                    </TableCell>
                    <TableCell>{acc.interestOnBalance > 0 ? `${acc.interestOnBalance}%` : '0%'}</TableCell>
                    <TableCell>
                      {acc.overdraftAllowed ? <span className="text-green-600 font-medium">Да</span> : <span className="text-muted-foreground">Нет</span>}
                    </TableCell>
                    <TableCell>
                      {acc.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Активен</Badge>
                      ) : (
                        <Badge variant="secondary">Неактивен</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(acc)}>
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(acc.id)}>
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
            <SheetTitle>{editingAccount ? 'Редактирование счета' : 'Создание нового счета'}</SheetTitle>
            <SheetDescription>
              Настройте тип счета, валюту, комиссии и опции овердрафта.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSave} className="space-y-6 mt-6">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="main">Основа</TabsTrigger>
                <TabsTrigger value="credit">Овердрафт</TabsTrigger>
                <TabsTrigger value="fees">Тарифы</TabsTrigger>
                <TabsTrigger value="logic">Логика</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 border rounded-lg p-4 bg-muted/10">
                
                <TabsContent value="main" className="space-y-4 m-0">
                  <div className="space-y-2">
                    <Label>Название счета</Label>
                    <Input defaultValue={editingAccount?.name} placeholder="Например, Зарплатный" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Тип счета</Label>
                      <Select defaultValue={editingAccount?.accountType || "Текущий"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Текущий">Текущий</SelectItem>
                          <SelectItem value="Сберегательный">Сберегательный</SelectItem>
                          <SelectItem value="Депозитный">Депозитный</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Валюта</Label>
                      <Select defaultValue={editingAccount?.currency || "TJS"}>
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
                      <Input type="number" defaultValue={editingAccount?.bankId || "0"} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="credit" className="space-y-6 m-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Овердрафт разрешен</Label>
                      <p className="text-sm text-muted-foreground">Клиент может уходить в минус</p>
                    </div>
                    <Switch checked={overdraftAllowed} onCheckedChange={setOverdraftAllowed} />
                  </div>

                  {overdraftAllowed && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label>Ставка овердрафта (%)</Label>
                      <Input type="number" defaultValue={editingAccount?.overdraftRate || "0"} step="0.1" required />
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t">
                    <Label>Процент на остаток (%)</Label>
                    <Input type="number" defaultValue={editingAccount?.interestOnBalance || "0"} step="0.1" />
                    <p className="text-xs text-muted-foreground">Начисляется ежемесячно на минимальный остаток</p>
                  </div>
                </TabsContent>

                <TabsContent value="fees" className="space-y-4 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Комиссия за открытие</Label>
                      <Input type="number" defaultValue={editingAccount?.openingFee || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ежемесячная комиссия</Label>
                      <Input type="number" defaultValue={editingAccount?.monthlyFee || "0"} />
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Бесплатные переводы (шт/мес)</Label>
                    <Input type="number" defaultValue={editingAccount?.freeTransfersCount || "0"} />
                  </div>
                </TabsContent>

                <TabsContent value="logic" className="space-y-6 m-0 py-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Активен</Label>
                      <p className="text-sm text-muted-foreground">Счет доступен для открытия</p>
                    </div>
                    <Switch defaultChecked={editingAccount?.isActive !== false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Онлайн открытие</Label>
                      <p className="text-sm text-muted-foreground">Можно открыть через приложение</p>
                    </div>
                    <Switch defaultChecked={editingAccount?.onlineOpening} />
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
