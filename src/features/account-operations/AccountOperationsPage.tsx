"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { 
  fetchAccountOperations, 
  sendExportOtp, 
  verifyExportOtp, 
  OperationTransaction 
} from './services/account-operations-service';
import { exportAccountOperationsToExcel } from './utils/export-utils';
import { AccountOperationsTable } from './components/AccountOperationsTable';
import { OtpVerificationModal } from './components/OtpVerificationModal';

export const AccountOperationsPage = () => {
  const searchParams = useSearchParams();
  const initialAccount = searchParams.get('account') || '';
  const { toast } = useToast();

  const [displayAccountNumber, setDisplayAccountNumber] = useState(initialAccount);
  const [accountNumber, setAccountNumber] = useState(initialAccount.replace(/\s/g, ''));
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [transactions, setTransactions] = useState<OperationTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Set default dates (last 30 days) on mount
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    
    setFromDate(formatDate(thirtyDaysAgo));
    setToDate(formatDate(today));
  }, []);

  const handleSearch = useCallback(async (accNumOverride?: string) => {
    const targetAccount = accNumOverride || accountNumber;
    
    if (!targetAccount.trim()) {
      toast({
        title: "Внимание",
        description: "Введите номер счета",
        variant: "destructive"
      });
      return;
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      toast({
        title: "Ошибка",
        description: "Дата 'С' не может быть больше даты 'По'",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const data = await fetchAccountOperations(targetAccount, fromDate, toDate);
      setTransactions(data);
      
      if (data.length > 0) {
        toast({
          title: "Успех",
          description: `Загружено ${data.length} операций`,
        });
      } else {
        toast({
          title: "Внимание",
          description: "Операции не найдены",
        });
      }
    } catch (error: any) {
      setTransactions([]);
      toast({
        title: "Ошибка при загрузке данных",
        description: error.message || "Неизвестная ошибка",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [accountNumber, fromDate, toDate, toast]);

  // Initial search if account was provided in URL
  useEffect(() => {
    if (initialAccount && fromDate && toDate && !hasSearched) {
      handleSearch(initialAccount);
    }
  }, [initialAccount, fromDate, toDate, handleSearch, hasSearched]);

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayAccountNumber(value);
    setAccountNumber(value.replace(/\s/g, ''));
  };

  const clearDates = () => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setToDate(today);
  };

  const handleExportClick = async () => {
    if (!accountNumber.trim()) return;

    setIsSendingOtp(true);
    try {
      await sendExportOtp(accountNumber);
      setIsOtpModalOpen(true);
      setOtpError(null);
      toast({
        title: "Успех",
        description: "Код отправлен на ваш номер телефона",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка отправки кода",
        description: error.message || "Не удалось отправить SMS с кодом",
        variant: "destructive"
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      await verifyExportOtp(accountNumber, code);
      setIsOtpModalOpen(false);
      toast({
        title: "Код подтвержден",
        description: "Начинаем экспорт в Excel...",
      });
      
      exportAccountOperationsToExcel(
        transactions, 
        accountNumber, 
        fromDate, 
        toDate
      );
    } catch (error: any) {
      setOtpError(error.message || "Неверный код подтверждения");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const formatAccountNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  return (
    <PageContainer
      title="Выписки со счетов"
      description="Просмотр и экспорт выписок по счетам клиентов"
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Поиск операций</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1 max-w-sm">
                <label className="text-sm font-medium">Номер счета</label>
                <Input
                  placeholder="Введите номер счета"
                  value={displayAccountNumber}
                  onChange={handleAccountNumberChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isLoading || !!initialAccount}
                />
              </div>
              
              <div className="space-y-2 w-full md:w-auto">
                <label className="text-sm font-medium">С даты</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full md:w-40"
                />
              </div>
              
              <div className="space-y-2 w-full md:w-auto">
                <label className="text-sm font-medium">По дату</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full md:w-40"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0">
                <Button 
                  onClick={() => handleSearch()} 
                  disabled={(!accountNumber.trim() && !initialAccount) || isLoading}
                  className="flex-1 md:flex-none"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Найти
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearDates} 
                  disabled={isLoading}
                  title="Очистить даты (установить за 30 дней)"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {transactions.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="secondary" 
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                  onClick={handleExportClick}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Экспорт в Excel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {hasSearched && (
          <Card>
            <CardHeader className="pb-3 border-b mb-4 flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <CardTitle className="text-lg">Операции по счету</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Счет: <span className="font-mono font-medium text-foreground">{formatAccountNumber(displayAccountNumber)}</span>
                  {fromDate && toDate && ` (${fromDate} — ${toDate})`}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span>Загрузка данных...</span>
                  </div>
                </div>
              ) : (
                <AccountOperationsTable transactions={transactions} />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <OtpVerificationModal 
        open={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        onVerify={handleVerifyOtp}
        isVerifying={isVerifyingOtp}
        error={otpError}
      />
    </PageContainer>
  );
};
