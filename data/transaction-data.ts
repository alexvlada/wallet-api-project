import { TransactionRequest } from '../api-objects/types';

export const createTransaction = (
  overrides: Partial<TransactionRequest> = {}
): TransactionRequest => ({
  currency: 'EUR',
  amount: 100,
  type: 'credit',
  ...overrides,
});