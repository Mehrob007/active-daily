import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card as CardUI, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { AccountsTable } from './AccountsTable';
import { CardsTable } from './CardsTable';
import { CreditsTable } from './CreditsTable';
import { DepositsTable } from './DepositsTable';
import { ServicesModal } from './modals/ServicesModal';
import { PinChangeModal } from './modals/PinChangeModal';
import { CardLimitsModal } from './modals/CardLimitsModal';
import { GraphModal } from './modals/GraphModal';
import { CreditDetailsView } from './views/CreditDetailsView';
import { DepositDetailsModal } from './modals/DepositDetailsModal';
import { RepayModal } from './modals/RepayModal';
import { DocumentsModal } from './modals/DocumentsModal';
import { BlockCardModal } from './modals/BlockCardModal';
import { Client, Account, Card, Credit, Deposit } from '../types';
import { absService } from '../services/abs-service';
import { toast } from '@/hooks/use-toast';

interface ClientTabsProps {
  client: Client;
  accounts: Account[];
  cards: Card[];
  credits: Credit[];
  deposits: Deposit[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const ClientTabs: React.FC<ClientTabsProps> = ({
  client,
  accounts,
  cards,
  credits,
  deposits,
  isLoading,
  onRefresh,
}) => {

  const [activeCardForServices, setActiveCardForServices] = useState<Card | null>(null);
  const [activeCardForPin, setActiveCardForPin] = useState<Card | null>(null);
  const [activeCardForLimits, setActiveCardForLimits] = useState<string | null>(null);
  const [activeCreditForGraph, setActiveCreditForGraph] = useState<string | null>(null);
  const [activeCreditForDetails, setActiveCreditForDetails] = useState<Credit | null>(null);
  const [activeDepositForDetails, setActiveDepositForDetails] = useState<Deposit | null>(null);
  const [activeCreditForRepay, setActiveCreditForRepay] = useState<Credit | null>(null);
  const [activeInnForDocs, setActiveInnForDocs] = useState<string | null>(null);
  const [activeCardForBlock, setActiveCardForBlock] = useState<string | null>(null);

  const handleUnblockCard = async (cardId: string) => {
    try {
      await absService.unblockCard(cardId);
      toast({ title: 'Успешно', description: 'Карта успешно разблокирована' });
      onRefresh();
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось разблокировать карту', variant: 'destructive' });
    }
  };

  const handleResetPin = async (cardId: string) => {
    try {
      await absService.resetPinCounter(cardId);
      toast({ title: 'Успешно', description: 'Счетчик попыток ПИН-кода успешно сброшен' });
      onRefresh();
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось сбросить счетчик ПИН', variant: 'destructive' });
    }
  };

  const clientInfoData = [
    { label: "Телефон", value: client.phone_number || client.Phone || client.phone },
    { label: "Тип клиента", value: client.client_type_name },
    { label: "Код департамента", value: client.dep_code },
    { label: "Код клиента в АБС", value: client.client_code || client.ClientCode || client.code },
    { label: "Фамилия", value: client.surname || client.last_name },
    { label: "Имя", value: client.name || client.first_name },
    { label: "Отчество", value: client.patronymic || client.middle_name },
    { label: "ИНН", value: client.tax_code || client.Inn },
    { label: "Тип документа", value: client.identdoc_name },
    { label: "Серия документа", value: client.identdoc_series },
    { label: "Номер документа", value: client.identdoc_num },
    { label: "Дата выдачи", value: client.identdoc_date },
    { label: "Кем выдан", value: client.identdoc_orgname },
    { label: "SV ID", value: client.sv_id },
  ].filter(item => item.value);

  if (activeCreditForDetails) {
    return (
      <CreditDetailsView 
        credit={activeCreditForDetails} 
        onBack={() => setActiveCreditForDetails(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setActiveInnForDocs(client.tax_code || client.Inn || null)}>
          <FileText className="size-4 mr-2" /> Документы
        </Button>
        <Button variant="outline" size="sm">
          <Download className="size-4 mr-2" /> Экспорт
        </Button>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="accounts">Счета ({accounts.length})</TabsTrigger>
          <TabsTrigger value="cards">Карты ({cards.length})</TabsTrigger>
          <TabsTrigger value="credits">Кредиты ({credits.length})</TabsTrigger>
          <TabsTrigger value="deposits">Депозиты ({deposits.length})</TabsTrigger>
          <TabsTrigger value="details">Инфо</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Загрузка данных...</div>
          ) : (
            <>
              <TabsContent value="accounts">
                <AccountsTable data={accounts} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="cards">
                <CardsTable 
                  data={cards} 
                  accounts={accounts}
                  isLoading={isLoading} 
                  onOpenServices={setActiveCardForServices}
                  onOpenPin={setActiveCardForPin}
                  onOpenLimits={(card) => setActiveCardForLimits(card.cardId)}
                  onBlockCard={(cardId) => setActiveCardForBlock(cardId)}
                  onUnblockCard={handleUnblockCard}
                  onResetPin={handleResetPin}
                  clientId={client.client_code || client.code}
                />
              </TabsContent>
              <TabsContent value="credits">
                <CreditsTable 
                  data={credits} 
                  isLoading={isLoading} 
                  onOpenGraph={setActiveCreditForGraph}
                  onOpenDetails={setActiveCreditForDetails}
                  onOpenRepay={setActiveCreditForRepay}
                />
              </TabsContent>
              <TabsContent value="deposits">
                <DepositsTable data={deposits} isLoading={isLoading} onOpenDetails={setActiveDepositForDetails} />
              </TabsContent>
              <TabsContent value="details">
                <CardUI>
                  <CardHeader>
                    <CardTitle className="text-sm">Персональная информация</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      {clientInfoData.map((item, idx) => (
                        <div key={idx} className="flex flex-col border-b border-border/40 pb-2">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.label}</span>
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CardUI>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      {}
      <ServicesModal 
        card={activeCardForServices} 
        onClose={() => setActiveCardForServices(null)} 
        onRefresh={onRefresh} 
      />
      <PinChangeModal 
        card={activeCardForPin} 
        onClose={() => setActiveCardForPin(null)} 
        onRefresh={onRefresh} 
      />
      <CardLimitsModal 
        cardId={activeCardForLimits} 
        onClose={() => setActiveCardForLimits(null)} 
      />
      <GraphModal 
        referenceId={activeCreditForGraph} 
        onClose={() => setActiveCreditForGraph(null)} 
      />
      <DepositDetailsModal 
        deposit={activeDepositForDetails} 
        onClose={() => setActiveDepositForDetails(null)} 
      />
      <RepayModal 
        credit={activeCreditForRepay} 
        accounts={accounts} 
        onClose={() => setActiveCreditForRepay(null)} 
        onRefresh={onRefresh} 
      />
      <DocumentsModal 
        inn={activeInnForDocs} 
        onClose={() => setActiveInnForDocs(null)} 
      />
      <BlockCardModal
        cardId={activeCardForBlock}
        onClose={() => setActiveCardForBlock(null)}
        onRefresh={onRefresh}
      />
    </div>
  );
};
