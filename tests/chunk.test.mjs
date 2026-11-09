import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../rag/chunk.mjs', import.meta.url));
const chunk = input => JSON.parse(execFileSync(process.execPath, [script], { input }));

test('retains heading context and fenced text while stripping local links', () => {
  const input = [
    '# LetzGo',
    '## 3. Technical solutions',
    '### 3.2. Route optimization',
    '#### Cache misses',
    'Look up the [segment cache](file:///Users/example/route.js).',
    '```sh',
    '# This line is code',
    '```',
  ].join('\n');
  const [record] = chunk(input);
  assert.equal(chunk(input).length, 1);
  assert.equal(record.metadata.title, 'Cache misses');
  assert.equal(record.metadata.anchor, 'routing');
  assert.match(record.data, /Route optimization \/ Cache misses/);
  assert.match(record.data, /Look up the segment cache\./);
  assert.match(record.data, /# This line is code/);
  assert.doesNotMatch(record.data, /file:\/\//);
});

test('splits a long section with overlap and retains every word', () => {
  const words = Array.from({ length: 600 }, (_, i) => `word${String(i).padStart(3, '0')}`);
  const records = chunk('# Long section\n' + words.join(' '));
  assert.ok(records.length > 1);
  const slices = records.map(record => record.data.split('\n\n')[1].split(' '));
  assert.deepEqual([...new Set(slices.flat())], words);
  assert.ok(slices[0].includes(slices[1][0]));
  assert.ok(records.every(record => record.data.split('\n\n')[1].length <= 2000));
});
