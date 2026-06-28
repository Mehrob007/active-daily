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

const MOCK_CREDITS = [
  { id: 1, name: 'Потребительский', loanType: 'Потребительский', currency: 'TJS', minAmount: 1000, maxAmount: 50000, interestRateFrom: 24, isActive: true },
  { id: 2, name: 'Ипотека Плюс', loanType: 'Ипотечный', currency: 'TJS', minAmount: 50000, maxAmount: 500000, interestRateFrom: 18, isActive: true },
  { id: 3, name: 'Автокредит', loanType: 'Автокредит', currency: 'USD', minAmount: 2000, maxAmount: 30000, interestRateFrom: 12, isActive: false },
];

export function ProductsCreditsPage() {
  const [data, setData] = useState(MOCK_CREDITS);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingCredit(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (credit: any) => {
    setEditingCredit(credit);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить кредитный продукт?')) {
      setData(prev => prev.filter(c => c.id !== id));
      toast.success('Кредитный продукт удален');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success(editingCredit ? 'Кредитный продукт обновлен' : 'Кредитный продукт создан');
      setIsSheetOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="Справочник: Кредиты"
      description="Управление кредитными продуктами банка, ставками, лимитами и параметрами."
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Список кредитных продуктов</CardTitle>
            <CardDescription>Всего продуктов: {data.length}</CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить кредит
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип кредита</TableHead>
                  <TableHead>Валюта</TableHead>
                  <TableHead>Сумма (От - До)</TableHead>
                  <TableHead>Ставка от</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(credit => (
                  <TableRow key={credit.id}>
                    <TableCell>{credit.id}</TableCell>
                    <TableCell className="font-medium">{credit.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {credit.loanType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{credit.currency}</Badge>
                    </TableCell>
                    <TableCell>{credit.minAmount} - {credit.maxAmount}</TableCell>
                    <TableCell>{credit.interestRateFrom}%</TableCell>
                    <TableCell>
                      {credit.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Активен</Badge>
                      ) : (
                        <Badge variant="secondary">Неактивен</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(credit)}>
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(credit.id)}>
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
            <SheetTitle>{editingCredit ? 'Редактирование кредита' : 'Создание нового кредита'}</SheetTitle>
            <SheetDescription>
              Настройте лимиты, процентные ставки и требования к заемщику.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSave} className="space-y-6 mt-6">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="main">Основа</TabsTrigger>
                <TabsTrigger value="terms">Условия</TabsTrigger>
                <TabsTrigger value="rates">Ставки</TabsTrigger>
                <TabsTrigger value="logic">Логика</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 border rounded-lg p-4 bg-muted/10">
                
                <TabsContent value="main" className="space-y-4 m-0">
                  <div className="space-y-2">
                    <Label>Название кредита</Label>
                    <Input defaultValue={editingCredit?.name} placeholder="Например, Потребительский" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Тип кредита</Label>
                      <Select defaultValue={editingCredit?.loanType || "Потребительский"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Потребительский">Потребительский</SelectItem>
                          <SelectItem value="Ипотечный">Ипотечный</SelectItem>
                          <SelectItem value="Автокредит">Автокредит</SelectItem>
                          <SelectItem value="Бизнес">Бизнес</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Валюта</Label>
                      <Select defaultValue={editingCredit?.currency || "TJS"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TJS">TJS (Сомони)</SelectItem>
                          <SelectItem value="USD">USD (Доллар)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Банка</Label>
                      <Input type="number" defaultValue={editingCredit?.bankId || "0"} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="terms" className="space-y-4 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Мин. сумма</Label>
                      <Input type="number" defaultValue={editingCredit?.minAmount || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label>Макс. сумма</Label>
                      <Input type="number" defaultValue={editingCredit?.maxAmount || "0"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Мин. срок (мес)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Макс. срок (мес)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Льготный период (мес)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Комиссия (досрочное)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Мин. возраст</Label>
                      <Input type="number" defaultValue="21" />
                    </div>
                    <div className="space-y-2">
                      <Label>Макс. возраст</Label>
                      <Input type="number" defaultValue="65" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Требуемый доход</Label>
                    <Input type="number" defaultValue="0" />
                  </div>
                </TabsContent>

                <TabsContent value="rates" className="space-y-4 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Процент от (%)</Label>
                      <Input type="number" defaultValue={editingCredit?.interestRateFrom || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label>Процент до (%)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Эффективная от (%)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Эффективная до (%)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logic" className="space-y-6 m-0 py-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Активен</Label>
                      <p className="text-sm text-muted-foreground">Кредит доступен для заявок</p>
                    </div>
                    <Switch defaultChecked={editingCredit?.isActive !== false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Онлайн заявка</Label>
                      <p className="text-sm text-muted-foreground">Можно заказать через приложение</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Требуется залог</Label>
                      <p className="text-sm text-muted-foreground">Обязательное обеспечение</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Требуется страховка</Label>
                      <p className="text-sm text-muted-foreground">Обязательное страхование жизни/залога</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Требуемые документы (каждый с новой строки)</Label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Паспорт&#10;Справка о доходах"
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
