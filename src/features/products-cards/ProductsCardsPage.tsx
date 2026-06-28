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

const MOCK_CARDS = [
  { id: 1, name: 'Visa Classic Everyday', paymentSystem: 'Visa', currency: 'TJS', issuanceFee: 50, annualFee: 20, creditLimitMax: 0, isActive: true },
  { id: 2, name: 'Корти Милли Standard', paymentSystem: 'Корти Милли', currency: 'TJS', issuanceFee: 20, annualFee: 10, creditLimitMax: 5000, isActive: true },
  { id: 3, name: 'MasterCard Gold Premium', paymentSystem: 'MasterCard', currency: 'USD', issuanceFee: 150, annualFee: 100, creditLimitMax: 10000, isActive: false },
];

export function ProductsCardsPage() {
  const [data, setData] = useState(MOCK_CARDS);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingCard(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (card: any) => {
    setEditingCard(card);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить карту?')) {
      setData(prev => prev.filter(c => c.id !== id));
      toast.success('Карта удалена');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success(editingCard ? 'Карта обновлена' : 'Карта создана');
      setIsSheetOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="Справочник: Карты"
      description="Управление банковскими карточными продуктами, их лимитами, комиссиями и настройками."
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Список доступных карт</CardTitle>
            <CardDescription>Всего продуктов: {data.length}</CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить карту
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название карты</TableHead>
                  <TableHead>Система</TableHead>
                  <TableHead>Валюта</TableHead>
                  <TableHead>Выпуск / Год.</TableHead>
                  <TableHead>Кредитный лимит</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(card => (
                  <TableRow key={card.id}>
                    <TableCell>{card.id}</TableCell>
                    <TableCell className="font-medium">{card.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        card.paymentSystem === 'Visa' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        card.paymentSystem === 'MasterCard' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }>
                        {card.paymentSystem}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{card.currency}</Badge>
                    </TableCell>
                    <TableCell>{card.issuanceFee} / {card.annualFee}</TableCell>
                    <TableCell>{card.creditLimitMax > 0 ? `до ${card.creditLimitMax}` : 'Дебетовая'}</TableCell>
                    <TableCell>
                      {card.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Активна</Badge>
                      ) : (
                        <Badge variant="secondary">Неактивна</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(card)}>
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)}>
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
            <SheetTitle>{editingCard ? 'Редактирование карты' : 'Создание новой карты'}</SheetTitle>
            <SheetDescription>
              Настройте параметры, лимиты и комиссии для продукта.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSave} className="space-y-6 mt-6">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="main">Основа</TabsTrigger>
                <TabsTrigger value="fees">Комиссии</TabsTrigger>
                <TabsTrigger value="limits">Лимиты</TabsTrigger>
                <TabsTrigger value="logic">Логика</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 border rounded-lg p-4 bg-muted/10">
                <TabsContent value="main" className="space-y-4 m-0">
                  <div className="space-y-2">
                    <Label>Название карты</Label>
                    <Input defaultValue={editingCard?.name} placeholder="Visa Platinum" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Платёжная система</Label>
                      <Select defaultValue={editingCard?.paymentSystem || "Visa"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="MasterCard">MasterCard</SelectItem>
                          <SelectItem value="Корти Милли">Корти Милли</SelectItem>
                          <SelectItem value="UnionPay">UnionPay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Валюта</Label>
                      <Select defaultValue={editingCard?.currency || "TJS"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TJS">TJS (Сомони)</SelectItem>
                          <SelectItem value="USD">USD (Доллар)</SelectItem>
                          <SelectItem value="EUR">EUR (Евро)</SelectItem>
                          <SelectItem value="RUB">RUB (Рубль)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Мин. кредитный лимит</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Макс. кредитный лимит</Label>
                      <Input type="number" defaultValue={editingCard?.creditLimitMax || "0"} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fees" className="space-y-4 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Стоимость выпуска</Label>
                      <Input type="number" defaultValue={editingCard?.issuanceFee || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label>Годовая комиссия</Label>
                      <Input type="number" defaultValue={editingCard?.annualFee || "0"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Снятие (Свой банкомат)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Снятие (Чужой банкомат)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Комиссия за перевод</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMS информирование</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="limits" className="space-y-4 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Снятие свой ATM / день</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Снятие свой ATM / месяц</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Онлайн / день</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Онлайн / месяц</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Общий / день</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Общий / месяц</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logic" className="space-y-6 m-0 py-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Активна</Label>
                      <p className="text-sm text-muted-foreground">Карта доступна для заказа</p>
                    </div>
                    <Switch defaultChecked={editingCard?.isActive !== false} />
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
                      <Label className="text-base">Доставка</Label>
                      <p className="text-sm text-muted-foreground">Доступна курьерская доставка</p>
                    </div>
                    <Switch defaultChecked />
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
