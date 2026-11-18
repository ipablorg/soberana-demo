import { describe, expect, it } from 'vitest';
import {
  getWalletCurrencyLabel,
  getWalletPairLabel,
  resolveReceiveWallet,
  resolveWalletSelection,
} from '../receive-wallet';

describe('resolveReceiveWallet', () => {
  it('prefers the backend default wallet exact currency and chain match regardless of wallet order', () => {
    const wallets = [
      {
        id: 'fiat-wallet',
        currency: 'USD',
        chain: 'FIAT',
        created_at: '2026-06-23T10:00:00.000Z',
      },
      {
        id: 'default-wallet',
        currency: 'USDT',
        chain: 'TRON',
        created_at: '2026-06-23T11:00:00.000Z',
      },
      {
        id: 'usdc-wallet',
        currency: 'USDC',
        chain: 'POLYGON',
        created_at: '2026-06-23T09:00:00.000Z',
      },
    ];

    const defaultWallet = { currency: 'usdt', chain: 'tron' };

    expect(resolveReceiveWallet(wallets, defaultWallet)?.id).toBe('default-wallet');
    expect(resolveReceiveWallet([...wallets].reverse(), defaultWallet)?.id).toBe(
      'default-wallet',
    );
  });

  it('returns no main wallet when no default match exists', () => {
    const wallets = [
      {
        id: 'later-crypto-wallet',
        currency: 'ETH',
        chain: 'ETHEREUM',
        created_at: '2026-06-23T12:00:00.000Z',
      },
      {
        id: 'earlier-crypto-wallet',
        currency: 'BTC',
        chain: 'BITCOIN',
        created_at: '2026-06-23T08:00:00.000Z',
      },
      {
        id: 'fiat-wallet',
        currency: 'USD',
        chain: 'FIAT',
        created_at: '2026-06-23T01:00:00.000Z',
      },
    ];

    expect(resolveReceiveWallet(wallets, { currency: 'USDT', chain: 'tron' })).toBeUndefined();
    expect(
      resolveReceiveWallet([...wallets].reverse(), {
        currency: 'USDT',
        chain: 'tron',
      }),
    ).toBeUndefined();
  });

  it('returns no main wallet when no default exists at all', () => {
    const wallets = [
      {
        id: 'wallet-z',
        currency: 'SOL',
        chain: 'SOLANA',
        created_at: 'invalid-date',
      },
      {
        id: 'wallet-b',
        currency: 'BTC',
        chain: 'BITCOIN',
        created_at: '2026-06-23T08:00:00.000Z',
      },
      {
        id: 'wallet-a',
        currency: 'ETH',
        chain: 'ETHEREUM',
        created_at: '2026-06-23T08:00:00.000Z',
      },
    ];

    expect(resolveReceiveWallet(wallets)).toBeUndefined();
  });

  it('returns no main wallet when only fiat wallets exist without a default match', () => {
    const wallets = [
      {
        id: 'wallet-b',
        currency: 'EUR',
        chain: 'FIAT',
        created_at: '2026-06-23T08:00:00.000Z',
      },
      {
        id: 'wallet-a',
        currency: 'USD',
        chain: 'FIAT',
        created_at: '2026-06-23T08:00:00.000Z',
      },
    ];

    expect(resolveReceiveWallet(wallets, { currency: 'USDT', chain: 'tron' })).toBeUndefined();
  });

  it('preserves the runtime wallet currency label without inventing a fallback token', () => {
    expect(getWalletCurrencyLabel('usdt')).toBe('USDT');
    expect(getWalletCurrencyLabel('')).toBeNull();
    expect(getWalletCurrencyLabel(undefined)).toBeNull();
  });

  it('derives main and secondary wallets from the same shared selection', () => {
    const wallets = [
      {
        id: 'wallet-main',
        currency: 'USDT',
        chain: 'TRON',
        created_at: '2026-06-23T08:00:00.000Z',
      },
      {
        id: 'wallet-secondary',
        currency: 'USDC',
        chain: 'SOLANA',
        created_at: '2026-06-23T09:00:00.000Z',
      },
    ];

    const selection = resolveWalletSelection(wallets, {
      currency: 'USDT',
      chain: 'tron',
    });

    expect(selection.mainWallet?.id).toBe('wallet-main');
    expect(selection.secondaryWallets.map((wallet) => wallet.id)).toEqual([
      'wallet-secondary',
    ]);
    expect(getWalletPairLabel(selection.mainWallet)).toBe('USDT / TRON');
  });

  it('preserves all wallets as secondary when no main wallet resolves', () => {
    const wallets = [
      {
        id: 'wallet-secondary-a',
        currency: 'USDC',
        chain: 'SOLANA',
      },
      {
        id: 'wallet-secondary-b',
        currency: 'USDT',
        chain: 'TRON',
      },
    ];

    const selection = resolveWalletSelection(wallets, {
      currency: 'EURC',
      chain: 'base',
    });

    expect(selection.mainWallet).toBeUndefined();
    expect(selection.secondaryWallets.map((wallet) => wallet.id)).toEqual([
      'wallet-secondary-a',
      'wallet-secondary-b',
    ]);
  });
});
