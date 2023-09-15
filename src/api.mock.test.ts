import { api } from './api';
import { setVerbose, debug } from '@nephelaiio/logger';
import { expect, test, mock } from 'bun:test';

const token = 'token';

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
const exec = mock((uri, _) => {
  switch (uri) {
    case 'https://api.cloudflare.com/client/v4/zones':
    case 'https://api.cloudflare.com/client/v4/zones?page=1':
      return Promise.resolve({
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
      });
    case 'https://api.cloudflare.com/client/v4/zones?page=2':
      return Promise.resolve({
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
      });
    case 'https://api.cloudflare.com/client/v4/zones?page=3':
      return Promise.resolve({
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
      });
    default:
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => ({
          result: [],
          result_info: {
            page: 1,
            per_page: 1,
            total_pages: 1,
            count: 0,
            total_count: 0
          },
          success: false,
          errors: [],
          messages: []
        })
      });
  }
});

test('all non-paged api results are pulled', async () => {
  const request = await api({ token, path: '/zones', exec });
  const data = request;
  debug(JSON.stringify(data.result, null, 2));
  expect(data.result).toStrictEqual(domains);
});

test('single page api results are not paged', async () => {
  const firstRequest = await api({
    token,
    path: '/zones?page=1',
    exec
  });
  const firstData = firstRequest;
  debug(JSON.stringify(firstData.result, null, 2));
  expect(firstData.result[0]).toStrictEqual(domains[0]);
  const secondRequest = await api({
    token,
    path: '/zones?page=2',
    exec
  });
  const secondData = secondRequest;
  debug(JSON.stringify(secondData.result, null, 2));
  expect(secondData.result[0]).toStrictEqual(domains[1]);
  const thirdRequest = await api({
    token,
    path: '/zones?page=3',
    exec
  });
  const thirdData = thirdRequest;
  debug(JSON.stringify(thirdData.result, null, 2));
  expect(thirdData.result[0]).toStrictEqual(domains[2]);
});
