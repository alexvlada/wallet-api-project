import { test, expect, request, APIRequestContext } from '@playwright/test';
import { TransactionApi } from '../api-objects/transaction-api';
import { WalletApi } from '../api-objects/wallet-api';
import { createTransaction } from '../data/transaction-data';
import { createAndWaitForTransaction } from '../utils/create-and-wait-for-transaction';

test.describe('Wallet transactions', () => {

  let apiContext: APIRequestContext;
  let walletId: string;
  let transactionApi: TransactionApi;
  let walletApi: WalletApi;

  test.beforeAll(async () => {

    walletId = process.env.WALLET_ID!;

    apiContext = await request.newContext({
      baseURL: process.env.BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${process.env.TOKEN}`,
      },
    });

    transactionApi = new TransactionApi(apiContext);
    walletApi = new WalletApi(apiContext);

  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  
  test('TC01 - Create valid credit transaction and verify balance', async () => {

    const creditAmount = 100;
    const balanceBefore = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    // Prepare the transaction data
    const transaction = createTransaction({
      currency: 'EUR',
      amount: creditAmount,
      type: 'credit'
    });
    
    // HTTP 200 is validated inside createAndWaitForTransaction().
    const completedTransaction = await createAndWaitForTransaction(
      transactionApi,
      walletId,
      transaction
    );

    expect(completedTransaction.status).toBe('finished');
    expect(completedTransaction.outcome).toBe('approved');

    const balanceAfter = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    expect(balanceAfter).toBe(balanceBefore + creditAmount);
  });


  test('TC02 - Create valid debit transaction and verify balance', async () => {

    const debitAmount = 50;
    const balanceBefore = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    expect(balanceBefore).toBeGreaterThanOrEqual(debitAmount);
    
    // Prepare the transaction data
    const transaction = createTransaction({
      currency: 'EUR',
      amount: debitAmount,
      type: 'debit'
    });

    // TC01 creates the initial EUR balance; this test consumes part of it.
    // HTTP 200 is validated inside createAndWaitForTransaction().
    const completedTransaction = await createAndWaitForTransaction(
      transactionApi,
      walletId,
      transaction
    );

    expect(completedTransaction.status).toBe('finished');
    expect(completedTransaction.outcome).toBe('approved');

    const balanceAfter = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    expect(balanceAfter).toBe(balanceBefore - debitAmount);
  });


  test('TC03 - Prevent negative wallet balance', async () => {

    const initialBalance = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    expect(initialBalance).toBeGreaterThan(0);

    // Attempt to debit more than the current wallet balance.
    const debitAmount = initialBalance + 1;
    
    // Prepare the transaction data
    const transaction = createTransaction({
      currency: 'EUR',
      amount: debitAmount,
      type: 'debit'
    });
    
    const completedTransaction = await createAndWaitForTransaction(
      transactionApi,
      walletId,
      transaction
    );

    // An excessive debit must not be approved.
    expect(completedTransaction.outcome).not.toBe('approved');

    const finalBalance = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    // A rejected debit must not change the wallet balance.
    expect(finalBalance).toBe(initialBalance);
  });


  test('TC04 - Verify transaction consistency between POST and GET', async () => {
    
    // Prepare the transaction data
    const transaction = createTransaction({
      currency: 'EUR',
      amount: 25,
      type: 'credit'
    });
    
    // HTTP 200 is validated inside createAndWaitForTransaction().
    const createdTransaction = await createAndWaitForTransaction(
      transactionApi,
      walletId,
      transaction
    );

    const response = await transactionApi.getTransaction(
      walletId,
      createdTransaction.transactionId
    );

    expect(response.status()).toBe(200);

    const fetchedTransaction = await response.json();

    expect(fetchedTransaction.transactionId).toBe(createdTransaction.transactionId);
    expect(fetchedTransaction.currency).toBe(createdTransaction.currency);
    expect(fetchedTransaction.amount).toBe(createdTransaction.amount);
    expect(fetchedTransaction.type).toBe(createdTransaction.type);
    expect(fetchedTransaction.status).toBe(createdTransaction.status);
    expect(fetchedTransaction.outcome).toBe(createdTransaction.outcome);
    expect(fetchedTransaction.createdAt).toBe(createdTransaction.createdAt);
    expect(fetchedTransaction.updatedAt).toBe(createdTransaction.updatedAt);
  });


  test('TC05 - Verify transaction history and pagination', async () => {

    // Prepare the transaction data
    const transaction = createTransaction({
      currency: 'EUR',
      amount: 25,
      type: 'credit'
    });

    // HTTP 200 is validated inside createAndWaitForTransaction(). 
    const createdTransaction = await createAndWaitForTransaction(
      transactionApi,
      walletId,
      transaction
    );

    const response = await transactionApi.getTransactions(
      walletId,
      {
        // The API does not explicitly define the first page; use page 1 as the standard assumption.
        page: 1,
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.transactions).toBeInstanceOf(Array);
    expect(body.totalCount).toBeGreaterThan(0);
    expect(body.currentPage).toBe(1);
    expect(body.totalPages).toBeGreaterThan(0);

    const transactionFromHistory = body.transactions.find(
      (item: { transactionId: string }) =>
        item.transactionId === createdTransaction.transactionId
    );

    expect(transactionFromHistory).toBeTruthy();
  });


  test('TC06 - Reject transaction with negative amount', async () => {

    const balanceBefore = await walletApi.getBalance(
      walletId,
      'EUR'
    );
    
    // Prepare the transaction data
    const transaction = createTransaction({
      currency: 'EUR',
      amount: -10,
      type: 'credit'
    });

    const response = await transactionApi.createTransaction(
      walletId,
      transaction
    );

    // A negative transaction amount is not a valid wallet operation.
    // The exact HTTP status for invalid input is not defined in the OpenAPI specification.
    // Any non-200 response indicates that the invalid request was rejected.
    expect(response.status()).not.toBe(200);

    const balanceAfter = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    // An invalid transaction must not change the wallet balance.
    expect(balanceAfter).toBe(balanceBefore);
  });


  test('TC07 - Verify multi-currency balance isolation', async () => {

    // Previous tests create and use EUR transactions, so the wallet should have EUR funds.
    const eurBalanceBefore = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    // No previous test creates a USD transaction, so USD should have no balance.
    const usdBalanceBefore = await walletApi.getBalance(
      walletId,
      'USD'
    );

    expect(eurBalanceBefore).toBeGreaterThan(0);
    expect(usdBalanceBefore).toBe(0);
    
    // Prepare the transaction data
    const transaction = createTransaction({
      currency: 'USD',
      amount: 1,
      type: 'debit'
    });
    
    const completedTransaction = await createAndWaitForTransaction(
      transactionApi,
      walletId,
      transaction
    );

    // A USD debit must not use the available EUR balance.
    expect(completedTransaction.outcome).not.toBe('approved');

    const eurBalanceAfter = await walletApi.getBalance(
      walletId,
      'EUR'
    );

    const usdBalanceAfter = await walletApi.getBalance(
      walletId,
      'USD'
    );

    // A failed USD debit must not affect the EUR or USD balance.
    expect(eurBalanceAfter).toBe(eurBalanceBefore);
    expect(usdBalanceAfter).toBe(usdBalanceBefore);
  });

});