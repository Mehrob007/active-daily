import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
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

interface PinChangeModalProps {
  card: Card | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const PinChangeModal: React.FC<PinChangeModalProps> = ({
  card,
  onClose,
  onRefresh,
}) => {
  const [pinStep, setPinStep] = useState<'otp-request' | 'otp-verify' | 'pin-mode'>('otp-request');
  const [pinMode, setPinMode] = useState<'generate' | 'manual'>('generate');
  const [pinPhone, setPinPhone] = useState('');
  const [pinOtp, setPinOtp] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setPinStep('otp-request');
      setPinMode('generate');
      setPinOtp('');
      setPinValue('');
      const sms = card.services?.find((s: any) => s.identification?.serviceId === '300');
      const tds = card.services?.find((s: any) => s.identification?.serviceId === '330');
      setPinPhone(sms?.extNumber || tds?.extNumber || '');
    }
  }, [card]);

  const handleSendOtp = async () => {
    if (!pinPhone) return;
    setIsLoading(true);
    try {
      await absService.sendPinOtp(pinPhone);
      setPinStep('otp-verify');
      toast({ title: 'Успешно', description: 'СМС с кодом подтверждения отправлено' });
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить код подтверждения', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (pinOtp.length !== 4) return;
    setIsLoading(true);
    try {
      const data = await absService.verifyPinOtp(pinPhone, pinOtp);
      if (data.message === 'success') {
        setPinStep('pin-mode');
      } else {
        toast({ title: 'Ошибка', description: 'Неверный код подтверждения', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Неверный код или срок его действия истек', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!card) return;
    if (pinMode === 'manual' && pinValue.length !== 4) return;
    setIsLoading(true);
    try {
      await absService.generatePin(card.cardId, pinPhone, pinMode === 'manual' ? pinValue : '');
      toast({ title: 'Успешно', description: pinMode === 'generate' ? 'Новый ПИН-код успешно сгенерирован и отправлен СМС' : 'ПИН-код успешно изменен' });
      onRefresh();
      onClose();
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось сменить ПИН-код', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-2xl border border-slate-200">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center text-slate-800">
            <Key className="size-5 mr-2 text-rose-600 animate-pulse" /> Сменить ПИН-код
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">
            Смена ПИН-кода для карты {card?.CardNumber || card?.details?.cardNumberMask || card?.cardId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
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
                  onClick={handleSendOtp}
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
                    onClick={handleVerifyOtp}
                    disabled={pinOtp.length !== 4}
                  >
                    Подтвердить
                  </Button>
                </div>
              </>
            )}

            {pinStep === 'pin-mode' && (
              <>
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
                  onClick={handleExecute}
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
  );
};
