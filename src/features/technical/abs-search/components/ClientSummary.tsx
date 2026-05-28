import React from 'react';
import { User, Hash, Phone, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Client, TelegramUser } from '../types';

interface ClientSummaryProps {
  client: Client;
  telegramData: TelegramUser | null;
  isTelegramLoading: boolean;
  onDeleteTelegram: (phone: string) => void;
}

export const ClientSummary: React.FC<ClientSummaryProps> = ({
  client,
  telegramData,
  isTelegramLoading,
  onDeleteTelegram,
}) => {
  const name = client.first_name 
    ? `${client.last_name || ''} ${client.first_name} ${client.middle_name || ''}` 
    : (client.Client?.Name || 'Неизвестно');

  const code = client.client_code || client.ClientCode || client.Client?.Code || client.code;
  const phone = client.phone_number || client.Phone || client.phone || 'Неизвестно';
  const inn = client.tax_code || client.Inn || 'Неизвестно';

  return (
    <div className="rounded-lg border border-border/60 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-bank-active">
            <User className="size-6 text-bank-red" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground font-mono">Код: {code}</p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center">
            <Send className="size-4 text-sky-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Telegram Status</span>
            {isTelegramLoading ? (
              <span className="text-xs text-muted-foreground">Загрузка...</span>
            ) : telegramData ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-sky-700">{telegramData.telegramId}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => onDeleteTelegram(phone)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Не привязан</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
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
        {client.client_type_name && (
          <div className="flex items-center gap-3">
            <User className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Тип клиента</p>
              <p className="text-sm font-medium">{client.client_type_name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
