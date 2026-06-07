import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loanSoapService } from '../../services/loan-service';
import { toast } from '@/hooks/use-toast';
import { Credit, Account } from '../../types';

interface RepayModalProps {
  credit: Credit | null;
  accounts: Account[];
  onClose: () => void;
  onRefresh: () => void;
}

export const RepayModal: React.FC<RepayModalProps> = ({
  credit,
  accounts,
  onClose,
  onRefresh,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRepay = async () => {
    if (!credit || !amount || !selectedAccount) return;
    setIsLoading(true);
    try {
      await loanSoapService.repayLoan({
        referenceId: credit.referenceId,
        sourceOrdNum: selectedAccount,
        amount: Number(amount),
      });
      toast({ title: 'Успешно', description: 'Запрос на погашение отправлен' });
      onRefresh();
      onClose();
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось выполнить погашение', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!credit} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl gap-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Погасить кредит</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Счет для списания:</Label>
            <Select onValueChange={setSelectedAccount}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Выберите счет" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.Number} value={acc.Number}>
                    {acc.Number} ({acc.Balance} {acc.Currency?.Code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Тип погашения</Label>
            <Select defaultValue="od" disabled>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 text-slate-700">
                <SelectValue placeholder="Частично (Основной долг)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="od">Частично (Основной долг)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Сумма</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Введите сумму"
              className="h-12 rounded-xl"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start pt-2">
          <Button 
            className="w-full bg-[#b91c1c] hover:bg-[#b91c1c]/90 text-white h-12 text-base font-bold rounded-xl"
            onClick={handleRepay} 
            disabled={isLoading || !amount || !selectedAccount}
          >
            {isLoading ? 'Выполнение...' : 'Погасить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
