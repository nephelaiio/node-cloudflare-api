import { zoneInfo } from './zone';
import { maxPageSize } from './api';
import { info, error, setVerbose } from '@nephelaiio/logger';
import { expect, test, mock } from 'bun:test';

setVerbose();

const token = 'token';
const zones = [
  { id: '00000000000000000000000000000001', name: 'zone01' },
  { id: '00000000000000000000000000000002', name: 'zone02' }
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
    default:
      error(`Unexpected mocked api call to path ${path}`);
      process.exit(1);
  }
});

test('full zone list should return all zones', async () => {
  expect(await zoneInfo({ token, exec })).toEqual(zones);
});

test('single zone list should return single zone info', async () => {
  expect(await zoneInfo({ token, exec, zone: zones[0].name })).toEqual([
    zones[0]
  ]);
  expect(await zoneInfo({ token, exec, zone: zones[1].name })).toEqual([
    zones[1]
  ]);
});
