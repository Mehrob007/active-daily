import React from 'react';
import { Card as CardType, Account } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigationStore } from '@/stores/navigation-store';

interface CardItemProps {
  card: CardType;
  accounts: Account[];
  onOpenServices: (card: CardType) => void;
  onOpenPin: (card: CardType) => void;
  onOpenLimits: (card: CardType) => void;
  onBlockCard: (cardId: string) => void;
  onUnblockCard: (cardId: string) => void;
  onResetPin: (cardId: string) => void;
  clientId?: string;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  accounts,
  onOpenServices,
  onOpenPin,
  onOpenLimits,
  onBlockCard,
  onUnblockCard,
  onResetPin,
  clientId,
}) => {
  const navigate = useNavigationStore((state) => state.navigate);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Скопировано', description: 'Номер успешно скопирован' });
  };

  const absStatus = card.statusName || '-';
  const pcStatusDesc = card.details?.statusDescription || '-';
  const isPcValid = pcStatusDesc.toLowerCase().includes('valid');

  const svcs = card.services || [];
  const smsService = svcs.find((s: any) => s.identification?.serviceId === '300');
  const tdsService = svcs.find((s: any) => s.identification?.serviceId === '330');

  const pinDenial = Number(card.details?.pinDenialCounter || 0);
  const isPinBlocked = pinDenial >= 3;
  
  const hotCardStatus = card.details?.hotCardStatus || '0';
  const isHotCardBlocked = hotCardStatus !== '0' && hotCardStatus !== '17';

  const isMuted = isPinBlocked || isHotCardBlocked;

  const cardType = card.cardTypeDisplay || card.CardTypeName || card.details?.cardTypeName || card.type || 'Корти Милли';
  const cardNumber = card.CardNumber || card.details?.cardNumberMask || card.cardId || '-';

  let expiry = '12/26'; // Placeholder or fallback

  return (
    <Card className="rounded-[32px] p-6 bg-white border-none shadow-sm flex flex-col gap-6 w-full max-w-4xl mx-auto mb-6">
      {/* Top Badges Row */}
      <div className="flex flex-wrap gap-2">
        <Badge className={`px-3 py-1 rounded-full text-xs font-medium border-none ${isMuted ? 'bg-[#439655]/30 text-white/60' : 'bg-[#439655] text-white'}`}>
          {absStatus} (АБС)
        </Badge>
        <Badge className={`px-3 py-1 rounded-full text-xs font-medium border-none ${isHotCardBlocked ? 'bg-[#ef4444] text-white' : (isPcValid ? (isMuted ? 'bg-[#439655]/30 text-white/60' : 'bg-[#439655] text-white') : (isMuted ? 'bg-slate-400/30 text-white/60' : 'bg-slate-400 text-white'))}`}>
          {isHotCardBlocked ? 'Операции запрещены (ПЦ)' : `${pcStatusDesc} (ПЦ)`}
        </Badge>
        {smsService ? (
          <Badge className={`px-3 py-1 rounded-full text-xs font-medium border-none ${isMuted ? 'bg-[#439655]/30 text-white/60' : 'bg-[#439655] text-white'}`}>
            СМС - {smsService.extNumber}
          </Badge>
        ) : (
          <Badge className={`px-3 py-1 rounded-full text-xs font-medium border-none ${isMuted ? 'bg-[#facc15]/30 text-black/50' : 'bg-[#facc15] text-black'}`}>
            СМС - не подключен
          </Badge>
        )}
        {tdsService ? (
          <Badge className={`px-3 py-1 rounded-full text-xs font-medium border-none ${isMuted ? 'bg-[#439655]/30 text-white/60' : 'bg-[#439655] text-white'}`}>
            3DS - {tdsService.extNumber}
          </Badge>
        ) : (
          <Badge className={`px-3 py-1 rounded-full text-xs font-medium border-none ${isMuted ? 'bg-[#facc15]/30 text-black/50' : 'bg-[#facc15] text-black'}`}>
            3DS - не подключен
          </Badge>
        )}
        <Badge className={`px-3 py-1 rounded-full text-xs font-medium border-none ${isPinBlocked ? 'bg-[#b91c1c] text-white' : (isMuted ? 'bg-[#439655]/30 text-white/60' : 'bg-[#439655] text-white')}`}>
          PIN - {pinDenial}
        </Badge>
      </div>

      <div className={`transition-opacity duration-300 ${isMuted ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Card Info Row */}
        <div className="flex items-center gap-6">
          {/* Card Graphic */}
          <div className="w-[200px] h-[120px] rounded-xl bg-gradient-to-tr from-orange-400 to-amber-500 flex flex-col justify-between p-4 text-white shadow-md relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="font-bold text-lg relative z-10">{cardType}</div>
            <div className="flex justify-between items-end relative z-10">
              <div className="font-mono text-sm opacity-90">•••• {cardNumber.slice(-4)}</div>
              <div className="text-xs">A</div>
            </div>
          </div>

          {/* Text Info */}
          <div className="flex-1 space-y-1">
            <div className="text-xl font-bold text-slate-800">{cardType}</div>
            <div className="text-lg font-mono text-slate-600">{cardNumber}</div>
            <div className="text-md text-slate-400">{expiry}</div>
          </div>

          {/* IDN */}
          <div className="text-right self-start">
            <span className="text-sm text-slate-500">IDN карты: </span>
            <span className="text-base font-semibold text-slate-800">{card.cardId}</span>
          </div>
        </div>

        {/* Accounts Table Section */}
        {card.details?.accounts && card.details.accounts.length > 0 && (
          <div className="mt-6 w-full">
            <div className="grid grid-cols-12 gap-4 pb-2 border-b border-slate-100 text-sm font-semibold text-slate-500">
              <div className="col-span-5">Счета:</div>
              <div className="col-span-3">Баланс в АБС</div>
              <div className="col-span-2">Баланс в ПЦ</div>
              <div className="col-span-2"></div>
            </div>
            
            <div className="space-y-3 mt-3">
              {card.details.accounts.map((acc, i) => {
                const absAcc = accounts.find((a: any) => a.Number === acc.number);
                
                const currMap: Record<string, string> = { '972': 'TJS', '840': 'USD', '978': 'EUR' };
                const pcCurr = currMap[acc.currency] || acc.currency;
                const absCurr = absAcc?.Currency?.Code || '';

                const getCurrencyColor = (c: string) => {
                  if (c === 'TJS') return 'text-[#439655]'; // Green
                  if (c === 'USD') return 'text-[#ef4444]'; // Red
                  if (c === 'EUR') return 'text-[#3b82f6]'; // Blue
                  return 'text-slate-800';
                };

                return (
                  <div key={i} className="grid grid-cols-12 gap-4 items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    {/* Account Number */}
                    <div className="col-span-5 flex items-center gap-2 font-mono text-base text-slate-800">
                      {acc.number}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400" onClick={() => handleCopy(acc.number)}>
                        <Copy className="size-3" />
                      </Button>
                    </div>
                    
                    {/* ABS Balance */}
                    <div className="col-span-3 font-medium text-base text-slate-800">
                      {absAcc ? Number(absAcc.Balance).toFixed(2) : '-'} <span className={getCurrencyColor(absCurr)}>{absCurr}</span>
                    </div>

                    {/* PC Balance */}
                    <div className="col-span-2 font-medium text-base text-slate-800">
                      {Number(acc.balance).toFixed(2)} <span className={getCurrencyColor(pcCurr)}>{pcCurr}</span>
                    </div>

                    {/* Action */}
                    <div className="col-span-2 text-right">
                      <Button variant="secondary" size="sm" className="bg-slate-200/50 hover:bg-slate-200 text-slate-700 text-xs rounded-full">
                        Перейти к счету
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
        {hotCardStatus === '0' ? (
          <Button variant="secondary" className={`rounded-full ${isMuted ? 'bg-slate-100/50 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} onClick={() => onBlockCard(card.cardId)}>
            Заблокировать
          </Button>
        ) : (
          <Button variant="outline" className={`rounded-full ${isHotCardBlocked ? 'border-[#b91c1c] text-[#b91c1c] hover:bg-red-50 font-medium' : (isMuted ? 'bg-slate-100/50 text-slate-500 border-none' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-none')}`} onClick={() => onUnblockCard(card.cardId)}>
            Разблокировать
          </Button>
        )}
        
        {pinDenial >= 3 && (
          <Button variant="outline" className="border-[#b91c1c] text-[#b91c1c] hover:bg-red-50 rounded-full font-medium" onClick={() => onResetPin(card.cardId)}>
            Сбросить PIN
          </Button>
        )}

        <Button variant="secondary" className={`rounded-full ${isMuted ? 'bg-slate-100/50 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} onClick={() => onOpenLimits(card)}>
          Лимиты
        </Button>
        <Button variant="secondary" className={`rounded-full ${isMuted ? 'bg-slate-100/50 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} onClick={() => window.open(`http://10.64.1.10/services/tariff_by_idn.php?idn=${card.cardId}`, '_blank')}>
          Тарифы
        </Button>
        <Button variant="secondary" className={`rounded-full ${isMuted ? 'bg-slate-100/50 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} onClick={() => navigate('transactions', { cardId: card.cardId, clientId })}>
          История
        </Button>
        <Button variant="secondary" className={`rounded-full ${isMuted ? 'bg-slate-100/50 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} onClick={() => navigate('transactions', { cardId: card.cardId, clientId })}>
          Выписка
        </Button>
        <Button variant="secondary" className={`rounded-full ${isMuted ? 'bg-slate-100/50 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} onClick={() => onOpenServices(card)}>
          Уведомления
        </Button>
        <Button variant="secondary" className={`rounded-full ${isMuted ? 'bg-slate-100/50 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
          Скачать реквизиты
        </Button>
      </div>
    </Card>
  );
};

