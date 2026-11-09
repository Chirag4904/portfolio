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

test('streams reply fragments and at most one matching site section', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (String(url).endsWith('/query-data/field-guide-v2')) {
      assert.equal(JSON.parse(options.body).filter, "document = 'letzgo'");
      return Response.json({ result: [
        { data: 'Six orders satisfy the pickup constraint.', metadata: { title: 'Precedence Constraints & Permutations', anchor: 'routing' } },
        { data: 'Progressive pricing brackets.', metadata: { title: '3.4. Dynamic Bracketed Commute Pricing Model', anchor: 'reliability' } },
        { data: 'Java, Kafka and MCP.', metadata: { title: 'TECHNICAL SKILLS', anchor: 'skills', document: 'resume' } },
      ] });
    }
    const body = JSON.parse(options.body);
    assert.equal(body.stream, true);
    assert.equal(JSON.parse(body.messages[1].content).notes[1].source, null);
    assert.equal(JSON.parse(body.messages[1].content).notes[2].source, 3);
    const upstream = ['SOUR', 'CE 1\nSix', ' orders.'].map(content =>
      'data: ' + JSON.stringify({ choices: [{ delta: { content } }] }) + '\r\n\r\n'
    ).join('') + 'data: [DONE]\r\n\r\n';
    return new Response(new ReadableStream({
      start(controller) {
        const bytes = new TextEncoder().encode(upstream);
        controller.enqueue(bytes.slice(0, 23));
        controller.enqueue(bytes.slice(23));
        controller.close();
      },
    }));
  });
  const incoming = request({ question: 'Why only six?', topic: 'letzgo' });
  incoming.headers.set('Accept', 'application/x-ndjson');
  const response = await POST(incoming);
  assert.match(response.headers.get('content-type'), /application\/x-ndjson/);
  const events = (await response.text()).trim().split('\n').map(JSON.parse);
  assert.deepEqual(events, [
    { text: 'Six' }, { text: ' orders.' },
    { source: { title: 'LetzGo · Pickup before drop-off', href: '/projects/letzgo/#routing' } },
  ]);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test('answers greetings without a provider request or a source link', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected provider call'); });
  const incoming = request({ question: 'How are you?' });
  incoming.headers.set('Accept', 'application/x-ndjson');
  const response = await POST(incoming);
  assert.match(JSON.parse(await response.text()).text, /guide to Chirag’s portfolio/);
  assert.equal(fetchMock.mock.callCount(), 0);
});
