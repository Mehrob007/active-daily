import { useState, useCallback, useEffect } from 'react';
import { absService } from '../services/abs-service';
import { Client, Account, Card, Credit, Deposit, TelegramUser } from '../types';
import { toast } from '@/hooks/use-toast';

export const TYPE_SEARCH_CLIENT = [
  { value: "client/info?phoneNumber=", label: "Поиск по Номеру телефона", type: "phone" },
  { value: "client/info/client-index?clientIndex=", label: "Поиск по Коду клиента", type: "code" },
  { value: "client/info/inn?inn=", label: "Поиск по ИНН", type: "inn" },
];

export function useAbsSearch() {
  const [searchType, setSearchType] = useState(TYPE_SEARCH_CLIENT[0].value);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [telegramData, setTelegramData] = useState<TelegramUser | null>(null);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);

  const fetchClientData = useCallback(async (clientCode: string) => {
    if (!clientCode) return;
    setIsLoadingDetails(true);
    try {
      const [accData, cardDataRaw, credData, depData] = await Promise.all([
        absService.getAccounts(clientCode),
        absService.getCards(clientCode),
        absService.getCredits(clientCode),
        absService.getDeposits(clientCode),
      ]);

      let cardData = Array.isArray(cardDataRaw) ? cardDataRaw : [];

      if (cardData.length > 0) {
        cardData = await Promise.all(
          cardData.map(async (card: any) => {
            try {
              const [details, services] = await Promise.all([
                absService.getCardDetails(card.cardId),
                absService.getCardServices(card.cardId),
              ]);

              if (details?.accounts && Array.isArray(details.accounts)) {
                details.accounts = details.accounts.map((acc: any) => ({
                  ...acc,
                  balance: acc.balance ? Number(acc.balance) / 100 : 0,
                }));
              }

              const absType = details?.cardTypeName || card.CardTypeName || "";
              const pcType = card.type || "";
              const displayType = pcType ? `${absType} (${pcType})` : absType;

              return {
                ...card,
                details,
                services,
                cardTypeDisplay: displayType
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
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    setClients([]);
    setAccounts([]);
    setCards([]);
    setCredits([]);
    setDeposits([]);
    setTelegramData(null);

    try {
      const formattedQuery = searchQuery.trim().replace(/\D/g, "");
      const data = await absService.searchClients(searchType, formattedQuery);

      let normalizedData: Client[] = [];

      if (Array.isArray(data)) {
        normalizedData = data;
      } else if (data && typeof data === 'object') {
        if (data.client_code || data.ClientCode || data.code || data.Client?.Code) {
          normalizedData = [data];
        } else if (Array.isArray(data.data)) {
          normalizedData = data.data;
        } else if (data.clients && Array.isArray(data.clients)) {
          normalizedData = data.clients;
        }
      }

      if (normalizedData.length > 0) {
        setClients(normalizedData);
        setSelectedClientIndex(0);

        const firstClient = normalizedData[0];
        const phone = firstClient.phone_number || firstClient.Phone || firstClient.phone;
        if (phone) {
          fetchTelegramData(phone);
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
  }, [searchQuery, searchType]);

  useEffect(() => {
    const activeClient = clients[selectedClientIndex];
    if (activeClient) {
      const code = activeClient.client_code || activeClient.ClientCode || activeClient.Client?.Code || activeClient.code;
      if (code) {
        fetchClientData(code);
      }

      const phone = activeClient.phone_number || activeClient.Phone || activeClient.phone;
      if (phone) {
        fetchTelegramData(phone);
      }
    }
  }, [clients, selectedClientIndex, fetchClientData]);

  const fetchTelegramData = async (phone: string) => {
    setIsTelegramLoading(true);
    try {
      const data = await absService.getTelegramUser(phone);
      setTelegramData(data);
    } catch (err) {
      console.error("Telegram fetch error", err);
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const deleteTelegramId = async (phone: string) => {
    try {
      await absService.deleteTelegramId(phone);
      setTelegramData(null);
      toast({ title: 'Успешно', description: 'Telegram ID успешно удалён' });
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить Telegram ID', variant: 'destructive' });
    }
  };

  const refreshClientData = useCallback(() => {
    const activeClient = clients[selectedClientIndex];
    if (!activeClient) return;
    const code = activeClient.client_code || activeClient.ClientCode || activeClient.Client?.Code || activeClient.code;
    if (code) fetchClientData(code);
  }, [clients, selectedClientIndex, fetchClientData]);

  return {
    searchType,
    setSearchType,
    searchQuery,
    setSearchQuery,
    isSearching,
    hasSearched,
    clients,
    selectedClientIndex,
    setSelectedClientIndex,
    accounts,
    cards,
    credits,
    deposits,
    isLoadingDetails,
    telegramData,
    isTelegramLoading,
    handleSearch,
    refreshClientData,
    deleteTelegramId,
  };
}
