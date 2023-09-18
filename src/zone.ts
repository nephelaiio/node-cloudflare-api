/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ApiFunction } from './api';
import { api, maxPageSize } from './api';

type ZoneOptions = {
  token: string;
  zone?: string;
  exec?: ApiFunction;
};

const zoneInfo: (options: ZoneOptions) => Promise<any[]> = async (
  options: ZoneOptions
) => {
  const { token, zone = null, exec = api } = options;
  const path = zone ? `/zones?name=${zone}` : `/zones?per_page=${maxPageSize}`;
  const zones = await exec({ token, path });
  return Promise.resolve([zones.result].flat());
};

export { zoneInfo };
