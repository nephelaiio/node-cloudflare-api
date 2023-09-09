import { api } from './api';
import { setVerbose, debug } from '@nephelaiio/logger';

import { describe, expect, test, vi } from 'vitest';

const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_ACCOUNT_TOKEN;

setVerbose();

describe('token', () => {
  test('should be truthy', async () => {
    expect(token).toBeTruthy();
  });
});

describe('accounts', () => {
  test('should return token account data', async () => {
    const accounts = await api({ token, path: '/accounts' });
    expect(accounts.result.length).toBeTruthy();
    expect(accounts.result.length).toBeGreaterThan(0);
    expect(accounts.result[0].id).toBeDefined();
    expect(accounts.result[0].settings).toBeDefined();
    expect(accounts.result[0].created_on).toBeDefined();
  });
});
