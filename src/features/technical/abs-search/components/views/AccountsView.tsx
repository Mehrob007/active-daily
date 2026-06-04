import React, { useState, useEffect } from 'react';
import { AccountCard } from '../AccountCard';
import { loanSoapService } from '../../services/loan-service';

interface AccountsViewProps {
  accounts: any[];
  linkedCards: any[];
  mainAccount: any;
  credits: any[];
  isLoading: boolean;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts, linkedCards, mainAccount, credits, isLoading }) => {

  const [loanDetailsMap, setLoanDetailsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchLoanDetails = async () => {
      if (!credits || credits.length === 0) return;
      
      const newDetails: Record<string, any> = {};
      await Promise.all(
        credits.map(async (credit) => {
          const loanId = credit.loanId || credit.referenceId;
          if (loanId) {
            try {
              const details = await loanSoapService.getLoanDetails(loanId);
              if (details) {
                newDetails[credit.accountNumber || credit.contractNumber] = details;
              }
            } catch (err) {
              console.error("Failed to fetch loan details for", loanId, err);
            }
          }
        })
      );
      setLoanDetailsMap(prev => ({ ...prev, ...newDetails }));
    };

    fetchLoanDetails();
  }, [credits]);

  const handleHistoryClick = async (accountNumber: string) => {
    
    
    
    
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 1);

    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = toDate.toISOString().split('T')[0];
    
    
    console.log(`Fetching history for ${accountNumber} from ${fromDateStr} to ${toDateStr}`);
    
  };

  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground">Загрузка счетов...</div>;
  }

  if (!accounts || accounts.length === 0) {
    return <div className="py-10 text-center text-muted-foreground">У клиента нет счетов</div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {accounts.map((acc, idx) => {
        const accNumber = acc.accountNumber || acc.Number;
        const matchedCard = linkedCards?.find(c => c.linkedAccountNumber === accNumber || c.cardNumber === accNumber);
        const isMain = mainAccount?.accountNumber === accNumber || mainAccount?.isMain && mainAccount?.accountNumber === accNumber;
        
        const matchedCredit = credits?.find(c => c.accountNumber === accNumber || c.contractNumber === accNumber);
        let creditDetails = null;
        if (matchedCredit && loanDetailsMap[accNumber]) {
          const details = loanDetailsMap[accNumber];
          
          let debtAmount = details.debtAmount;
          if (debtAmount === undefined && details.balances) {
            debtAmount = details.balances.reduce((sum: number, b: any) => sum + Number(b.balance || 0), 0);
          }
          creditDetails = { 
            debtAmount: debtAmount || details.amount, 
            currency: details.currency || matchedCredit.currency 
          };
        }

        return (
          <AccountCard
            key={accNumber || idx}
            account={acc}
            cardData={matchedCard}
            isMain={isMain}
            creditDetails={creditDetails}
            onHistoryClick={handleHistoryClick}
          />
        );
      })}
    </div>
  );
};
