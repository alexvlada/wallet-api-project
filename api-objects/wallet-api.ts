import { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';

export class WalletApi {
  constructor(
    private readonly request: APIRequestContext
  ) {}

  async getWallet(walletId: string) {
    return this.request.get(`/wallet/${walletId}`);
  }

  async getBalance(
    walletId: string,
    currency: string
  ): Promise<number> {
    const response = await this.getWallet(walletId);

    expect(response.status()).toBe(200);

    const wallet = await response.json();

    const clip = wallet.currencyClips.find(
      (clip: { currency: string }) => clip.currency === currency
    );

    return clip?.balance ?? 0;
  }
}