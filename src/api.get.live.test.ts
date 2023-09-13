import { api } from './api';
import { setVerbose } from '@nephelaiio/logger';
import { expect, test } from 'bun:test';

const token = process.env.CLOUDFLARE_API_TOKEN;

setVerbose();

test(' token should be truthy', async () => {
  expect(token).toBeTruthy();
});

test('accounts function should return account data for token', async () => {
  const accounts = await api({ token, path: '/accounts' });
  expect(accounts.result.length).toBeTruthy();
  expect(accounts.result.length).toBeGreaterThan(0);
  expect(accounts.result[0].id).toBeDefined();
  expect(accounts.result[0].settings).toBeDefined();
  expect(accounts.result[0].created_on).toBeDefined();
});
