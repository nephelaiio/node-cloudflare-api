/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiFunction } from '../api';
import { api, maxPageSize } from '../api';
import { zoneInfo } from '../zones';
import { info } from '@nephelaiio/logger';

type PackageOptions = {
  token: string;
  zone?: string | null;
  packageName?: string | null;
  exec?: ApiFunction;
};

const wafPackageList: (options: PackageOptions) => Promise<any[]> = async (
  options
) => {
  const zoneMessage = options.zone ? `zone ${options.zone}` : 'all zones';
  const packageMessage = options.packageName
    ? `waf packages matching regex ${options.packageName}`
    : 'all waf packages';
  const message = `Fetching ${packageMessage} for ${zoneMessage}`;
  info(message);
  const { token, zone = null, packageName = null, exec = api } = options;
  const zones = await zoneInfo({ token, zone, exec });
  const packageQuery = zones.map(async (z) => {
    const zoneId = (await z).id;
    const zoneName = (await z).name;
    const addZoneName = (p: any) => ({ ...p, ...{ zone_name: zoneName } });
    const path = `/zones/${zoneId}/firewall/waf/packages?per_page=${maxPageSize}`;
    const result = (await exec({ token, path, ignore_errors: [403] })).result;
    const packages = packageName
      ? (result || []).filter((p: any) => p.name == packageName)
      : result;
    return packages.map(addZoneName);
  });
  const results = await Promise.all(packageQuery);
  const packages = results.flat();
  info(`Retrieved ${packages.length} packages`);
  return packages;
};

// const wafPackageRules: (options: PackageOptions) => Promise<any> = async (
//   options
// ) => {
//   const zoneMessage = options.zone ? `zone ${options.zone}` : 'all zones';
//   const packageMessage = options.packageName
//     ? ` matching package name ${packageName(options)}`
//     : '';
//   info(`Fetching waf rules for ${zoneMessage}${packageMessage}`);
//   const packages = await wafPackageList(options);
//   const token = apiToken();
//   const ruleQuery = packages.map(async (p) => {
//     const packageId = (await p).id;
//     const zoneId = (await p).zone_id;
//     const zoneName = (await p).zone_name;
//     const addZoneName = (p: any) => ({ ...p, ...{ zone_name: zoneName } });
//     const path = `/zones/${zoneId}/firewall/waf/packages/${packageId}/rules?per_page=50`;
//     const result = (await api({ token, path })).result;
//     info(`Retrieved ${result.length} rules`);
//     return result.map(addZoneName);
//   });
//   const rules = await Promise.all(ruleQuery);
//   return rules.flat();
// };

export { wafPackageList };
