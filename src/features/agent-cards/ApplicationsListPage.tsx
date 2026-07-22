'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as xlsx from 'xlsx';
import {
  Archive,
  CalendarDays,
  Download,
  Eye,
  FileImage,
  Filter,
  ImageOff,
  Loader2,
  Phone,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { useAuthStore } from '@/stores/auth-store';

const APPLICATIONS_URL = 'http://10.65.10.20:7676/applications';
const OPERATOR_STORAGE_KEY = 'activ_daily_application_operators';

const STATUS_TABS = [
  { id: 0, name: 'Все' },
  { id: 1, name: 'Заявка принята' },
  { id: 2, name: 'Заявка обработана' },
  { id: 3, name: 'Карта открыта' },
  { id: 4, name: 'Карта активирована' },
  { id: 5, name: 'Недостоверные данные' },
  { id: 6, name: 'Отказано в карте' },
  { id: 7, name: 'Не одобрено' },
  { id: 8, name: 'Одобрено' },
];

type ApplicationStatus = {
  ID?: number;
  id?: number;
  name?: string;
};

type CardApplication = {
  ID: number;
  id?: number;
  name?: string;
  surname?: string;
  patronymic?: string;
  phone_number?: string;
  receiving_office?: string;
  card_name?: string;
  request_сreator?: string;
  request_creator?: string;
  application_status?: ApplicationStatus;
  operator_fio?: string;
  CreatedAt?: string;
  created_at?: string;
  inn?: string;
  address?: string;
  front_side_of_the_passport?: string;
  back_side_of_the_passport?: string;
  selfie_with_passport?: string;
  [key: string]: unknown;
};

function getApplicationId(app: CardApplication) {
  return Number(app.ID ?? app.id ?? 0);
}

function getFullName(app: CardApplication) {
  return [app.surname, app.name, app.patronymic].filter(Boolean).join(' ').trim() || 'Без имени';
}

function getInitials(app: CardApplication) {
  const parts = [app.name, app.surname].filter(Boolean);
  return parts.map((part) => String(part).trim()[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'AD';
}

function getStatusId(app: CardApplication) {
  return Number(app.application_status?.ID ?? app.application_status?.id ?? 0);
}

function getStatusName(app: CardApplication) {
  return app.application_status?.name || STATUS_TABS.find((status) => status.id === getStatusId(app))?.name || 'Без статуса';
}

function getCreatedAt(app: CardApplication) {
  return app.CreatedAt || app.created_at || '';
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU');
}

function isWithinDateRange(value: string, fromDate: string, toDate: string) {
  if (!fromDate && !toDate) return true;
  if (!value) return false;
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return false;

  if (fromDate) {
    const from = new Date(`${fromDate}T00:00:00`);
    if (created < from) return false;
  }

  if (toDate) {
    const to = new Date(`${toDate}T23:59:59.999`);
    if (created > to) return false;
  }

  return true;
}

function readOperatorMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(OPERATOR_STORAGE_KEY) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function writeOperatorName(applicationId: number, operatorName: string) {
  if (typeof window === 'undefined') return;
  const values = readOperatorMap();
  values[String(applicationId)] = operatorName;
  localStorage.setItem(OPERATOR_STORAGE_KEY, JSON.stringify(values));
}

function getDocumentUrl(path?: string) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `http://10.65.10.20:7676/${path.replace(/^\/+/, '')}`;
}

function DocumentPreview({ title, path }: { title: string; path?: string }) {
  const url = getDocumentUrl(path);

  return (
    <div className="space-y-3">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-inner">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <ImageOff className="h-9 w-9" />
            <span className="text-sm">Нет файла</span>
          </div>
        )}
      </div>
      <p className="text-center text-sm text-slate-500">{title}</p>
    </div>
  );
}

function statusBadgeClass(statusId: number) {
  if ([1, 5, 6, 7].includes(statusId)) return 'bg-red-50 text-red-700';
  if ([2].includes(statusId)) return 'bg-amber-50 text-amber-700';
  if ([3, 4, 8].includes(statusId)) return 'bg-emerald-50 text-emerald-700';
  return 'bg-slate-100 text-slate-700';
}

function statusDotClass(statusId: number) {
  if ([1, 5, 6, 7].includes(statusId)) return 'bg-red-500';
  if ([2].includes(statusId)) return 'bg-amber-500';
  if ([3, 4, 8].includes(statusId)) return 'bg-emerald-500';
  return 'bg-slate-400';
}

