import { APIRequestContext } from '@playwright/test';
import { TransactionRequest } from './types';

export class TransactionApi {
  constructor(
    private readonly request: APIRequestContext
  ) {}

  async createTransaction(
    walletId: string,
    transaction: TransactionRequest
  ) {
    return this.request.post(
      `/wallet/${walletId}/transaction`,
      {
        data: transaction,
      }
    );
  }

  async getTransaction(
    walletId: string,
    transactionId: string
  ) {
    return this.request.get(
      `/wallet/${walletId}/transaction/${transactionId}`
    );
  }

  async getTransactions(
    walletId: string,
    params?: {
      page?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    return this.request.get(
      `/wallet/${walletId}/transactions`,
      {
        params,
      }
    );
  }
}