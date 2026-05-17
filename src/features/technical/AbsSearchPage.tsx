'use client';

import React, { useState, useCallback } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, StatusBadge } from '@/components/banking';
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
  Key,
  RefreshCw,
  Shield,
  Unlock,
  History,
  Check,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useNavigationStore } from '@/stores/navigation-store';

// ─── API endpoints ──────────────────────────────────────────────
const ABS_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL || 'http://localhost:5000';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.65.10.20:7575';
const SYSTEM_5012_URL = 'http://10.64.20.84:5012';

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

  // Modal controllers states
  const [activeCardForServices, setActiveCardForServices] = useState<any>(null);
  const [servicesPhone, setServicesPhone] = useState('');
  const [servicesSmsEnabled, setServicesSmsEnabled] = useState(false);
  const [servicesTdsEnabled, setServicesTdsEnabled] = useState(false);
  const [servicesTab, setServicesTab] = useState<'sms' | '3ds'>('sms');
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  const [activeCardForPin, setActiveCardForPin] = useState<any>(null);
  const [pinStep, setPinStep] = useState<'otp-request' | 'otp-verify' | 'pin-mode'>('otp-request');
  const [pinMode, setPinMode] = useState<'generate' | 'manual'>('generate');
  const [pinPhone, setPinPhone] = useState('');
  const [pinOtp, setPinOtp] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [isPinLoading, setIsPinLoading] = useState(false);

  const navigate = useNavigationStore((state) => state.navigate);

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
      let cardData = cardsRes.ok ? await cardsRes.json() : [];
      const credData = creditsRes.ok ? await creditsRes.json() : [];
      const depData = depositsRes.ok ? await depositsRes.json() : [];

      // Enriched Card details & services from processing base 5012
      if (Array.isArray(cardData) && cardData.length > 0) {
        cardData = await Promise.all(
          cardData.map(async (card: any) => {
            try {
              const detailsRes = await fetch(`${SYSTEM_5012_URL}/api/Transactions/card-data`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cardId: String(card.cardId) }),
              });
              const details = detailsRes.ok ? await detailsRes.json() : null;

              const servicesRes = await fetch(`${SYSTEM_5012_URL}/api/Transactions/services?CardId=${card.cardId}`);
              const services = servicesRes.ok ? await servicesRes.json() : [];

              // Convert dirams to somoni
              if (details && details.accounts && Array.isArray(details.accounts)) {
                details.accounts = details.accounts.map((acc: any) => ({
                  ...acc,
                  balance: acc.balance ? Number(acc.balance) / 100 : 0,
                }));
              }

              return {
                ...card,
                details,
                services,
              };
            } catch (cardErr) {
              console.error(`Failed to enrich card ${card.cardId}`, cardErr);
              return card;
            }
          })
        );
      }

      setAccounts(Array.isArray(accData) ? accData : []);
      setCards(cardData);
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
      const formattedQuery = searchQuery.trim().replace(/\D/g, "");
      
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
      setHasSearched(true);
    } catch (err) {
      console.error("Search error", err);
      toast({ title: 'Ошибка поиска', description: 'Произошла ошибка при выполнении запроса к АБС', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Card Management handlers
  const handleOpenServices = (card: any) => {
    setActiveCardForServices(card);
    const sms = card.services?.find((s: any) => s.identification?.serviceId === '300');
    const tds = card.services?.find((s: any) => s.identification?.serviceId === '330');
    setServicesSmsEnabled(!!sms);
    setServicesTdsEnabled(!!tds);
    setServicesPhone(sms?.extNumber || tds?.extNumber || '');
    setServicesTab('sms');
  };

  const handleOpenPin = (card: any) => {
    setActiveCardForPin(card);
    setPinStep('otp-request');
    setPinMode('generate');
    setPinOtp('');
    setPinValue('');
    const sms = card.services?.find((s: any) => s.identification?.serviceId === '300');
    const tds = card.services?.find((s: any) => s.identification?.serviceId === '330');
    setPinPhone(sms?.extNumber || tds?.extNumber || '');
  };

  const handleBlockCard = async (cardId: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions/block-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardId: String(cardId),
          hotCardStatus: '1',
        }),
      });
      if (!response.ok) throw new Error('Ошибка блокировки');
      toast({ title: 'Успешно', description: 'Карта успешно заблокирована' });
      const activeClient = clients[selectedClientIndex];
      const code = activeClient?.client_code || activeClient?.ClientCode || activeClient?.Client?.Code || activeClient?.code;
      if (code) fetchClientData(code);
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось заблокировать карту', variant: 'destructive' });
    }
  };

  const handleUnblockCard = async (cardId: string) => {
    try {
      const response = await fetch(`${SYSTEM_5012_URL}/api/Transactions/validate-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: String(cardId),
        }),
      });
      if (!response.ok) throw new Error('Ошибка разблокировки');
      toast({ title: 'Успешно', description: 'Карта успешно разблокирована' });
      const activeClient = clients[selectedClientIndex];
      const code = activeClient?.client_code || activeClient?.ClientCode || activeClient?.Client?.Code || activeClient?.code;
      if (code) fetchClientData(code);
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось разблокировать карту', variant: 'destructive' });
    }
  };

  const handleResetPin = async (cardId: string) => {
    try {
      const response = await fetch(`${SYSTEM_5012_URL}/api/Transactions/reset-pin-counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: String(cardId),
        }),
      });
      if (!response.ok) throw new Error('Ошибка сброса ПИН');
      toast({ title: 'Успешно', description: 'Счетчик попыток ПИН-кода успешно сброшен' });
      const activeClient = clients[selectedClientIndex];
      const code = activeClient?.client_code || activeClient?.ClientCode || activeClient?.Client?.Code || activeClient?.code;
      if (code) fetchClientData(code);
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось сбросить счетчик ПИН', variant: 'destructive' });
    }
  };

  // OTP handlers for Change PIN flow
  const handleSendPinOtp = async () => {
    if (!pinPhone) {
      toast({ title: 'Предупреждение', description: 'Введите номер телефона', variant: 'destructive' });
      return;
    }
    setIsPinLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/transactions/send-pin-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: String(pinPhone) }),
      });
      if (!response.ok) throw new Error('Ошибка отправки СМС');
      setPinStep('otp-verify');
      toast({ title: 'Успешно', description: 'СМС с кодом подтверждения отправлено' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось отправить код подтверждения', variant: 'destructive' });
    } finally {
      setIsPinLoading(false);
    }
  };

  const handleVerifyPinOtp = async () => {
    if (pinOtp.length !== 4) {
      toast({ title: 'Предупреждение', description: 'Введите 4-значный код', variant: 'destructive' });
      return;
    }
    setIsPinLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/transactions/check-pin-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: String(pinPhone), otpCode: String(pinOtp) }),
      });
      if (!response.ok) throw new Error('Неверный код');
      const data = await response.json();
      if (data.message === 'success') {
        setPinStep('pin-mode');
      } else {
        toast({ title: 'Ошибка', description: 'Неверный код подтверждения', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Неверный код или срок его действия истек', variant: 'destructive' });
    } finally {
      setIsPinLoading(false);
    }
  };

  const handleExecuteChangePin = async () => {
    if (pinMode === 'manual' && pinValue.length !== 4) {
      toast({ title: 'Предупреждение', description: 'ПИН должен состоять из 4 цифр', variant: 'destructive' });
      return;
    }
    setIsPinLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/transactions/generate-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardId: String(activeCardForPin.cardId),
          phoneNumber: String(pinPhone),
          pinDeliveryMethod: 'WS',
          pinValue: pinMode === 'manual' ? String(pinValue) : '',
        }),
      });
      if (!response.ok) throw new Error('Ошибка смены ПИН');
      toast({ title: 'Успешно', description: pinMode === 'generate' ? 'Новый ПИН-код успешно сгенерирован и отправлен СМС' : 'ПИН-код успешно изменен' });
      setActiveCardForPin(null);
      const activeClient = clients[selectedClientIndex];
      const code = activeClient?.client_code || activeClient?.ClientCode || activeClient?.Client?.Code || activeClient?.code;
      if (code) fetchClientData(code);
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось сменить ПИН-код', variant: 'destructive' });
    } finally {
      setIsPinLoading(false);
    }
  };

  const handleExecuteServices = async () => {
    if (!servicesPhone) {
      toast({ title: 'Предупреждение', description: 'Введите номер телефона', variant: 'destructive' });
      return;
    }
    setIsServicesLoading(true);

    const cardId = activeCardForServices.cardId;
    const initialServices = activeCardForServices.services || [];
    const smsService = initialServices.find((s: any) => s.identification?.serviceId === '300');
    const tdsService = initialServices.find((s: any) => s.identification?.serviceId === '330');

    const actions = [];

    // SMS
    if (smsService && !servicesSmsEnabled) {
      actions.push({
        serviceType: '7',
        serviceId: '300',
        serviceObjectType: 'SERVICE_OBJECT_CARD',
        actionCode: 'ACTION_CODE_DELETE',
        cardId,
        phoneNumber: servicesPhone,
      });
    } else if (!smsService && servicesSmsEnabled) {
      actions.push({
        serviceType: '7',
        serviceId: '300',
        serviceObjectType: 'SERVICE_OBJECT_CARD',
        actionCode: 'ACTION_CODE_ADD',
        cardId,
        phoneNumber: servicesPhone,
      });
    } else if (smsService && servicesSmsEnabled && smsService.extNumber !== servicesPhone) {
      actions.push({
        serviceType: '7',
        serviceId: '300',
        serviceObjectType: 'SERVICE_OBJECT_CARD',
        actionCode: 'ACTION_CODE_UPDATE',
        cardId,
        phoneNumber: servicesPhone,
      });
    }

    // 3DS
    if (tdsService && !servicesTdsEnabled) {
      actions.push({
        serviceType: '27',
        serviceId: '330',
        serviceObjectType: 'SERVICE_OBJECT_CARD',
        actionCode: 'ACTION_CODE_DELETE',
        cardId,
        phoneNumber: servicesPhone,
      });
    } else if (!tdsService && servicesTdsEnabled) {
      actions.push({
        serviceType: '27',
        serviceId: '330',
        serviceObjectType: 'SERVICE_OBJECT_CARD',
        actionCode: 'ACTION_CODE_ADD',
        cardId,
        phoneNumber: servicesPhone,
      });
    } else if (tdsService && servicesTdsEnabled && tdsService.extNumber !== servicesPhone) {
      actions.push({
        serviceType: '27',
        serviceId: '330',
        serviceObjectType: 'SERVICE_OBJECT_CARD',
        actionCode: 'ACTION_CODE_UPDATE',
        cardId,
        phoneNumber: servicesPhone,
      });
    }

    if (actions.length === 0) {
      setActiveCardForServices(null);
      setIsServicesLoading(false);
      return;
    }

    try {
      for (const action of actions) {
        const response = await fetch(`${SYSTEM_5012_URL}/api/Transactions/service-action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action),
        });
        if (!response.ok) throw new Error('Ошибка обновления сервиса');
      }
      toast({ title: 'Успешно', description: 'Сервисы успешно обновлены' });
      setActiveCardForServices(null);
      const activeClient = clients[selectedClientIndex];
      const code = activeClient?.client_code || activeClient?.ClientCode || activeClient?.Client?.Code || activeClient?.code;
      if (code) fetchClientData(code);
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось обновить сервисы', variant: 'destructive' });
    } finally {
      setIsServicesLoading(false);
    }
  };

  const accountColumns: ColumnDef<any>[] = [
    { accessorKey: 'Number', header: 'Номер счёта', cell: ({ row }) => <span className="font-mono">{row.getValue('Number')}</span> },
    { accessorKey: 'Balance', header: 'Баланс', cell: ({ row }) => <span className="font-semibold tabular-nums">{row.getValue('Balance')}</span> },
    { accessorKey: 'Currency.Code', header: 'Валюта', cell: ({ row }) => <Badge variant="outline">{row.original?.Currency?.Code}</Badge> },
    { accessorKey: 'Status.Name', header: 'Статус', cell: ({ row }) => <StatusBadge status={row.original?.Status?.Name === 'Открыт' ? 'active' : 'closed'} /> },
  ];

  const cardColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'cardId', 
      header: 'ID Карты',
      cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.cardId}</span>
    },
    { 
      accessorKey: 'CardNumber', 
      header: 'Номер карты',
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.CardNumber || row.original.details?.cardNumberMask || row.original.cardId || '-'}
        </span>
      )
    },
    { 
      accessorKey: 'CardTypeName', 
      header: 'Тип',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.CardTypeName || row.original.details?.cardTypeName || row.original.type || '-'}
        </span>
      )
    },
    { 
      accessorKey: 'statusName', 
      header: 'Статус АБС',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-normal">
          {row.original.statusName || '-'}
        </Badge>
      )
    },
    { 
      id: 'statusPc', 
      header: 'Статус ПЦ',
      cell: ({ row }) => {
        const desc = row.original.details?.statusDescription || '-';
        const hot = row.original.details?.hotCardStatus || '-';
        const isValid = desc.toLowerCase().includes('valid');
        return (
          <span className={`text-xs font-semibold ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
            {desc} ({hot})
          </span>
        );
      }
    },
    { 
      id: 'accounts', 
      header: 'Счета карты',
      cell: ({ row }) => {
        const accs = row.original.details?.accounts || [];
        if (accs.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="space-y-1">
            {accs.map((acc: any, i: number) => (
              <div key={i} className="font-mono text-xs text-muted-foreground border-b border-border/20 last:border-0 pb-0.5 last:pb-0">
                {acc.number}
              </div>
            ))}
          </div>
        );
      }
    },
    { 
      id: 'absBalances', 
      header: 'Остатки в АБС',
      cell: ({ row }) => {
        const accs = row.original.details?.accounts || [];
        if (accs.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="space-y-1 font-mono text-xs">
            {accs.map((acc: any, i: number) => {
              const absAcc = accounts.find((a: any) => a.Number === acc.number);
              return (
                <div key={i} className="border-b border-border/20 last:border-0 pb-0.5 last:pb-0 font-medium">
                  {absAcc ? `${Number(absAcc.Balance).toFixed(2)} ${absAcc.Currency?.Code || ''}` : '-'}
                </div>
              );
            })}
          </div>
        );
      }
    },
    { 
      id: 'pcBalances', 
      header: 'Остатки в ПЦ',
      cell: ({ row }) => {
        const accs = row.original.details?.accounts || [];
        if (accs.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="space-y-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {accs.map((acc: any, i: number) => {
              const currMap: Record<string, string> = {
                '972': 'TJS',
                '840': 'USD',
                '978': 'EUR',
              };
              return (
                <div key={i} className="border-b border-border/20 last:border-0 pb-0.5 last:pb-0">
                  {Number(acc.balance).toFixed(2)} {currMap[acc.currency] || acc.currency}
                </div>
              );
            })}
          </div>
        );
      }
    },
    { 
      id: 'pinDenial', 
      header: 'PIN ош.',
      cell: ({ row }) => {
        const counter = Number(row.original.details?.pinDenialCounter || 0);
        const hasError = counter >= 3;
        return (
          <span className={`font-mono font-bold ${hasError ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-muted-foreground'}`}>
            {counter}
          </span>
        );
      }
    },
    { 
      id: 'services', 
      header: 'Уведомления',
      cell: ({ row }) => {
        const svcs = row.original.services || [];
        const active = svcs.filter((s: any) => s.identification?.serviceId === '300' || s.identification?.serviceId === '330');
        if (active.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="space-y-1 text-xs">
            {active.map((s: any, i: number) => {
              const type = s.identification?.serviceId === '300' ? 'SMS' : '3DS';
              return (
                <div key={i} className="whitespace-nowrap font-mono text-muted-foreground flex items-center gap-1">
                  <span>{s.extNumber}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-muted/30">
                    {type}
                  </Badge>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => {
        const card = row.original;
        const pinError = Number(card.details?.pinDenialCounter || 0) >= 3;
        const activeClient = clients[selectedClientIndex];
        const clientId = activeClient?.client_code || activeClient?.code;
        return (
          <div className="flex flex-col gap-1 min-w-[150px]">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2 font-medium w-full"
              onClick={() => handleOpenServices(card)}
            >
              <Phone className="size-3 mr-1 shrink-0" /> Уведомления
            </Button>
            
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7 px-1 font-medium"
                onClick={() => navigate('transactions', { cardId: card.cardId, clientId })}
              >
                <History className="size-3 mr-0.5 shrink-0" /> Ист.
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="bg-slate-700 hover:bg-slate-800 text-white text-[11px] h-7 px-1 font-medium"
                onClick={() => window.open(`http://10.64.1.10/services/tariff_by_idn.php?idn=${card.cardId}`, '_blank')}
              >
                Тариф
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7 px-1 font-medium"
                onClick={() => handleOpenPin(card)}
              >
                <Key className="size-3 mr-0.5 shrink-0" /> ПИН
              </Button>

              {pinError ? (
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] h-7 px-1 font-medium"
                  onClick={() => handleResetPin(card.cardId)}
                >
                  <RefreshCw className="size-3 mr-0.5 shrink-0" /> Сброс
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7 px-1 font-medium"
                  onClick={() => navigate('limits', { cardId: card.cardId, clientId })}
                >
                  Лимит
                </Button>
              )}
            </div>

            {card.details?.hotCardStatus === '0' ? (
              <Button
                size="sm"
                className="bg-bank-red hover:bg-bank-red/90 text-white text-[11px] h-7 px-2 font-medium w-full"
                onClick={() => handleBlockCard(card.cardId)}
              >
                <Shield className="size-3 mr-1 shrink-0" /> Заблокировать
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] h-7 px-2 font-medium w-full"
                onClick={() => handleUnblockCard(card.cardId)}
              >
                <Unlock className="size-3 mr-1 shrink-0" /> Разблокировать
              </Button>
            )}
          </div>
        );
      }
    }
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

      {/* ── Services Modal ── */}
      {activeCardForServices && (
        <Dialog open={!!activeCardForServices} onOpenChange={(open) => !open && setActiveCardForServices(null)}>
          <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-2xl border border-slate-200">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-bold flex items-center text-slate-800">
                <Phone className="size-5 mr-2 text-emerald-600 animate-pulse" /> Уведомления по карте
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Подключение или отключение SMS/3DS уведомлений для карты {activeCardForServices.CardNumber || activeCardForServices.details?.cardNumberMask || activeCardForServices.cardId}
              </DialogDescription>
            </DialogHeader>

            {isServicesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent" />
                <p className="text-slate-500 text-sm font-medium">Обновление сервисов...</p>
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                      servicesTab === 'sms'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    onClick={() => setServicesTab('sms')}
                  >
                    СМС
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                      servicesTab === '3ds'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    onClick={() => setServicesTab('3ds')}
                  >
                    3DS
                  </button>
                </div>

                <div className="text-sm text-slate-650 font-medium">
                  {servicesTab === 'sms' ? 'СМС - уведомление об операциях' : '3DS - уведомление об операциях'}
                </div>

                {/* Input row */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-slate-500">Номер телефона</Label>
                    <Input
                      type="text"
                      value={servicesPhone}
                      onChange={(e) => setServicesPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="992XXXXXXXXX"
                      className="h-11 text-base font-mono bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Состояние услуги</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={servicesTab === 'sms' ? servicesSmsEnabled : servicesTdsEnabled}
                        onChange={(e) => {
                          if (servicesTab === 'sms') {
                            setServicesSmsEnabled(e.target.checked);
                          } else {
                            setServicesTdsEnabled(e.target.checked);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="border-t pt-4 mt-6">
              <Button variant="outline" onClick={() => setActiveCardForServices(null)} disabled={isServicesLoading}>
                Отмена
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 font-semibold"
                onClick={handleExecuteServices}
                disabled={isServicesLoading || !servicesPhone}
              >
                Выполнить
              </Button>
            </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* ── Change Pin Modal ── */}
      {activeCardForPin && (
        <Dialog open={!!activeCardForPin} onOpenChange={(open) => !open && setActiveCardForPin(null)}>
          <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-2xl border border-slate-200">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-bold flex items-center text-slate-800">
                <Key className="size-5 mr-2 text-rose-600 animate-pulse" /> Сменить ПИН-код
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Смена ПИН-кода для карты {activeCardForPin.CardNumber || activeCardForPin.details?.cardNumberMask || activeCardForPin.cardId}
              </DialogDescription>
            </DialogHeader>

            {isPinLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-600 border-t-transparent" />
                <p className="text-slate-500 text-sm font-medium">Выполнение операции...</p>
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                {pinStep === 'otp-request' && (
                  <>
                    <p className="text-sm text-slate-650 leading-relaxed">
                      Для смены ПИН-кода необходимо подтверждение по СМС. Код подтверждения будет отправлен на указанный номер.
                    </p>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500">Номер телефона клиента</Label>
                      <Input
                        type="text"
                        value={pinPhone}
                        onChange={(e) => setPinPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="992XXXXXXXXX"
                        className="h-11 text-base font-mono bg-white"
                      />
                    </div>
                    <Button
                      className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
                      onClick={handleSendPinOtp}
                      disabled={!pinPhone || pinPhone.length < 9}
                    >
                      Отправить код
                    </Button>
                  </>
                )}

                {pinStep === 'otp-verify' && (
                  <>
                    <p className="text-sm text-slate-650 leading-relaxed">
                      СМС с кодом отправлено на номер <strong className="font-mono text-slate-850">{pinPhone}</strong>
                    </p>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500">Код подтверждения</Label>
                      <Input
                        type="text"
                        maxLength={4}
                        value={pinOtp}
                        onChange={(e) => setPinOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="XXXX"
                        className="h-12 text-center text-xl font-bold tracking-[8px] font-mono bg-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-11 font-semibold"
                        onClick={() => setPinStep('otp-request')}
                      >
                        Назад
                      </Button>
                      <Button
                        className="flex-[2] h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                        onClick={handleVerifyPinOtp}
                        disabled={pinOtp.length !== 4}
                      >
                        Подтвердить
                      </Button>
                    </div>
                  </>
                )}

                {pinStep === 'pin-mode' && (
                  <>
                    {/* Toggle Mode */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                          pinMode === 'generate'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        onClick={() => setPinMode('generate')}
                      >
                        Сгенерировать ПИН
                      </button>
                      <button
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                          pinMode === 'manual'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        onClick={() => setPinMode('manual')}
                      >
                        Задать вручную
                      </button>
                    </div>

                    {pinMode === 'generate' ? (
                      <div className="py-4 text-center">
                        <p className="text-sm text-slate-500 font-medium font-sans">Новый сгенерированный ПИН-код придет в виде СМС клиенту</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-rose-500 font-semibold font-sans">Передайте клавиатуру клиенту, чтобы он установил ПИН</p>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-500">Новый ПИН-код</Label>
                          <Input
                            type="password"
                            maxLength={4}
                            value={pinValue}
                            onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                            placeholder="••••"
                            className="h-12 text-center text-2xl font-bold tracking-[10px] bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
                      onClick={handleExecuteChangePin}
                      disabled={pinMode === 'manual' && pinValue.length !== 4}
                    >
                      Выполнить
                    </Button>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

    </PageContainer>
  );
}
