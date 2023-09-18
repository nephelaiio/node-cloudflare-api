import { api } from './api';
import { setVerbose, debug } from '@nephelaiio/logger';
import { expect, test } from 'bun:test';
import { token, zones, fetchMock } from './mock';

setVerbose();

test('all non-paged api results are pulled', async () => {
  const request = await api({ token, path: '/zones', exec: fetchMock });
  const data = request;
  debug(JSON.stringify(data.result, null, 2));
  expect(data.result).toStrictEqual(zones);
});

test('single page api results are not paged', async () => {
  const firstRequest = await api({
    token,
    path: '/zones?page=1',
    exec: fetchMock
  });
  const firstData = firstRequest;
  debug(JSON.stringify(firstData.result, null, 2));
  expect(firstData.result[0]).toStrictEqual(zones[0]);
  const secondRequest = await api({
    token,
    path: '/zones?page=2',
    exec: fetchMock
  });
  const secondData = secondRequest;
  debug(JSON.stringify(secondData.result, null, 2));
  expect(secondData.result[0]).toStrictEqual(zones[1]);
  const thirdRequest = await api({
    token,
    path: '/zones?page=3',
    exec: fetchMock
  });
  const thirdData = thirdRequest;
  debug(JSON.stringify(thirdData.result, null, 2));
  expect(thirdData.result[0]).toStrictEqual(zones[2]);
});
