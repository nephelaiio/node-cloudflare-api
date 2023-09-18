import { wafPackageList } from './package';
import { maxPageSize } from '../api';
import { info, error, setVerbose } from '@nephelaiio/logger';
import { expect, test, mock } from 'bun:test';

setVerbose();

const token = 'token';
const zones = [
  { id: '00000000000000000000000000000001', name: 'zone01' },
  { id: '00000000000000000000000000000002', name: 'zone02' }
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

const exec = mock(({ path }) => {
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
    default:
      error(`Unexpected mocked api call to path ${path}`);
      process.exit(1);
  }
});

test('full package query should return all results', async () => {
  const packageList = await wafPackageList({ token, exec });
  expect(packageList.length).toEqual(packages.length);
  packageList.forEach((x) => x.id in packages.map((p) => p.id));
});

test('single zone package query should return single zone results', async () => {
  const zonePackageMap = zones.map(async ({ id, name }) => ({
    zone: name,
    packages: (await packages).filter(({ zone_id }) => zone_id == id)
  }));
  const zonePackageInfo = await Promise.all(zonePackageMap);
  expect(await wafPackageList({ token, exec, zone: zones[0].name })).toEqual(
    zonePackageInfo.filter((x) => x.zone == zones[0].name)[0].packages
  );
  expect(await wafPackageList({ token, exec, zone: zones[1].name })).toEqual(
    zonePackageInfo.filter((x) => x.zone == zones[1].name)[0].packages
  );
});
