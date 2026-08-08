import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const timeZones = ['Etc/GMT+12', 'UTC', 'Etc/GMT-14'];

for (const timeZone of timeZones) {
  test(`built date utilities preserve the calendar day in ${timeZone}`, () => {
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `import { createDate, formatDate, parseDate } from './dist/utils/date-utils.js';
         const date = createDate('2024-03-15');
         console.log(JSON.stringify({
           formatted: formatDate('2024-03-15'),
           iso: date.toISOString(),
           timestamp: parseDate('2024-03-15')
         }));`,
      ],
      { encoding: 'utf8', env: { ...process.env, TZ: timeZone } }
    );
    const result = JSON.parse(output);
    assert.deepEqual(result, {
      formatted: 'March 15, 2024',
      iso: '2024-03-15T12:00:00.000Z',
      timestamp: Date.parse('2024-03-15T12:00:00.000Z'),
    });
  });
}
