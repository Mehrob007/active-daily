export interface Client {
  client_code?: string;
  ClientCode?: string;
  code?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  surname?: string;
  name?: string;
  patronymic?: string;
  phone_number?: string;
  Phone?: string;
  phone?: string;
  tax_code?: string;
  Inn?: string;
  client_type_name?: string;
  dep_code?: string;
  ltn_surname?: string;
  ltn_name?: string;
  ltn_patronymic?: string;
  identdoc_name?: string;
  identdoc_series?: string;
  identdoc_num?: string;
  identdoc_date?: string;
  identdoc_orgname?: string;
  sv_id?: string;
  Client?: {
    Code?: string;
    Name?: string;
  };
}

export interface Account {
  Number: string;
  Balance: string | number;
  Currency?: {
    Code: string;
  };
  Status?: {
    Name: string;
  };
}

export interface Card {
  cardId: string;
  CardNumber?: string;
  CardTypeName?: string;
  statusName?: string;
  type?: string;
  details?: {
    cardNumberMask?: string;
    cardTypeName?: string;
    statusDescription?: string;
    hotCardStatus?: string;
    accounts?: {
      number: string;
      balance: number | string;
      currency: string;
    }[];
    pinDenialCounter?: string | number;
  };
  services?: any[];
  cardTypeDisplay?: string;
}

export interface Credit {
  contractNumber: string;
  referenceId?: string;
  amount: string | number;
  currency: string;
  statusName: string;
  productName: string;
  documentDate?: string;
  clientCode?: string;
  productCode?: string;
  department?: string;
}

export interface Deposit {
  AgreementData?: {
    Code: string;
    Status?: {
      Code?: string;
      Name: string;
    };
    Product?: {
      Name: string;
    };
    DateFrom?: string;
    DateTo?: string;
    Amount?: string | number;
    Currency?: string;
    DepoTermTU?: string | number;
    DepoTermTimeType?: string;
  };
  BalanceAccounts?: {
    RuleCode?: string;
    AccCode?: string;
    Balance: string | number;
    CurrCode?: string;
  }[];
  SumTypes?: {
    Code: string;
    Name: string;
    Pcn?: string | number;
  }[];
}

export interface TelegramUser {
  id: number;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  phoneNumber: string;
}
