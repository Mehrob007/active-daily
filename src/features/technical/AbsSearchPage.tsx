'use client';

import React, { useState, useCallback } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, StatusBadge, KPICard } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  User,
  CreditCard,
  Phone,
  FileText,
  Wallet,
  Building2,
  CalendarDays,
  Hash,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── API endpoints ──────────────────────────────────────────────
const ABS_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL || 'http://localhost:5000';

const TYPE_SEARCH_CLIENT = [
  { value: "client/info?phoneNumber=", label: "Поиск по Номеру телефона", type: "phone" },
  { value: "client/info/client-index?clientIndex=", label: "Поиск по Коду клиента", type: "code" },
  { value: "client/info/inn?inn=", label: "Поиск по ИНН", type: "inn" },
];

export default function AbsSearchPage() {
  const [searchType, setSearchType] = useState(TYPE_SEARCH_CLIENT[0].value);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchClientData = async (clientCode: string) => {
    setIsLoadingDetails(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const [accountsRes, cardsRes, creditsRes, depositsRes] = await Promise.all([
        fetch(`${ABS_BASE_URL}/accounts?clientIndex=${clientCode}`, { headers }),
        fetch(`${ABS_BASE_URL}/cards?clientIndex=${clientCode}`, { headers }),
        fetch(`${ABS_BASE_URL}/credits?clientIndex=${clientCode}`, { headers }),
        fetch(`${ABS_BASE_URL}/deposits?clientIndex=${clientCode}`, { headers })
      ]);

      const accData = accountsRes.ok ? await accountsRes.json() : [];
      const cardData = cardsRes.ok ? await cardsRes.json() : [];
      const credData = creditsRes.ok ? await creditsRes.json() : [];
      const depData = depositsRes.ok ? await depositsRes.json() : [];

      setAccounts(Array.isArray(accData) ? accData : []);
      setCards(Array.isArray(cardData) ? cardData : []);
      setCredits(Array.isArray(credData) ? credData : []);
      setDeposits(Array.isArray(depData) ? depData : []);
      
    } catch (err) {
      console.error("Error fetching client details", err);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить детальную информацию', variant: 'destructive' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    setClients([]);
    setAccounts([]);
    setCards([]);
    setCredits([]);
    setDeposits([]);

    try {
      const token = localStorage.getItem('access_token');
      const formattedQuery = searchQuery.trim().replace(/\D/g, ""); // For phone/code/inn we strip non-digits typically, but adjust as needed
      
      const apiUrl = `${ABS_BASE_URL}/${searchType}${formattedQuery}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast({ title: "Не найдено", description: "Клиенты не найдены в АБС", variant: "destructive" });
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      let normalizedData = Array.isArray(data) ? data : [data];
      
      if (normalizedData.length > 0) {
        setClients(normalizedData);
        setSelectedClientIndex(0);
        
        // Fetch detailed info for the first client
        const firstClientCode = normalizedData[0].client_code || normalizedData[0].ClientCode || normalizedData[0].Client?.Code || normalizedData[0].code;
        if (firstClientCode) {
          fetchClientData(firstClientCode);
        }
      } else {
        toast({ title: "Не найдено", description: "Клиенты не найдены", variant: "destructive" });
      }
    } catch (error) {
      console.error("Ошибка при поиске клиента:", error);
      toast({ title: "Ошибка", description: "Произошла ошибка при поиске клиента", variant: "destructive" });
    } finally {
      setHasSearched(true);
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const accountColumns: ColumnDef<any>[] = [
    { accessorKey: 'Number', header: 'Номер счёта', cell: ({ row }) => <span className="font-mono">{row.getValue('Number')}</span> },
    { accessorKey: 'Balance', header: 'Баланс', cell: ({ row }) => <span className="font-semibold tabular-nums">{row.getValue('Balance')}</span> },
    { accessorKey: 'Currency.Code', header: 'Валюта', cell: ({ row }) => <Badge variant="outline">{row.original?.Currency?.Code}</Badge> },
    { accessorKey: 'Status.Name', header: 'Статус', cell: ({ row }) => <StatusBadge status={row.original?.Status?.Name === 'Открыт' ? 'active' : 'closed'} /> },
  ];

  const cardColumns: ColumnDef<any>[] = [
    { accessorKey: 'cardId', header: 'ID Карты' },
    { accessorKey: 'CardTypeName', header: 'Тип' },
    { accessorKey: 'statusName', header: 'Статус' },
  ];

  const creditColumns: ColumnDef<any>[] = [
    { accessorKey: 'contractNumber', header: 'Номер договора' },
    { accessorKey: 'amount', header: 'Сумма' },
    { accessorKey: 'currency', header: 'Валюта' },
    { accessorKey: 'statusName', header: 'Статус' },
    { accessorKey: 'productName', header: 'Продукт' },
  ];

  const depositColumns: ColumnDef<any>[] = [
    { accessorKey: 'AgreementData.Code', header: 'Номер договора', cell: ({row}) => row.original?.AgreementData?.Code },
    { accessorKey: 'BalanceAccounts[0].Balance', header: 'Остаток', cell: ({row}) => row.original?.BalanceAccounts?.[0]?.Balance },
    { accessorKey: 'AgreementData.Status.Name', header: 'Статус', cell: ({row}) => row.original?.AgreementData?.Status?.Name },
    { accessorKey: 'AgreementData.Product.Name', header: 'Продукт', cell: ({row}) => row.original?.AgreementData?.Product?.Name },
  ];

  return (
    <PageContainer title="ABS поиск" subtitle="Поиск клиентов по банковской системе ABS">
      {/* ── Search Section ── */}
      <div className="mb-6 space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Тип поиска
          </Label>
          <div className="flex flex-wrap gap-2">
            {TYPE_SEARCH_CLIENT.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSearchType(opt.value)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  searchType === opt.value
                    ? 'border-bank-red bg-bank-active text-bank-red'
                    : 'border-border/60 bg-white text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2" />
            <Input
              placeholder="Введите данные для поиска..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 pl-11 text-base"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="h-12 gap-2 bg-bank-red px-8 text-white hover:bg-bank-red/90 shrink-0"
          >
            {isSearching ? 'Поиск...' : 'Найти'}
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* ── Results Section ── */}
      {!hasSearched && !isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="flex size-20 items-center justify-center rounded-full bg-bank-active mb-6">
            <Search className="size-10 text-bank-red" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Поиск клиента в ABS</h3>
        </div>
      )}

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="size-10 animate-spin rounded-full border-2 border-bank-red/20 border-t-bank-red mb-4" />
          <p className="text-sm">Поиск в системе ABS...</p>
        </div>
      )}

      {hasSearched && !isSearching && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted mb-6">
            <UserX className="size-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Клиент не найден</h3>
        </div>
      )}

      {clients.length > 0 && (
        <div className="space-y-6">
          
          {/* Multiple Clients Selection */}
          {clients.length > 1 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Найдено несколько клиентов ({clients.length}):</CardTitle>
              </CardHeader>
              <CardContent className="py-2 flex gap-2 overflow-x-auto">
                {clients.map((c, idx) => (
                  <Button 
                    key={idx} 
                    variant={selectedClientIndex === idx ? "default" : "outline"}
                    onClick={() => {
                      setSelectedClientIndex(idx);
                      const code = c.client_code || c.ClientCode || c.Client?.Code || c.code;
                      if (code) fetchClientData(code);
                    }}
                  >
                    {c.first_name || c.Client?.Name || `Клиент #${idx + 1}`}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Client Summary */}
          {(() => {
            const client = clients[selectedClientIndex];
            const name = client.first_name ? `${client.last_name || ''} ${client.first_name} ${client.middle_name || ''}` : (client.Client?.Name || 'Неизвестно');
            const code = client.client_code || client.ClientCode || client.Client?.Code || client.code;
            const phone = client.phone_number || client.Phone || 'Неизвестно';
            const inn = client.tax_code || client.Inn || 'Неизвестно';

            return (
              <div className="rounded-lg border border-border/60 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-bank-active">
                    <User className="size-6 text-bank-red" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">Код: {code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <Hash className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">ИНН</p>
                      <p className="text-sm font-medium">{inn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Телефон</p>
                      <p className="text-sm font-medium">{phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tabs for detailed data */}
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="accounts">Счета ({accounts.length})</TabsTrigger>
              <TabsTrigger value="cards">Карты ({cards.length})</TabsTrigger>
              <TabsTrigger value="credits">Кредиты ({credits.length})</TabsTrigger>
              <TabsTrigger value="deposits">Депозиты ({deposits.length})</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {isLoadingDetails ? (
                <div className="py-10 text-center text-muted-foreground">Загрузка данных...</div>
              ) : (
                <>
                  <TabsContent value="accounts">
                    <DataTable
                      columns={accountColumns}
                      data={accounts}
                      pageSize={10}
                      emptyMessage="У клиента нет счетов"
                    />
                  </TabsContent>
                  <TabsContent value="cards">
                    <DataTable
                      columns={cardColumns}
                      data={cards}
                      pageSize={10}
                      emptyMessage="У клиента нет карт"
                    />
                  </TabsContent>
                  <TabsContent value="credits">
                    <DataTable
                      columns={creditColumns}
                      data={credits}
                      pageSize={10}
                      emptyMessage="У клиента нет кредитов"
                    />
                  </TabsContent>
                  <TabsContent value="deposits">
                    <DataTable
                      columns={depositColumns}
                      data={deposits}
                      pageSize={10}
                      emptyMessage="У клиента нет депозитов"
                    />
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>

        </div>
      )}
    </PageContainer>
  );
}