function getCurrentOperatorName() {
  const user = useAuthStore.getState().user;
  const name = [user?.lastName, user?.firstName].filter(Boolean).join(' ').trim();
  return name || user?.username || 'Сотрудник';
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function normalizeApplications(payload: unknown): CardApplication[] {
  if (Array.isArray(payload)) return payload as CardApplication[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidates = [record.data, record.items, record.applications, record.results];
    const nested = candidates.find(Array.isArray);
    if (Array.isArray(nested)) return nested as CardApplication[];
  }
  return [];
}

export function ApplicationsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<CardApplication[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState(0);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [archiveMode, setArchiveMode] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<CardApplication | null>(null);
  const [operatorMap, setOperatorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setOperatorMap(readOperatorMap());
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: '0' });
      params.set('status_id', String(selectedStatusId));
      if (fromDate) params.set('date_from', fromDate);
      if (toDate) params.set('date_to', toDate);

      const endpoint = archiveMode ? `${APPLICATIONS_URL}/archive` : APPLICATIONS_URL;

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      setApplications(normalizeApplications(payload));
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      toast.error('Не удалось загрузить заявки');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [archiveMode, fromDate, selectedStatusId, toDate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((app) => {
      const fields = [
        getApplicationId(app),
        getFullName(app),
        app.phone_number,
        app.receiving_office,
        app.card_name,
        app.request_сreator || app.request_creator,
        getStatusName(app),
        app.operator_fio,
        operatorMap[String(getApplicationId(app))],
        app.inn,
      ].join(' ').toLowerCase();

      return (!query || fields.includes(query)) && isWithinDateRange(getCreatedAt(app), fromDate, toDate);
    });
  }, [applications, fromDate, operatorMap, search, toDate]);

  const allVisibleSelected = filteredApplications.length > 0 && filteredApplications.every((app) => selectedIds.includes(getApplicationId(app)));

  function toggleAll(checked: boolean) {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !filteredApplications.some((app) => getApplicationId(app) === id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredApplications.map(getApplicationId)])));
  }

  function toggleRow(id: number, checked: boolean) {
    setSelectedIds((prev) => checked ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id));
  }

  async function openApplication(app: CardApplication) {
    const id = getApplicationId(app);
    const operatorName = getCurrentOperatorName();
    writeOperatorName(id, operatorName);
    setOperatorMap((prev) => ({ ...prev, [String(id)]: operatorName }));

    try {
      await fetch(`${APPLICATIONS_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.warn('Failed to update application operator', error);
    }

    router.push(`/agent/card/${id}`);
  }

  function exportRows() {
    const rows = filteredApplications.filter((app) => selectedIds.length === 0 || selectedIds.includes(getApplicationId(app)));
    if (rows.length === 0) {
      toast.warning('Нет данных для выгрузки');
      return;
    }

    const data = rows.map((app) => {
      const id = getApplicationId(app);
      return {
        ID: id,
        Клиент: getFullName(app),
        Телефон: app.phone_number || '',
        ИНН: app.inn || '',
        'Офис получения': app.receiving_office || '',
        Карта: app.card_name || '',
        Канал: app.request_сreator || app.request_creator || '',
        Статус: getStatusName(app),
        Оператор: operatorMap[String(id)] || app.operator_fio || '',
        'Дата создания': getCreatedAt(app),
      };
    });

    const sheet = xlsx.utils.json_to_sheet(data);
    const book = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(book, sheet, 'Applications');
    xlsx.writeFile(book, 'applications.xlsx');
  }

  const documentsCount = selectedApplication ? [
    selectedApplication.front_side_of_the_passport,
    selectedApplication.back_side_of_the_passport,
    selectedApplication.selfie_with_passport,
  ].filter(Boolean).length : 0;

  return (
    <PageContainer
      title="Заявки на карты"
      description="Единый список заявок с быстрым переходом по статусам, поиском и деталями клиента"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((status) => (
            <button
              key={status.id}
              type="button"
              onClick={() => setSelectedStatusId(status.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedStatusId === status.id
                  ? 'border-[#C8102E] bg-[#C8102E] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {status.name}
            </button>
          ))}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по ID, клиенту, телефону, офису, карте, ИНН..."
                className="h-12 rounded-2xl border-slate-200 pl-11"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-8 w-[145px] border-0 p-0 shadow-none focus-visible:ring-0" aria-label="Дата от" />
                <span className="text-slate-300">—</span>
                <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-8 w-[145px] border-0 p-0 shadow-none focus-visible:ring-0" aria-label="Дата до" />
              </div>

              <Button variant={archiveMode ? 'default' : 'outline'} className="h-12 rounded-2xl gap-2" onClick={() => setArchiveMode((value) => !value)}>
                <Archive className="h-4 w-4" /> Архив
              </Button>
              <Button variant={showFilters ? 'default' : 'outline'} className="h-12 rounded-2xl gap-2" onClick={() => setShowFilters((value) => !value)}>
                <Filter className="h-4 w-4" /> Фильтры
              </Button>
              <Button className="h-12 rounded-2xl bg-[#C8102E] hover:bg-[#a90d27] gap-2" onClick={exportRows}>
                <Download className="h-4 w-4" /> Выгрузка
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Фильтры применяются по всем видимым параметрам и по CreatedAt.</span>
              {(search || fromDate || toDate) && (
                <Button variant="ghost" size="sm" className="ml-auto gap-2 rounded-xl" onClick={() => { setSearch(''); setFromDate(''); setToDate(''); }}>
                  <X className="h-4 w-4" /> Очистить
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  <th className="w-14 px-5 py-5">
                    <Checkbox checked={allVisibleSelected} onCheckedChange={(checked) => toggleAll(Boolean(checked))} />
                  </th>
                  <th className="px-5 py-5">ID</th>
                  <th className="px-5 py-5">Клиент</th>
                  <th className="px-5 py-5">Офис получения</th>
                  <th className="px-5 py-5">Карта</th>
                  <th className="px-5 py-5">Канал</th>
                  <th className="px-5 py-5">Статус</th>
                  <th className="px-5 py-5">Оператор</th>
                  <th className="px-5 py-5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="h-52 text-center text-slate-500">
                      <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#C8102E]" />
                      Загрузка заявок...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="h-52 text-center text-slate-500">Заявок не найдено</td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => {
                    const id = getApplicationId(app);
                    const statusId = getStatusId(app);
                    return (
                      <tr key={id} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <Checkbox checked={selectedIds.includes(id)} onCheckedChange={(checked) => toggleRow(id, Boolean(checked))} />
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-500">#{id}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{getInitials(app)}</div>
                            <div>
                              <div className="font-semibold text-slate-900">{getFullName(app)}</div>
                              <div className="text-xs text-slate-500">{app.phone_number || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[240px] px-5 py-4 font-medium text-slate-800">{app.receiving_office || '—'}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{app.card_name || '—'}</td>
                        <td className="px-5 py-4 text-slate-600">{app.request_сreator || app.request_creator || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(statusId)}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(statusId)}`} />
                            {getStatusName(app)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{operatorMap[String(id)] || app.operator_fio || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => setSelectedApplication(app)}>
                              <Eye className="h-4 w-4" /> Подробнее
                            </Button>
                            <Button size="sm" className="rounded-full bg-[#C8102E] hover:bg-[#a90d27]" onClick={() => openApplication(app)}>
                              Перейти к заявке
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Показано {filteredApplications.length} из {applications.length} заявок</span>
            <span>Выбрано: {selectedIds.length}</span>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedApplication)} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden rounded-[28px] p-0" showCloseButton={false}>
          {selectedApplication && (
            <>
              <div className="flex items-start justify-between border-b border-slate-100 px-8 py-7">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <DialogTitle className="text-2xl font-bold text-slate-950">Заявка #{getApplicationId(selectedApplication)}</DialogTitle>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeClass(getStatusId(selectedApplication))}`}>
                      <span className={`h-2 w-2 rounded-full ${statusDotClass(getStatusId(selectedApplication))}`} />
                      {getStatusName(selectedApplication)}
                    </span>
                  </div>
                  <p className="mt-2 text-lg text-slate-500">{getFullName(selectedApplication)}</p>
                </div>
                <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50" onClick={() => setSelectedApplication(null)} type="button">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[calc(92vh-176px)] overflow-y-auto px-8 py-7">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-5">
                    <div className="flex items-center gap-4">
                      <Phone className="h-6 w-6 text-slate-500" />
                      <div><p className="text-sm text-slate-500">Телефон</p><p className="text-lg font-semibold">{selectedApplication.phone_number || '—'}</p></div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-5">
                    <div className="flex items-center gap-4">
                      <FileImage className="h-6 w-6 text-slate-500" />
                      <div><p className="text-sm text-slate-500">Карта</p><p className="text-lg font-semibold">{selectedApplication.card_name || '—'}</p></div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-5">
                    <div className="flex items-center gap-4">
                      <UserRound className="h-6 w-6 text-slate-500" />
                      <div><p className="text-sm text-slate-500">ИНН</p><p className="text-lg font-semibold">{selectedApplication.inn || '—'}</p></div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-5">
                    <div className="flex items-center gap-4">
                      <Archive className="h-6 w-6 text-slate-500" />
                      <div><p className="text-sm text-slate-500">Офис получения</p><p className="text-lg font-semibold">{selectedApplication.receiving_office || '—'}</p></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-950">Сканы паспорта</h3>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">Загружено {documentsCount} из 3</span>
                </div>

                <div className="mt-5 grid gap-6 md:grid-cols-3">
                  <DocumentPreview title="Лицевая сторона" path={selectedApplication.front_side_of_the_passport} />
                  <DocumentPreview title="Задняя сторона" path={selectedApplication.back_side_of_the_passport} />
                  <DocumentPreview title="Скан с лицом" path={selectedApplication.selfie_with_passport} />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-8 py-5 sm:flex-row sm:justify-end">
                <Button variant="outline" className="rounded-2xl px-7" onClick={() => setSelectedApplication(null)}>Закрыть</Button>
                <Button variant="outline" className="rounded-2xl border-red-200 bg-red-50 px-7 text-red-700 hover:bg-red-100 hover:text-red-800">Отклонить</Button>
                <Button className="rounded-2xl bg-[#C8102E] px-7 hover:bg-[#a90d27]" onClick={() => openApplication(selectedApplication)}>Одобрить заявку</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
