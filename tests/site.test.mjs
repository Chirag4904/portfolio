import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pages } from '../src/pages.mjs';
import { build, outputRoot } from '../scripts/build.mjs';
import { createPreviewServer } from '../scripts/dev.mjs';

let server, base;
before(async()=>{
  await build();
  server=createPreviewServer();
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  base=`http://127.0.0.1:${server.address().port}`;
});
after(async()=>{await new Promise(resolve=>server.close(resolve));});

test('every generated page has valid local destinations, unique IDs, and a single main heading', async()=>{
  for(const [path,render] of pages) {
    const html=render();
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,path);
    assert.equal((html.match(/<main[ >]/g)||[]).length,1,path);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(new Set(ids).size,ids.length,`duplicate IDs in ${path}`);
    for(const [,url] of html.matchAll(/(?:href|src|data)="(\/[^" ]*|#[^"]*)"/g)) {
      const [pathname,anchor]=url.split('#');
      let file=pathname ? resolve(outputRoot,`.${pathname}`) : resolve(outputRoot,path);
      if((await stat(file)).isDirectory()) file=resolve(file,'index.html');
      assert.ok((await stat(file)).isFile(),`${path}: ${url}`);
      if(anchor) assert.ok((await readFile(file,'utf8')).includes(`id="${anchor}"`),`missing anchor ${url}`);
    }
  }
});

test('server returns pages, the original PDF, and real missing-page status', async()=>{
  for(const path of ['/','/projects/letzgo/','/projects/popin/','/projects/ez-allocate/','/resume/']) {
    const response=await fetch(base+path);
    assert.equal(response.status,200);
    assert.match(response.headers.get('content-type'),/text\/html/);
  }
  const pdf=await fetch(base+'/assets/chirag-aggarwal-resume.pdf');
  assert.equal(pdf.status,200);
  assert.equal(pdf.headers.get('content-type'),'application/pdf');
  assert.equal((await pdf.text()).slice(0,5),'%PDF-');
  assert.equal((await fetch(base+'/does-not-exist')).status,404);
});

test('preview rejects malformed paths, traversal, and writes',async()=>{
  assert.equal((await fetch(base+'/%E0%A4%A')).status,400);
  assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,403);
  assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
});

test('content preserves project order and qualified ownership',()=>{
  const home=pages.get('index.html')();
  assert.ok(home.indexOf('01 — LETZGO')<home.indexOf('02 — POPIN'));
  assert.equal((home.match(/class="project-feature /g)||[]).length,2);
  assert.match(pages.get('projects/ez-allocate/index.html')(),/college team project/);
  assert.match(pages.get('projects/letzgo/index.html')(),/Candidates move through four filtering stages/);
  assert.match(home,/I want to build something that matters/);
  assert.equal((home.match(/data-thought="/g)||[]).length,3);
  assert.equal((home.match(/data-thought-select="/g)||[]).length,3);
});


test('résumé is readable without an embedded viewer and retains the original PDF',()=>{
  const html=pages.get('resume/index.html')();
  for(const text of ['HERE Technologies','Payatu','LetzGo','Popin','Bennett University']) assert.ok(html.includes(text));
  for(const text of ['70% of queries met the ≥ 0.8 confidence threshold','Full-Stack Intern','200-user Gatling load tests']) assert.ok(html.includes(text));
  for(const text of ['REST API (Intermediate)','HackerRank','TestDome','c14d158076fc4b14bbb75b929497bdd1']) assert.ok(html.includes(text));
  assert.doesNotMatch(html,/<object/);
  assert.match(html,/href="\/assets\/chirag-aggarwal-resume\.pdf" download=/);
  assert.match(html,/href="https:\/\/www\.hackerrank\.com\/certificates\/abef2df5048c"/);
});


test('private note form is available with a required message and valid destination',()=>{
  for(const page of ['index.html','resume/index.html']) {
    const html=pages.get(page)();
    assert.match(html,/action="https:\/\/formsubmit\.co\/aggarwalchirag4904@gmail\.com" method="post"/);
    assert.match(html,/<textarea[^>]*name="message"[^>]*required/);
    assert.match(html,/https:\/\/chiragaggarwal\.cloud\/thank-you\//);
  }
  assert.ok(pages.has('thank-you/index.html'));
});
