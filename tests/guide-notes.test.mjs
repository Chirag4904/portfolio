import test from 'node:test';
import assert from 'node:assert/strict';
import { notes, pickNote } from '../src/guide-notes.js';

test('field notes use supported project facts and avoid stop-order permutations',()=>{
  const copy=notes.map(note=>`${note.text} ${note.question}`).join(' ');
  assert.doesNotMatch(copy,/24 possible|six valid stop orders/i);
  assert.match(copy,/four-tier route filter/i);
  assert.match(copy,/500 concurrent requests/i);
});

test('the LetzGo fact pool excludes seen notes and never falls back to another project', () => {
  const pool = notes.filter(note => note.topic === 'LetzGo');
  const first = pickNote(pool);
  assert.ok(pool.includes(first));
  const seen = new Set([first.question]);
  const second = pickNote(pool, seen);
  assert.equal(second.topic, 'LetzGo');
  assert.notEqual(first.question, second.question);
  seen.add(second.question);
  assert.equal(pickNote(pool, seen), undefined);
});
