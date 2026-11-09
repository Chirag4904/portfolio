import assert from 'node:assert/strict';
import { test } from 'node:test';
import { POST } from '../api/chat.mjs';

const request = (input) => new Request('https://preview.example/api/chat', {
  method: 'POST',
  body: JSON.stringify(input),
});

test('rejects invalid input before calling a provider', async () => {
  assert.equal((await POST(request({ question: '  ' }))).status, 400);
  assert.equal((await POST(request({ question: 'x'.repeat(601) }))).status, 400);
  assert.equal((await POST(request({ question: 'x'.repeat(9000) }))).status, 413);
});

test('retrieves passages and returns a grounded answer with case study links', async (t) => {
  Object.assign(process.env, {
    UPSTASH_VECTOR_REST_URL: 'https://vector.example',
    UPSTASH_VECTOR_REST_TOKEN: 'test-index-token',
    CLOUDFLARE_ACCOUNT_ID: 'test-account',
    CLOUDFLARE_API_TOKEN: 'test-ai-token',
  });
  const data = 'Pickup must precede drop-off for each rider, leaving six valid stop orders.';
  const answer = 'Six orders satisfy both pickup-before-drop-off constraints.';
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    const body = JSON.parse(options.body);
    if (String(url) === 'https://vector.example/query-data/letzgo') {
      assert.equal(body.data, 'How many orders?\nPrevious question: How does routing work?');
      assert.equal(options.headers.Authorization, 'Bearer test-index-token');
      return Response.json({ result: [{ data, metadata: { title: 'Pickup and drop-off ordering', anchor: 'routing' } }] });
    }
    assert.match(String(url), /\/ai\/run\/@cf\/google\/gemma-4-26b-a4b-it$/);
    assert.equal(options.headers.Authorization, 'Bearer test-ai-token');
    assert.deepEqual(JSON.parse(body.messages[1].content).passages, [data]);
    return Response.json({ result: { choices: [{ message: { content: answer } }] } });
  });
  const response = await POST(request({ question: 'How many orders?', previous: 'How does routing work?' }));
  assert.equal(response.status, 200);
  assert.equal(fetchMock.mock.callCount(), 2);
  assert.deepEqual(await response.json(), {
    answer,
    sources: [{ title: 'Pickup and drop-off ordering', href: '/projects/letzgo/#routing' }],
  });
});
