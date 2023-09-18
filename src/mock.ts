import { mock } from 'bun:test';
import { info } from '@nephelaiio/logger';
import { maxPageSize } from './api';

const token = 'token';
const zones = [
  {
    id: '00000000000000000000000000000001',
    name: 'domain1.com'
  },
  {
    id: '00000000000000000000000000000002',
    name: 'domain2.com'
  },
  {
    id: '00000000000000000000000000000003',
    name: 'domain3.com'
  }
];
const packages = [
  {
    id: '0000000000000000000000000000000a',
    zone_id: zones[0].id,
    zone_name: zones[0].name
  },
  {
    id: '0000000000000000000000000000000b',
    zone_id: zones[1].id,
    zone_name: zones[1].name
  },
  {
    id: '0000000000000000000000000000000c',
    zone_id: zones[0].id,
    zone_name: zones[0].name
  },
  {
    id: '0000000000000000000000000000000d',
    zone_id: zones[0].id,
    zone_name: zones[0].name
  },
  {
    id: '0000000000000000000000000000000e',
    zone_id: zones[1].id,
    zone_name: zones[1].name
  },
  {
    id: '0000000000000000000000000000000f',
    zone_id: zones[1].id,
    zone_name: zones[1].name
  }
];

const fetchMock = mock((uri, _) => {
  switch (uri) {
    case 'https://api.cloudflare.com/client/v4/zones':
    case 'https://api.cloudflare.com/client/v4/zones?page=1':
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => ({
          result: [zones[0]],
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
          result: [zones[1]],
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
          result: [zones[2]],
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

const apiMock = mock(({ path }) => {
  info(`Mocking api call to path ${path}`);
  switch (path) {
    case `/zones?per_page=${maxPageSize}`:
      return Promise.resolve({ result: zones });
    case `/zones?name=${zones[0].name}`:
      return Promise.resolve({ result: zones[0] });
    case `/zones?name=${zones[1].name}`:
      return Promise.resolve({ result: zones[1] });
    case `/zones/${zones[0].id}/firewall/waf/packages?per_page=${maxPageSize}`:
      return Promise.resolve({
        result: packages.filter((x) => x.zone_id == zones[0].id)
      });
    case `/zones/${zones[1].id}/firewall/waf/packages?per_page=${maxPageSize}`:
      return Promise.resolve({
        result: packages.filter((x) => x.zone_id == zones[1].id)
      });
    case `/zones/${zones[2].id}/firewall/waf/packages?per_page=${maxPageSize}`:
      return Promise.resolve({
        result: packages.filter((x) => x.zone_id == zones[2].id)
      });
    default:
      error(`Unexpected mocked api call to path ${path}`);
      process.exit(1);
  }
});

export { zones, packages, token, fetchMock, apiMock };
