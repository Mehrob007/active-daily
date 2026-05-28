'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable } from '@/components/banking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
} from 'lucide-react';
import { qrAgentService } from '../services/qr-agent-service';
import { QRWithdrawSetting } from '../types';
import { toast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const bankOptions = [
  { bic: "350101101", name: "Национальный банк Таджикистана (НБТ)" },
  { bic: "350101369", name: 'ОАО "Ориёнбанк"' },
  { bic: "350101626", name: 'ГУП СБ РТ "Амонатбанк"' },
  { bic: "350101655", name: 'ГУП ПЭБТ "Саноатсодиротбонк"' },
  { bic: "350101706", name: 'Филиал КБ "Тижорат"' },
  { bic: "350101720", name: 'ОАО "Тавхидбонк"' },
  { bic: "350101736", name: 'ЗАО "Бонки рушди Точикистон"' },
  { bic: "350101779", name: 'ЗАО "Актив Бонк"' },
  { bic: "350101803", name: 'ЗАО "Бонки байналмилалии Точикистон"' },
  { bic: "350101805", name: 'ЗАО "Инвестиционно-кредитный банк Таджикистан"' },
  { bic: "350101808", name: 'ЗАО "Спитамен Бонк"' },
  { bic: "350101815", name: 'ЗАО "Фридом Бонк Точикистон"' },
  { bic: "350101820", name: 'ЗАО "Васл Бонк"' },
  { bic: "350101841", name: 'ЗАО "Душанбе Сити Бонк"' },
  { bic: "350101858", name: 'ОАО "Коммерцбонк Таджикистана"' },
  { bic: "350101892", name: 'ЗАО "Хумо Бонк"' },
  { bic: "350101900", name: 'ОАО "АлифБонк"' },
  { bic: "350501707", name: 'ОАО "Бонки Эсхата"' },
  { bic: "350501848", name: 'ЗАО Бонки "Арванд"' },
  { bic: "350501876", name: 'ЗАО Бонки "Имон Интернейшнл"' },
];

const EMPTY_FORM = {
  beneficiary_idn: "",
  beneficiary_name: "",
  beneficiary_iban: "",
  payment_details: "",
  payer_idn: "",
  payer_name: "",
  payer_iban: "",
  bic: "",
  is_active: true,
};

export default function QRWithdrawSettingsPage() {
  const [items, setItems] = useState<QRWithdrawSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QRWithdrawSetting | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await qrAgentService.getWithdrawSettings();
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить настройки', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredData = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(item => 
      [item.payer_iban, item.payer_name, item.payer_idn, item.beneficiary_iban, item.beneficiary_name, item.beneficiary_idn, item.bic, item.payment_details].some(
        v => v && String(v).toLowerCase().includes(q)
      )
    );
  }, [items, search]);

  const handleOpenCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: QRWithdrawSetting) => {
    setEditTarget(item);
    setForm({
      beneficiary_idn: item.beneficiary_idn || "",
      beneficiary_name: item.beneficiary_name || "",
      beneficiary_iban: item.beneficiary_iban || "",
      payment_details: item.payment_details || "",
      payer_idn: item.payer_idn || "",
      payer_name: item.payer_name || "",
      payer_iban: item.payer_iban || "",
      bic: item.bic || "",
      is_active: item.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await qrAgentService.updateWithdrawSetting(editTarget.ID, form);
        toast({ title: 'Успешно', description: 'Настройка обновлена' });
      } else {
        await qrAgentService.createWithdrawSetting(form);
        toast({ title: 'Успешно', description: 'Настройка создана' });
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить настройки', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту настройку?')) return;
    try {
      await qrAgentService.deleteWithdrawSetting(id);
      toast({ title: 'Успешно', description: 'Настройка удалена' });
      fetchItems();
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить настройку', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<QRWithdrawSetting>[] = [
    { accessorKey: 'ID', header: 'ID' },
    { accessorKey: 'payer_name', header: 'Плательщик' },
    { accessorKey: 'payer_iban', header: 'IBAN плательщика', cell: ({ row }) => <span className="font-mono text-xs">{row.original.payer_iban}</span> },
    { accessorKey: 'beneficiary_name', header: 'Получатель' },
    { accessorKey: 'beneficiary_iban', header: 'IBAN получателя', cell: ({ row }) => <span className="font-mono text-xs">{row.original.beneficiary_iban}</span> },
    { 
      accessorKey: 'bic', 
      header: 'БИК',
      cell: ({ row }) => {
        const bank = bankOptions.find(b => b.bic === row.original.bic);
        return <span className="text-xs" title={bank?.name}>{row.original.bic}</span>;
      }
    },
    { 
      accessorKey: 'is_active', 
      header: 'Активен',
      cell: ({ row }) => row.original.is_active ? <Badge className="bg-emerald-50 text-emerald-700">Да</Badge> : <Badge variant="outline" className="text-slate-400">Нет</Badge>
    },
    { 
      id: 'actions', 
      header: 'Действия',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(row.original)} className="size-8 text-slate-500">
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(row.original.ID)} className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
            <Trash2 className="size-4" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <PageContainer title="Настройки QR АБС" subtitle="Управление реквизитами для межбанковских QR переводов">

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Поиск по IBAN, имени, ИНН..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" /> Экспорт
          </Button>
          <Button size="sm" onClick={handleOpenCreate} className="gap-2 bg-bank-red text-white hover:bg-bank-red/90">
            <Plus className="size-4" /> Добавить
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        pageSize={15}
        emptyMessage="Настройки не найдены"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? `Редактирование #${editTarget.ID}` : 'Новая настройка'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Имя получателя</Label>
              <Input value={form.beneficiary_name} onChange={(e) => setForm({...form, beneficiary_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>ИНН получателя</Label>
              <Input value={form.beneficiary_idn} onChange={(e) => setForm({...form, beneficiary_idn: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>IBAN получателя</Label>
              <Input value={form.beneficiary_iban} onChange={(e) => setForm({...form, beneficiary_iban: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>БИК банка получателя</Label>
              <Select value={form.bic} onValueChange={(val) => setForm({...form, bic: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите банк" />
                </SelectTrigger>
                <SelectContent>
                  {bankOptions.map(b => (
                    <SelectItem key={b.bic} value={b.bic}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Имя плательщика</Label>
              <Input value={form.payer_name} onChange={(e) => setForm({...form, payer_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>ИНН плательщика</Label>
              <Input value={form.payer_idn} onChange={(e) => setForm({...form, payer_idn: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>IBAN плательщика</Label>
              <Input value={form.payer_iban} onChange={(e) => setForm({...form, payer_iban: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Детали платежа</Label>
              <Input value={form.payment_details} onChange={(e) => setForm({...form, payment_details: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Switch checked={form.is_active} onCheckedChange={(val) => setForm({...form, is_active: val})} />
              <Label>Активен</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={isSubmitting} className="bg-bank-red text-white">
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageContainer>
  );
}
