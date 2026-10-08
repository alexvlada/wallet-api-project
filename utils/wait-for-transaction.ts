import { expect } from '@playwright/test';
import { TransactionApi } from '../api-objects/transaction-api';

export async function waitForTransactionToFinish(
  transactionApi: TransactionApi,
  walletId: string,
  transactionId: string,
  timeout = 5000,
  interval = 500
) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const response = await transactionApi.getTransaction(
      walletId,
      transactionId
    );

    expect(response.status()).toBe(200);

    const transaction = await response.json();

    if (transaction.status === 'finished') {
      return transaction;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(
    `Transaction ${transactionId} did not finish within ${timeout} ms`
  );
}