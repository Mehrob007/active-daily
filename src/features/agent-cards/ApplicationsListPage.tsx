'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Search, Download, RefreshCw, Eye, Edit2, Trash2, Image as ImageIcon, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ApplicationsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isArchive, setIsArchive] = useState(false);
  
  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [isArchive]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Mock API fetch
      await new Promise(r => setTimeout(r, 600));
      setApplications([
        {
          ID: 1001,
          surname: 'Иванов',
          name: 'Иван',
          patronymic: 'Иванович',
          phone_number: '+7 (777) 123-45-67',
          card_name: 'VISA Platinum',
          delivery_address: 'г. Алматы, ул. Абая 10, кв 5',
          receiving_office: 'Офис №1',
          CreatedAt: new Date().toISOString(),
          status: 'В обработке'
        },
        {
          ID: 1002,
          surname: 'Смирнова',
          name: 'Анна',
          patronymic: 'Сергеевна',
          phone_number: '+7 (701) 987-65-43',
          card_name: 'Mastercard Gold',
          delivery_address: 'г. Астана, пр. Мәңгілік Ел 8',
          receiving_office: 'Офис №3',
          CreatedAt: new Date().toISOString(),
          status: 'Одобрено'
        }
      ]);
    } catch (error) {
      toast.error('Ошибка при загрузке заявок');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(applications.map(app => app.ID));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (checked: boolean, id: number) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const handleExport = () => {
    if (selectedIds.length === 0) {
      toast.warning('Выберите хотя бы одну заявку для выгрузки');
      return;
    }
    toast.success(`Началась выгрузка ${selectedIds.length} заявок`);
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить заявку?')) {
      toast.success('Заявка успешно удалена');
      setApplications(prev => prev.filter(app => app.ID !== id));
    }
  };

  return (
    <PageContainer
      title="Заявки на карты"
      subtitle="Просмотр и управление заявками на выпуск банковских карт"
    >
      <div className="flex flex-col gap-6">
        
        {/* Top Controls */}
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Месяц</label>
                <Select defaultValue={new Date().getMonth() + 1 + ''}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Месяц" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}).map((_, i) => (
                      <SelectItem key={i+1} value={`${i+1}`}>{i+1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Год</label>
                <Select defaultValue={new Date().getFullYear() + ''}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Год" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px] space-y-2">
                <label className="text-sm font-medium">Поиск (ФИО, Телефон)</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Введите данные..." className="pl-8" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="archive-mode" 
                  checked={isArchive} 
                  onCheckedChange={setIsArchive} 
                />
                <label htmlFor="archive-mode" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  Архив
                </label>
              </div>

              <Button variant="outline" onClick={fetchApplications} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
              </Button>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Выгрузить ({selectedIds.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{isArchive ? 'Архивные заявки' : 'Активные заявки'}</CardTitle>
                <CardDescription>
                  Найдено записей: {applications.length}
                </CardDescription>
              </div>
              <Button variant="secondary" onClick={() => router.push('/card-apps/create')}>
                Новая заявка
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="h-12 px-4 w-12">
                      <Checkbox 
                        checked={selectedIds.length === applications.length && applications.length > 0} 
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="h-12 px-4 font-medium">ID</th>
                    <th className="h-12 px-4 font-medium">ФИО</th>
                    <th className="h-12 px-4 font-medium">Телефон</th>
                    <th className="h-12 px-4 font-medium">Карта</th>
                    <th className="h-12 px-4 font-medium">Скан документов</th>
                    <th className="h-12 px-4 font-medium">Офис</th>
                    <th className="h-12 px-4 font-medium">Дата создания</th>
                    <th className="h-12 px-4 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.ID} className={`border-t transition-colors hover:bg-muted/30 ${selectedIds.includes(app.ID) ? 'bg-primary/5' : ''}`}>
                      <td className="p-4">
                        <Checkbox 
                          checked={selectedIds.includes(app.ID)} 
                          onCheckedChange={(checked) => handleSelectRow(checked as boolean, app.ID)}
                        />
                      </td>
                      <td className="p-4">{app.ID}</td>
                      <td className="p-4 font-medium">{app.surname} {app.name} {app.patronymic}</td>
                      <td className="p-4">{app.phone_number}</td>
                      <td className="p-4">{app.card_name}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500" title="Лицевая сторона" onClick={() => setPreviewImage('https://via.placeholder.com/600x400?text=Passport+Front')}>
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500" title="Оборотная сторона" onClick={() => setPreviewImage('https://via.placeholder.com/600x400?text=Passport+Back')}>
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500" title="Селфи с паспортом" onClick={() => setPreviewImage('https://via.placeholder.com/600x400?text=Selfie')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">{app.receiving_office}</td>
                      <td className="p-4">{new Date(app.CreatedAt).toLocaleDateString('ru-RU')}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/card-apps/create/${app.ID}`)}>
                            <Edit2 className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(app.ID)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && !loading && (
                    <tr>
                      <td colSpan={9} className="h-24 text-center text-muted-foreground">
                        Заявок не найдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl border-none p-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">Просмотр документа</DialogTitle>
          <div className="relative flex justify-center items-center">
            {previewImage && (
              <img src={previewImage} alt="Скан" className="max-w-full max-h-[80vh] rounded-lg shadow-xl" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
