import React from 'react';
import { Card, Account } from '../types';
import { CardItem } from './CardItem';

interface CardsTableProps {
  data: Card[];
  accounts: Account[];
  isLoading: boolean;
  onOpenServices: (card: Card) => void;
  onOpenPin: (card: Card) => void;
  onOpenLimits: (card: Card) => void;
  onBlockCard: (cardId: string) => void;
  onUnblockCard: (cardId: string) => void;
  onResetPin: (cardId: string) => void;
  clientId?: string;
}

export const CardsTable: React.FC<CardsTableProps> = ({
  data,
  accounts,
  isLoading,
  onOpenServices,
  onOpenPin,
  onOpenLimits,
  onBlockCard,
  onUnblockCard,
  onResetPin,
  clientId,
}) => {
  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground">Загрузка карт...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-muted-foreground">У клиента нет карт</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {data.map((card) => (
        <CardItem
          key={card.cardId}
          card={card}
          accounts={accounts}
          onOpenServices={onOpenServices}
          onOpenPin={onOpenPin}
          onOpenLimits={onOpenLimits}
          onBlockCard={onBlockCard}
          onUnblockCard={onUnblockCard}
          onResetPin={onResetPin}
          clientId={clientId}
        />
      ))}
    </div>
  );
};
