'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, Download, Filter, Archive, Edit, Trash2, FileImage } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_APPLICATIONS = [
  { id: 1, surname: 'Иванов', name: 'Иван', phone: '992900000001', code_word: 'Мама', card_name: 'Visa Classic', status: 'Новая', created_at: '2023-10-01', resident: true, file: 'passport.jpg' },
  { id: 2, surname: 'Петров', name: 'Петр', phone: '992900000002', code_word: 'Дерево', card_name: 'Корти Милли', status: 'В обработке', created_at: '2023-10-02', resident: true, file: null },
  { id: 3, surname: 'Сидоров', name: 'Сидор', phone: '992900000003', code_word: 'Кот', card_name: 'MasterCard', status: 'Одобрено', created_at: '2023-10-03', resident: false, file: 'id.jpg' },
];

export function CardApplicationsListPage() {
  const [data, setData] = useState(MOCK_APPLICATIONS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isArchive, setIsArchive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [filters, setFilters] = useState({ search: '', status: 'all', month: '', year: '' });

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(data.map(item => item.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(item => item !== id));
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      toast.error('Выберите хотя бы одну заявку для выгрузки');
      return;
    }
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Отчет успешно скачан!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить заявку?')) {
      setData(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      toast.success('Заявка удалена');
    }
  };

  const handleBulkStatusChange = (newStatus: string) => {
    if (selectedIds.length === 0) return;
    setData(prev => prev.map(item => 
      selectedIds.includes(item.id) ? { ...item, status: newStatus } : item
    ));
    setSelectedIds([]);
    toast.success(`Статус обновлен для ${selectedIds.length} заявок`);
  };

  const filteredData = data.filter(item => {
    const matchSearch = (item.name + item.surname + item.phone).toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === 'all' || item.status === filters.status;
    return matchSearch && matchStatus;
  });

  return (
    <PageContainer
      title="Список заявок на карты"
      description="Управление заявками на выпуск банковских карт. Отслеживание статусов и экспорт данных."
    >
      <div className="space-y-6">
        
        {/* Actions & Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по ФИО или телефону"
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Фильтры
              </Button>
              <Button variant={isArchive ? "secondary" : "outline"} onClick={() => setIsArchive(!isArchive)}>
                <Archive className="w-4 h-4 mr-2" />
                Архив
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              {selectedIds.length > 0 && (
                <Select onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="w-[180px] border-primary">
                    <SelectValue placeholder="Изменить статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Новая">Новая</SelectItem>
                    <SelectItem value="В обработке">В обработке</SelectItem>
                    <SelectItem value="Одобрено">Одобрено</SelectItem>
                    <SelectItem value="Отклонено">Отклонено</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleExport} disabled={isExporting} variant="default">
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Экспорт Excel
              </Button>
            </div>
          </CardContent>

          {/* Expanded Filters */}
          {showFilters && (
            <CardContent className="p-4 pt-0 border-t bg-muted/20 flex flex-wrap gap-4 mt-4 rounded-b-xl">
              <div className="w-40">
                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                  <SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="Новая">Новая</SelectItem>
                    <SelectItem value="В обработке">В обработке</SelectItem>
                    <SelectItem value="Одобрено">Одобрено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input 
                placeholder="Месяц (1-12)" 
                type="number" 
                className="w-32"
                value={filters.month}
                onChange={e => setFilters({ ...filters, month: e.target.value })}
              />
              <Input 
                placeholder="Год (2024)" 
                type="number" 
                className="w-32"
                value={filters.year}
                onChange={e => setFilters({ ...filters, year: e.target.value })}
              />
            </CardContent>
          )}
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox 
                        checked={selectedIds.length === data.length && data.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Карта</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-center">Документ</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                        Нет заявок
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map(row => (
                      <TableRow key={row.id} className={selectedIds.includes(row.id) ? "bg-primary/5" : ""}>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={selectedIds.includes(row.id)}
                            onCheckedChange={(c) => handleSelectOne(row.id, c as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{row.surname} {row.name}</TableCell>
                        <TableCell>{row.phone}</TableCell>
                        <TableCell>{row.card_name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${row.status === 'Новая' ? 'bg-blue-100 text-blue-700' : ''}
                            ${row.status === 'В обработке' ? 'bg-amber-100 text-amber-700' : ''}
                            ${row.status === 'Одобрено' ? 'bg-green-100 text-green-700' : ''}
                          `}>
                            {row.status}
                          </span>
                        </TableCell>
                        <TableCell>{row.created_at}</TableCell>
                        <TableCell className="text-center">
                          {row.file ? (
                            <Button variant="ghost" size="icon" onClick={() => setPreviewImage(`https://placehold.co/600x400.png?text=Document+${row.id}`)}>
                              <FileImage className="w-5 h-5 text-muted-foreground" />
                            </Button>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => alert('Редактирование...')}>
                              <Edit className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
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
      </div>

      {/* Image Preview Modal */}
      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Просмотр документа</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center bg-muted/30 rounded-md p-4 mt-2">
            {previewImage && <img src={previewImage} alt="Document" className="max-w-full max-h-[70vh] rounded-md object-contain shadow-sm border" />}
          </div>
        </DialogContent>
      </Dialog>

    </PageContainer>
  );
}
