import { zoneInfo } from './zone';
import { setVerbose } from '@nephelaiio/logger';
import { expect, test } from 'bun:test';
import { token, zones, apiMock } from './mock';

setVerbose();

test('full zone list should return all zones', async () => {
  expect(await zoneInfo({ token, exec: apiMock })).toEqual(zones);
});

test('single zone list should return single zone info', async () => {
  expect(await zoneInfo({ token, exec: apiMock, zone: zones[0].name })).toEqual(
    [zones[0]]
  );
  expect(await zoneInfo({ token, exec: apiMock, zone: zones[1].name })).toEqual(
    [zones[1]]
  );
});
