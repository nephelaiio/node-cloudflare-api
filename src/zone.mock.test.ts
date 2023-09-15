import { zoneInfo } from './zones';
import { setVerbose } from '@nephelaiio/logger';
import { expect, test, mock } from 'bun:test';

setVerbose();

const token = 'token';
const zones = [
    { id: '00000000000000000000000000000001', name: 'zone01' },
    { id: '00000000000000000000000000000002', name: 'zone02' }
]
const execList = mock((_) => Promise.resolve({ result: zones }))
const execInfo = mock ((_) => Promise.resolve({ result: zones[0]}))

test('full zone list should return all zones', async () => {
    expect(await zoneInfo({ token, exec: execList})).toEqual(zones);
});

test('single zone list should return single zone info', async () => {
    expect(await zoneInfo({ token, exec: execInfo})).toEqual([zones[0]]);
});
