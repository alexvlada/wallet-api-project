import { expect } from '@playwright/test';
import { TransactionApi } from '../api-objects/transaction-api';
import { TransactionRequest } from '../api-objects/types';
import { waitForTransactionToFinish } from './wait-for-transaction';

export async function createAndWaitForTransaction(
  transactionApi: TransactionApi,
  walletId: string,
  transaction: TransactionRequest
) {
  const response = await transactionApi.createTransaction(
    walletId,
    transaction
  );

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.transactionId).toBeTruthy();

  return waitForTransactionToFinish(
    transactionApi,
    walletId,
    body.transactionId
  );
}