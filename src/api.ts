/* eslint-disable @typescript-eslint/no-explicit-any */

import { debug, info, error } from '@nephelaiio/logger';

const TIMEOUT_DEFAULT = 5000;
const DELAY_DEFAULT = 1000;
const RETRIES_DEFAULT = 3;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
type AsyncFn = () => Promise<any>;
type ApiOptions = {
  token: string;
  path: string;
  method?: Method;
  body?: object | null;
  ignore_errors?: Array<number>;
  retries?: number;
  delay?: number;
};

const maxPageSize = 50;
const wait: (period: number) => Promise<void> = async (period) => {
  return new Promise((resolve) => {
    setTimeout(resolve, period);
  });
};
const retry: (
  fn: AsyncFn,
  times: number,
  delay: number,
  message: string,
  tries?: number
) => Promise<any> = async (fn, times, delay, message, tries = 1) => {
  try {
    debug(`${message} (${tries}/${tries + times})`);
    return await fn();
  } catch (e: any) {
    if (times <= 0) {
      debug(e.message);
      throw e;
    } else {
      await wait(delay);
      await retry(fn, times - 1, delay, message, tries + 1);
    }
  }
};
const timedFetch: (resource: string, options: any) => Promise<any> = async (
  resource,
  options
) => {
  const { timeout = TIMEOUT_DEFAULT } = options;
  const controller = new AbortController();
  const signal = controller.signal;
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, { ...options, signal });
  clearTimeout(id);
  return response;
};
const api: (options: ApiOptions) => Promise<any> = async (options) => {
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
      const response = await retry(
        async () => await timedFetch(url, options),
        retries,
        delay,
        `Fetching ${method} ${uri}`
      );
      if (!response) {
        const message = `Got empty response for ${method} ${url}`;
        info(message);
        throw new Error(message);
      }
      if (response.ok || ignore_errors.some((x) => x == response.status)) {
        info(`Got response ${response.status} for ${method} ${url}`);
        return response;
      }
      const message = `Unexpected response ${response.status} for ${method} ${url}`;
      debug(JSON.stringify(response));
      error(message);
      throw new Error(message);
    } catch (e: any) {
      const message = `Unrecoverable error for ${method} ${url}: ${e.message}`;
      error(message);
      throw new Error(message);
    }
  }
  const params = new URLSearchParams(path.split('?')[1]);
  const response = await fetchData(uri);
  const data: any = response ? await response.json() : { result: [] };
  const pages = data.result_info?.total_pages;
  if (pages > 1 && !params.has('page')) {
    const range = [...Array(pages - 1).keys()].map((x) => x + 2);
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
};

export { api, maxPageSize };
