import { api } from './api';
import { setVerbose, debug } from '@nephelaiio/logger';

import { describe, expect, test, vi } from 'vitest';

const CLOUDFLARE_API_TOKEN = 'token';

setVerbose();

const domains = [
  {
    id: '00000000000000000000000000000001',
    name: 'domain1.nephelai.io'
  },
  {
    id: '00000000000000000000000000000002',
    name: 'domain2.nephelai.io'
  },
  {
    id: '00000000000000000000000000000003',
    name: 'domain3.nephelai.io'
  }
];
global.fetch = vi
  .fn()
  .mockResolvedValueOnce(
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({
        result: [domains[0]],
        result_info: {
          page: 1,
          per_page: 1,
          total_pages: 3,
          count: 1,
          total_count: 3
        },
        success: true,
        errors: [],
        messages: []
      })
    })
  )
  .mockResolvedValueOnce(
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({
        result: [domains[1]],
        result_info: {
          page: 2,
          per_page: 1,
          total_pages: 3,
          count: 1,
          total_count: 3
        },
        success: true,
        errors: [],
        messages: []
      })
    })
  )
  .mockResolvedValueOnce(
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({
        result: [domains[2]],
        result_info: {
          page: 1,
          per_page: 1,
          total_pages: 3,
          count: 1,
          total_count: 3
        },
        success: true,
        errors: [],
        messages: []
      })
    })
  )
  .mockResolvedValueOnce(
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({
        result: [domains[0]],
        result_info: {
          page: 1,
          per_page: 1,
          total_pages: 3,
          count: 1,
          total_count: 3
        },
        success: true,
        errors: [],
        messages: []
      })
    })
  )
  .mockResolvedValueOnce(
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({
        result: [domains[1]],
        result_info: {
          page: 2,
          per_page: 1,
          total_pages: 3,
          count: 1,
          total_count: 3
        },
        success: true,
        errors: [],
        messages: []
      })
    })
  )
  .mockResolvedValueOnce(
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({
        result: [domains[2]],
        result_info: {
          page: 1,
          per_page: 1,
          total_pages: 3,
          count: 1,
          total_count: 3
        },
        success: true,
        errors: [],
        messages: []
      })
    })
  );

describe('api', () => {
  test('all non-paged api results are pulled', async () => {
    const request = await api({ token: CLOUDFLARE_API_TOKEN, path: '/zones' });
    const data = await request.json();
    debug(JSON.stringify(data.result, null, 2));
    expect(data.result).toStrictEqual(domains);
  });

  test('single page api results are not paged', async () => {
    const firstRequest = await api({
      token: CLOUDFLARE_API_TOKEN,
      path: '/zones?page=1'
    });
    const firstData = await firstRequest.json();
    debug(JSON.stringify(firstData.result, null, 2));
    expect(firstData.result[0]).toStrictEqual(domains[0]);
    const secondRequest = await api({
      token: CLOUDFLARE_API_TOKEN,
      path: '/zones?page=2'
    });
    const secondData = await secondRequest.json();
    debug(JSON.stringify(secondData.result, null, 2));
    expect(secondData.result[0]).toStrictEqual(domains[1]);
    const thirdRequest = await api({
      token: CLOUDFLARE_API_TOKEN,
      path: '/zones?page=3'
    });
    const thirdData = await thirdRequest.json();
    debug(JSON.stringify(thirdData.result, null, 2));
    expect(thirdData.result[0]).toStrictEqual(domains[2]);
  });
});
