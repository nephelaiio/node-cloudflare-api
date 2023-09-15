/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ApiFunction } from './api';
import { api, maxPageSize } from './api';

type zoneOptions = {
  token: string;
  zone?: string;
  exec?: ApiFunction;
};

const zoneInfo: (options: ZoneOptions) => Promise<[any]> = (
  options: zoneOptions
) => {
  const { token, zone = null, exec = api } = options;
  const path = zone ? `/zones?name=${zone}` : `/zones?per_page=${maxPageSize}`;
  const zones = await exec({ token, path });
  return [zones.result].flat();
};

export { zoneInfo };
