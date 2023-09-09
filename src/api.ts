/* eslint-disable @typescript-eslint/no-explicit-any */

import { debug, error } from '@nephelaiio/logger';

const TIMEOUT_DEFAULT = 5000;
const RETRIES_DEFAULT = 3;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

async function retry(fn: () => Promise<any>, times: number = RETRIES_DEFAULT) {
  try {
    return await fn();
  } catch (e) {
    if (times <= 0) {
      throw e;
    } else {
      return await retry(fn, times - 1);
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
};

async function api(options: ApiOptions): Promise<any> {
  const {
    token,
    path,
    method = 'GET',
    body = null,
    ignore_errors = []
  } = options;
  const uri = `https://api.cloudflare.com/client/v4${path}`;
  debug(`Fetching ${method} ${uri}`);
  async function fetchData(url: string) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    const options = { method, body, headers };
    try {
      const response = await retry(async () => await timedFetch(url, options));
      if (response.ok || ignore_errors.some((x) => x == response.status)) {
        debug(`Got response ${response.status} for ${method} ${uri}`);
        return response;
      } else {
        const message = `Unexpected response ${response.status} for ${method} ${uri}`;
        error(message);
        throw new Error(message);
      }
    } catch (e: any) {
      const message = `Timeout waiting for response for ${method} ${uri}`;
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
    debug(`Got ${result.length} results for ${method} ${uri}`);
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
