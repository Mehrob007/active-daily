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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Досрочное погашение кредита</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Счет для списания</Label>
            <Select onValueChange={setSelectedAccount}>
              <SelectTrigger>
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
            <Label>Сумма погашения ({credit?.currency})</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={handleRepay} disabled={isLoading || !amount || !selectedAccount}>
            {isLoading ? 'Выполнение...' : 'Погасить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
