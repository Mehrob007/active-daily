export interface ProcessingTransaction {
  id: string | number;
  localTransactionDate: string;
  localTransactionTime: string;
  responseCode: string;
  reversal: string | number;
  responseDescription: string;
  cardNumber: string;
  cardId: string;
  transactionType: string;
  transactionTypeNumber: number;
  transactionTypeName: string;
  amount: number | string;
  currency: string | number;
  conamt: number | string;
  conCurrency: string | number;
  acctbal: number | string;
  utrnno: string;
  terminalId: string;
  atmId: string;
  reqamt: number | string;
  terminalAddress: string;
  mcc: string;
  account: string;
}

export interface CardLimitPayload {
  cardId: string;
  limitName: string;
  limitValue: string;
  cycleType: string;
  currency: string;
  cycleLength: string;
}
