export type TransactionRequest = {
  currency: string;
  amount: number;
  type: 'credit' | 'debit';
};

export type Transaction = {
  transactionId: string;
  currency: string;
  amount: number;
  type: 'credit' | 'debit';
  status: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
};

export type Wallet = {
  walletId: string;
  currencyClips: CurrencyClip[];
  createdAt: string;
  updatedAt: string;
};

export type CurrencyClip = {
  currency: string;
  balance: number;
  lastTransaction: string;
  transactionCount: number;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  expiry: string;
  userId: string;
};