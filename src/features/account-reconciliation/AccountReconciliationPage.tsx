'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { CheckCircle2, Loader2, Plus, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const RULES_STORAGE_KEY = 'activ_daily_account_reconciliation_rules';

type ReconciliationRule = {
  id: string;
  terminal: string;
  account: string;
  name: string;
  createdAt: string;
};

type StatementOperation = {
  dscr?: string;
  sdok?: string | number;
  txt_pay?: string;
  doper?: string;
  [key: string]: unknown;
};

type ProcessingOperation = {
  utrnno?: string | number;
  localTransactionTime?: string;
  cardNumber?: string;
  [key: string]: unknown;
};

type ReconciliationRow = {
  description: string;
  amount: string;
  payer: string;
  operationDate: string;
  osonOperationNumber: string;
  rrn: string;
  operationTime: string;
  card: string;
  reimbursed: boolean;
};

function readRules(): ReconciliationRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(RULES_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRules(rules: ReconciliationRule[]) {
  localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidates = [record.data, record.items, record.transactions, record.results];
    const nested = candidates.find(Array.isArray);
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
}

function extractOsonOperationNumber(description: string) {
  return description.match(/№\s*(\d{8})/)?.[1] || '';
}

function extractRrn(description: string) {
  return description.match(/rrn\s+0*(\d{9})/i)?.[1] || '';
}

function buildRows(statement: StatementOperation[], processing: ProcessingOperation[]): ReconciliationRow[] {
  const processingByUtrnno = new Map(
    processing
      .filter((item) => item.utrnno !== undefined && item.utrnno !== null)
      .map((item) => [String(item.utrnno), item]),
  );

  return statement.map((item) => {
    const description = String(item.dscr || '');
    const rrn = extractRrn(description);
    const match = rrn ? processingByUtrnno.get(rrn) : undefined;

    return {
      description,
      amount: String(item.sdok ?? ''),
      payer: String(item.txt_pay || ''),
      operationDate: String(item.doper || ''),
      osonOperationNumber: extractOsonOperationNumber(description),
      rrn,
      operationTime: match?.localTransactionTime || '',
      card: match?.cardNumber || '',
      reimbursed: Boolean(match),
    };
  });
}

export function AccountReconciliationPage() {
  const [rules, setRules] = useState<ReconciliationRule[]>([]);
  const [search, setSearch] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [reconciliationRule, setReconciliationRule] = useState<ReconciliationRule | null>(null);
  const [form, setForm] = useState({ terminal: '', account: '', name: '' });
  const [dates, setDates] = useState({ fromDate: '', toDate: '' });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ReconciliationRow[]>([]);

  useEffect(() => {
    setRules(readRules());
  }, []);

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rules;
    return rules.filter((rule) => [rule.name, rule.terminal, rule.account].join(' ').toLowerCase().includes(query));
  }, [rules, search]);

  const matchedCount = rows.filter((row) => row.reimbursed).length;

  function registerRule() {
    const terminal = form.terminal.trim();
    const account = form.account.trim();
    const name = form.name.trim();

    if (!terminal || !account || !name) {
      toast({ title: 'Заполните терминал, счёт и название', variant: 'destructive' });
      return;
    }

    const nextRules = [
      {
        id: crypto.randomUUID(),
        terminal,
        account,
        name,
        createdAt: new Date().toISOString(),
      },
      ...rules,
    ];
    setRules(nextRules);
    saveRules(nextRules);
    setForm({ terminal: '', account: '', name: '' });
    setRegistrationOpen(false);
    toast({ title: 'Правило сверки зарегистрировано' });
  }

  function openReconciliation(rule: ReconciliationRule) {
    setReconciliationRule(rule);
    setRows([]);
    const today = new Date().toISOString().split('T')[0];
    setDates({ fromDate: today, toDate: today });
  }

  async function runReconciliation() {
    if (!reconciliationRule) return;
    if (!dates.fromDate || !dates.toDate) {
      toast({ title: 'Укажите дату от и до', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const statementUrl = new URL('/api/account-reconciliation/statement', window.location.origin);
      statementUrl.searchParams.set('acc', reconciliationRule.account);
      statementUrl.searchParams.set('dt1', dates.fromDate);
      statementUrl.searchParams.set('dt2', dates.toDate);

      const processingUrl = new URL('/api/account-reconciliation/processing', window.location.origin);
      processingUrl.searchParams.set('atmId', reconciliationRule.terminal);
      processingUrl.searchParams.set('fromDate', dates.fromDate);
      processingUrl.searchParams.set('toDate', dates.toDate);

      const [statementResponse, processingResponse] = await Promise.all([
        fetch(statementUrl.toString()),
        fetch(processingUrl.toString()),
      ]);

      if (!statementResponse.ok) throw new Error('Ошибка загрузки выписки по счёту');
      if (!processingResponse.ok) throw new Error('Ошибка загрузки операций ПЦ');

      const [statementPayload, processingPayload] = await Promise.all([
        statementResponse.json(),
        processingResponse.json(),
      ]);

      const nextRows = buildRows(
        normalizeArray<StatementOperation>(statementPayload),
        normalizeArray<ProcessingOperation>(processingPayload),
      );
      setRows(nextRows);
      toast({ title: `Сверка выполнена: ${nextRows.filter((row) => row.reimbursed).length} совпадений из ${nextRows.length}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка сверки';
      toast({ title: message, variant: 'destructive' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer
      title="Сверка счетов"
      description="Регистрация правил и сверка операций АБС с транзакциями процессинга по RRN"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, терминалу или счёту..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8"
            />
          </div>
          <Button className="bg-[#C8102E] hover:bg-[#a90d27]" onClick={() => setRegistrationOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Регистрация сверки
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Правила сверки</CardTitle>
            <CardDescription>Выберите зарегистрированное правило, чтобы открыть окно сверки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative min-h-[360px] overflow-x-auto rounded-md border">
              {filteredRules.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <ShieldCheck className="mb-3 h-10 w-10 text-slate-300" />
                  <p>Правила сверки пока не зарегистрированы</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Название</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Терминал</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Номер счёта</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Дата регистрации</th>
                      <th className="h-12 px-4 font-medium text-right whitespace-nowrap">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule) => (
                      <tr key={rule.id} className="border-t transition-colors hover:bg-muted/30">
                        <td className="p-4 font-medium">{rule.name}</td>
                        <td className="p-4 font-mono text-xs">{rule.terminal}</td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">{rule.account}</td>
                        <td className="p-4 text-xs text-muted-foreground">{new Date(rule.createdAt).toLocaleString('ru-RU')}</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => openReconciliation(rule)}>
                            Открыть сверку
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={registrationOpen} onOpenChange={setRegistrationOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Регистрация правила сверки</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Название
              <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Например: OSON DC Dulkusho" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Терминал
              <Input value={form.terminal} onChange={(event) => setForm((prev) => ({ ...prev, terminal: event.target.value }))} placeholder="M1000001" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Номер счёта
              <Input value={form.account} onChange={(event) => setForm((prev) => ({ ...prev, account: event.target.value }))} placeholder="17507972090808713010" />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegistrationOpen(false)}>Отмена</Button>
            <Button className="bg-[#C8102E] hover:bg-[#a90d27]" onClick={registerRule}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(reconciliationRule)} onOpenChange={(open) => !open && setReconciliationRule(null)}>
        <DialogContent className="max-h-[92vh] max-w-7xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>{reconciliationRule ? `Сверка: ${reconciliationRule.name}` : 'Сверка'}</DialogTitle>
          </DialogHeader>

          {reconciliationRule && (
            <div className="flex max-h-[calc(92vh-8rem)] flex-col gap-4 overflow-hidden">
              <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                <label className="grid gap-2 text-sm font-medium">
                  Дата от
                  <Input type="date" value={dates.fromDate} onChange={(event) => setDates((prev) => ({ ...prev, fromDate: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Дата до
                  <Input type="date" value={dates.toDate} onChange={(event) => setDates((prev) => ({ ...prev, toDate: event.target.value }))} />
                </label>
                <div className="text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Терминал:</span> {reconciliationRule.terminal}</p>
                  <p><span className="font-medium text-foreground">Счёт:</span> {reconciliationRule.account}</p>
                </div>
                <Button onClick={runReconciliation} disabled={loading} className="bg-[#C8102E] hover:bg-[#a90d27]">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Выполнить
                </Button>
              </div>

              {rows.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Да: {matchedCount}</Badge>
                  <Badge className="bg-red-50 text-red-700 hover:bg-red-50">Нет: {rows.length - matchedCount}</Badge>
                  <Badge variant="outline">Всего: {rows.length}</Badge>
                </div>
              )}

              <div className="min-h-[360px] overflow-auto rounded-md border">
                {loading ? (
                  <div className="flex h-80 flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
                    Загружаем операции и сверяем RRN...
                  </div>
                ) : rows.length === 0 ? (
                  <div className="flex h-80 items-center justify-center text-muted-foreground">Укажите период и выполните сверку</div>
                ) : (
                  <table className="w-full min-w-[1300px] text-left text-sm">
                    <thead className="sticky top-0 bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="h-12 px-4 font-medium">Назначение платежа</th>
                        <th className="h-12 px-4 font-medium whitespace-nowrap">Сумма операции</th>
                        <th className="h-12 px-4 font-medium whitespace-nowrap">Плательщик</th>
                        <th className="h-12 px-4 font-medium whitespace-nowrap">Дата операции</th>
                        <th className="h-12 px-4 font-medium whitespace-nowrap">Номер операции в ОСОН</th>
                        <th className="h-12 px-4 font-medium whitespace-nowrap">Время операции</th>
                        <th className="h-12 px-4 font-medium whitespace-nowrap">Карта</th>
                        <th className="h-12 px-4 font-medium whitespace-nowrap">Возмещение получено</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={`${row.osonOperationNumber}-${row.rrn}-${index}`} className="border-t transition-colors hover:bg-muted/30">
                          <td className="max-w-[420px] p-4 text-xs leading-relaxed">{row.description || '—'}</td>
                          <td className="p-4 font-semibold whitespace-nowrap">{row.amount || '—'}</td>
                          <td className="p-4 whitespace-nowrap">{row.payer || '—'}</td>
                          <td className="p-4 whitespace-nowrap">{row.operationDate || '—'}</td>
                          <td className="p-4 font-mono text-xs whitespace-nowrap">{row.osonOperationNumber || '—'}</td>
                          <td className="p-4 font-mono text-xs whitespace-nowrap">{row.operationTime || '—'}</td>
                          <td className="p-4 font-mono text-xs whitespace-nowrap">{row.card || '—'}</td>
                          <td className="p-4 whitespace-nowrap">
                            {row.reimbursed ? (
                              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"><CheckCircle2 className="mr-1 h-3 w-3" /> Да</Badge>
                            ) : (
                              <Badge className="bg-red-50 text-red-700 hover:bg-red-50"><XCircle className="mr-1 h-3 w-3" /> Нет</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
