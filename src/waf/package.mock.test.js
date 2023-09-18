import { wafPackageList } from './package';
import { setVerbose } from '@nephelaiio/logger';
import { expect, test } from 'bun:test';
import { token, zones, packages, apiMock } from '../mock';

setVerbose();

test('full package query should return all results', async () => {
  const packageList = await wafPackageList({ token, exec: apiMock });
  expect(packageList.length).toEqual(packages.length);
  packageList.forEach((x) => x.id in packages.map((p) => p.id));
});

test('single zone package query should return single zone results', async () => {
  const zonePackageMap = zones.map(async ({ id, name }) => ({
    zone: name,
    packages: (await packages).filter(({ zone_id }) => zone_id == id)
  }));
  const zonePackageInfo = await Promise.all(zonePackageMap);
  expect(
    await wafPackageList({ token, exec: apiMock, zone: zones[0].name })
  ).toEqual(zonePackageInfo.filter((x) => x.zone == zones[0].name)[0].packages);
  expect(
    await wafPackageList({ token, exec: apiMock, zone: zones[1].name })
  ).toEqual(zonePackageInfo.filter((x) => x.zone == zones[1].name)[0].packages);
});
