/* eslint-disable @typescript-eslint/no-explicit-any */

import { debug, info, error } from '@nephelaiio/logger';

const TIMEOUT_DEFAULT = 5000;
const DELAY_DEFAULT = 1000;
const RETRIES_DEFAULT = 3;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

function wait(period: number){
    return new Promise(resolve => {
        setTimeout(resolve, period);
    });
}

async function retry(fn: () => Promise<any>, times: number, delay: number) {
  try {
    return await fn();
  } catch (e: any) {
    if (times <= 0) {
      debug(e.message);
      throw e;
    } else {
      await wait(delay);
      await retry(fn, times - 1);
    }
  }
}

async function timedFetch(resource: string, options: any) {
  const { timeout = TIMEOUT_DEFAULT } = options;
  const controller = new AbortController();
  const signal = controller.signal;
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, { ...options, signal });
  clearTimeout(id);
  return response;
}

type ApiOptions = {
  token: string;
  path: string;
  method?: Method;
  body?: object | null;
  ignore_errors?: Array<number>;
  retries?: number;
  delay?: number;
};

async function api(options: ApiOptions): Promise<any> {
  const {
    token,
    path,
    method = 'GET',
    body = null,
    ignore_errors = [],
    retries = RETRIES_DEFAULT,
    delay = DELAY_DEFAULT
  } = options;
  const uri = `https://api.cloudflare.com/client/v4${path}`;
  info(`Fetching ${method} ${uri}`);
  async function fetchData(url: string) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
    const options = { method, body, headers };
    try {
      const response = await retry(async () => await timedFetch(url, options), retries, delay);
      if (response.ok || ignore_errors.some((x) => x == response.status)) {
        info(`Got response ${response.status} for ${method} ${uri}`);
        return response;
      } else {
        const message = `Unexpected response ${response.status} for ${method} ${uri}`;
        debug(await response.text());
        error(message);
        throw new Error(message);
      }
    } catch (e: any) {
      const message = `Unrecoverable error for ${method} ${uri}: ${e.message}`;
      error(message);
      throw new Error(message);
    }
  }
  const params = new URLSearchParams(path.split('?')[1]);
  const response = await fetchData(uri);
  const data: any = response ? await response.json() : { result: [] };
  const pages = data.result_info?.total_pages;
  if (pages > 1 && !params.has('page')) {
    const range = [...Array(pages - 1).keys()].map((x) => x + 1);
    const pageRequests = range.map(async (page) => {
      const separator = uri.includes('?') ? '&' : '?';
      const pageUri = `${uri}${separator}page=${page}`;
      const pageResponse = await fetchData(pageUri);
      return pageResponse ? pageResponse.json() : { result: [] };
    });
    const pageData = await Promise.all(pageRequests);
    const result = data.result.concat(pageData.flatMap((x) => x.result));
    info(`Got ${result.length} results for ${method} ${uri}`);
    return {
      result_info: {
        total_pages: pages,
        per_page: data.result_info.per_page
      },
      success: true,
      errors: [],
      messages: [],
      result
    };
  }
  return data;
}

export { api };
