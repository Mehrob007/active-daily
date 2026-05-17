import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { absService } from '../../services/abs-service';
import { toast } from '@/hooks/use-toast';
import { Card } from '../../types';

interface ServicesModalProps {
  card: Card | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({
  card,
  onClose,
  onRefresh,
}) => {
  const [servicesPhone, setServicesPhone] = useState('');
  const [servicesSmsEnabled, setServicesSmsEnabled] = useState(false);
  const [servicesTdsEnabled, setServicesTdsEnabled] = useState(false);
  const [servicesTab, setServicesTab] = useState<'sms' | '3ds'>('sms');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (card) {
      const sms = card.services?.find((s: any) => s.identification?.serviceId === '300');
      const tds = card.services?.find((s: any) => s.identification?.serviceId === '330');
      setServicesSmsEnabled(!!sms);
      setServicesTdsEnabled(!!tds);
      setServicesPhone(sms?.extNumber || tds?.extNumber || '');
      setServicesTab('sms');
    }
  }, [card]);

  const handleExecute = async () => {
    if (!card || !servicesPhone) return;
    setIsLoading(true);

    const cardId = card.cardId;
    const initialServices = card.services || [];
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
      onClose();
      setIsLoading(false);
      return;
    }

    try {
      for (const action of actions) {
        await absService.executeServiceAction(action);
      }
      toast({ title: 'Успешно', description: 'Сервисы успешно обновлены' });
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось обновить сервисы', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-2xl border border-slate-200">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center text-slate-800">
            <Phone className="size-5 mr-2 text-emerald-600 animate-pulse" /> Уведомления по карте
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">
            Подключение или отключение SMS/3DS уведомлений для карты {card?.CardNumber || card?.details?.cardNumberMask || card?.cardId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent" />
            <p className="text-slate-500 text-sm font-medium">Обновление сервисов...</p>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
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
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 font-semibold"
            onClick={handleExecute}
            disabled={isLoading || !servicesPhone}
          >
            Выполнить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
