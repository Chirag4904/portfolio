import test from 'node:test';
import assert from 'node:assert/strict';
import { notes } from '../src/guide-notes.js';

test('field notes use supported project facts and avoid stop-order permutations',()=>{
  const copy=notes.map(note=>`${note.text} ${note.question}`).join(' ');
  assert.doesNotMatch(copy,/24 possible|six valid stop orders/i);
  assert.match(copy,/four-tier route filter/i);
  assert.match(copy,/500 concurrent requests/i);
});
