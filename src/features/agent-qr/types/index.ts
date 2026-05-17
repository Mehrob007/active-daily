export interface QRTransaction {
  id: string | number;
  trnId?: string;
  tx_id?: string;
  partner_trn_id?: string;
  sender_name?: string;
  sender_phone?: string;
  merchant_code?: string;
  merchant_id?: string;
  terminal_code?: string;
  description?: string;
  status: 'success' | 'process' | 'cancel' | string;
  sender?: string | number;
  sender_bank?: string | number;
  receiver?: string | number;
  amount: number | string;
  created_at?: string;
  creation_datetime?: string;
  qrId?: string;
}

export interface QRMerchant {
  ID: number;
  code: string | number;
  title: string;
}

export interface QRBank {
  id: number;
  bankId: string | number;
  bankName: string;
}

export interface QRWithdrawOperation {
  NUMDOC: string;
  CLIENTCOR: string;
  TXTDSCR: string;
  REFER: string;
  ACCCOR: string;
  NAMEBCR: string;
  MOVD: string | number;
  MOVC: string | number;
  EXECDT: string;
  DOCDOPER: string;
  IsPayed: boolean;
  doper: string;
  kurs: string | number;
  sumBalOut: string | number;
  account: string;
  _key: string;
}

export interface QRWithdrawSetting {
  ID: number;
  beneficiary_idn: string;
  beneficiary_name: string;
  beneficiary_iban: string;
  payment_details: string;
  payer_idn: string;
  payer_name: string;
  payer_iban: string;
  bic: string;
  is_active: boolean;
  CreatedAt: string;
}
