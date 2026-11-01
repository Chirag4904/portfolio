import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Uses an existing Playwright installation; it is not a production dependency.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'})});
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const output=resolve('test-results');
await mkdir(output,{recursive:true});
const errors=[];
const report=[];
const paths=['/','/projects/letzgo/','/projects/popin/','/projects/ez-allocate/','/resume/'];
function listen(page){page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});}
async function overflow(page,label){
  const dimensions=await page.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth}));
  assert.ok(dimensions.content<=dimensions.width,`${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
}
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();listen(page);
 await page.addInitScript(()=>{
  window.longTasks=[];
  new PerformanceObserver(list=>window.longTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});
 });
 for(const path of paths){
  assert.equal((await page.goto(base+path)).status(),200);
  await page.waitForTimeout(200);
  await overflow(page,'desktop '+path);
  if(path==='/') {
    await page.locator('[data-slideshow]').scrollIntoViewIfNeeded();
    await page.locator('[data-slide="0"]').evaluate(img=>img.decode());
    await page.waitForTimeout(550);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  }
  await page.screenshot({path:resolve(output,`desktop-${path==='/'?'home':path.split('/').filter(Boolean).at(-1)}.png`),fullPage:true});
 }
 await page.goto(base);
 await page.evaluate(()=>document.fonts.ready);
 const timing=await page.evaluate(()=>new Promise(resolve=>{
  const samples=[];let previous;
  function frame(time){if(previous!==undefined)samples.push(time-previous);previous=time;if(samples.length<90)requestAnimationFrame(frame);else{samples.sort((a,b)=>a-b);resolve({medianFrameMs:samples[45],p95FrameMs:samples[85],longTasks:window.longTasks,resources:performance.getEntriesByType('resource').map(r=>r.name)});}}
  requestAnimationFrame(frame);
 }));
 assert.equal(timing.resources.some(url=>!url.startsWith(base)),false,'site performs no external resource requests');
 await writeFile(resolve(output,'performance.json'),JSON.stringify(timing,null,2));
 await page.screenshot({path:resolve(output,'desktop-opening.png')});
 await page.keyboard.press('Tab');
 assert.equal(await page.locator('.skip-link').evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>location.hash),'#main');
 await page.locator('[data-opening-select="1"]').focus();
 await page.keyboard.press('Enter');
 assert.equal(await page.locator('[data-opening-select="1"]').getAttribute('aria-pressed'),'true');
 assert.match(await page.locator('[data-opening-note]').textContent(),/question/);
 await page.locator('h1').click();
 const svg=await page.locator('[data-opening-connection] svg').boundingBox();
 await page.mouse.move(svg.x+svg.width*.85,svg.y+svg.height*.5);
 assert.equal(await page.locator('[data-opening-select="2"]').getAttribute('aria-pressed'),'true');
 await page.mouse.move(1,1);
 await page.locator('[data-thought-select="1"]').click();
 await page.waitForTimeout(600);
 assert.equal(await page.locator('[data-thought="1"]').getAttribute('aria-hidden'),'false');
 assert.equal(await page.locator('[data-thought="0"]').getAttribute('aria-hidden'),'true');
 await page.screenshot({path:resolve(output,'desktop-journey.png')});
 await page.locator('[data-thought-select="2"]').click();
 await page.waitForTimeout(600);
 assert.equal(await page.locator('[data-thought="2"]').getAttribute('aria-hidden'),'false');
 await page.screenshot({path:resolve(output,'desktop-impact.png')});
 await page.locator('[data-thought-select="0"]').click();
 assert.equal(await page.locator('[data-thought="0"]').getAttribute('aria-hidden'),'false');
 await page.locator('[data-motion]').click();
 assert.ok(await page.locator('html').evaluate(e=>e.classList.contains('motion-paused')));
 for(const thought of await page.locator('[data-thought]').all()) assert.equal(await thought.getAttribute('aria-hidden'),'false');
 await page.goto(base+'/projects/popin/');
 assert.equal(await page.locator('[data-motion]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-motion]').click();
 await page.locator('[data-pipeline]').scrollIntoViewIfNeeded();
 const stage=await page.locator('[data-stage][aria-pressed="true"]').getAttribute('data-stage');
 await page.waitForTimeout(5300);
 assert.notEqual(await page.locator('[data-stage][aria-pressed="true"]').getAttribute('data-stage'),stage);
 await page.locator('[data-stage="3"]').click();
 assert.match(await page.locator('[data-stage-description]').textContent(),/Play Store/);
 await page.waitForTimeout(5300);
 assert.equal(await page.locator('[data-stage="3"]').getAttribute('aria-pressed'),'true','keyboard focus pauses autoplay');
 await page.locator('h1').click();
 const offscreen=await page.locator('[data-stage][aria-pressed="true"]').getAttribute('data-stage');
 await page.waitForTimeout(5300);
 assert.equal(await page.locator('[data-stage][aria-pressed="true"]').getAttribute('data-stage'),offscreen,'offscreen pipeline stops');
 report.push('Desktop: all routes, keyboard navigation, pointer response, persistent pause, stage selection, autoplay and offscreen pause passed.');
 await context.close();

 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const phone=await mobile.newPage();listen(phone);
 for(const path of paths){
  await phone.goto(base+path);await phone.waitForTimeout(150);
  await overflow(phone,'mobile '+path);
  if(path==='/') {
    await phone.locator('[data-slideshow]').scrollIntoViewIfNeeded();
    await phone.locator('[data-slide="0"]').evaluate(img=>img.decode());
    await phone.waitForTimeout(550);
    await phone.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  }
  await phone.screenshot({path:resolve(output,`mobile-${path==='/'?'home':path.split('/').filter(Boolean).at(-1)}.png`),fullPage:true});
 }
 await phone.goto(base);
 await phone.locator('[data-thought-select="1"]').tap();
 await phone.waitForTimeout(600);
 assert.equal(await phone.locator('[data-thought="1"]').getAttribute('aria-hidden'),'false');
 await phone.screenshot({path:resolve(output,'mobile-journey.png')});
 const thoughtBounds=await phone.locator('[data-thought="1"] h2').boundingBox();
 const controlsBounds=await phone.locator('.journey-navigation').boundingBox();
 assert.ok(thoughtBounds.y+thoughtBounds.height<controlsBounds.y,'mobile chapter text does not overlap navigation');
 await phone.locator('[data-map-select="2"]').tap();
 assert.equal(await phone.locator('[data-map-select="2"]').getAttribute('aria-pressed'),'true');
 await phone.locator('[data-slide-next]').tap();
 assert.equal(await phone.locator('[data-slide="1"]').isVisible(),true);
 assert.equal(await phone.locator('[data-slide="0"]').isVisible(),false);
 await phone.locator('[data-slide="1"]').evaluate(img=>img.decode());
 await phone.waitForTimeout(550);
 await phone.locator('[data-slideshow]').screenshot({path:resolve(output,'award-photo.png')});
 await phone.locator('[data-slide-prev]').tap();
 assert.equal(await phone.locator('[data-slide="0"]').isVisible(),true);
 assert.equal(await phone.locator('[data-slide="1"]').isVisible(),false);
 await phone.locator('[data-slide-pause]').tap();
 assert.equal(await phone.locator('[data-slide-pause]').getAttribute('aria-pressed'),'true');
 await phone.locator('a.story-link[href="/projects/letzgo/"]').tap();
 await phone.waitForURL('**/projects/letzgo/');
 await phone.locator('.story-body details summary').tap();
 assert.equal(await phone.locator('.story-body details').getAttribute('open'),'');
 report.push('Mobile 390px: all routes, touch map controls, photo navigation/pause, project navigation and disclosure passed.');
 await mobile.close();

 const landscape=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
 const shortPage=await landscape.newPage();listen(shortPage);
 await shortPage.goto(base);
 await overflow(shortPage,'landscape');
 assert.equal(await shortPage.locator('.journey-stage').evaluate(e=>getComputedStyle(e).position),'relative');
 for(const thought of await shortPage.locator('[data-thought]').all()) assert.equal(await thought.getAttribute('aria-hidden'),'false');
 await landscape.close();
 report.push('Personal journey: scroll chapters, backward navigation, layer transitions, and accessible short-viewport fallback passed.');

 const reduce=await browser.newContext({viewport:{width:320,height:760},reducedMotion:'reduce'});
 const reducedPage=await reduce.newPage();listen(reducedPage);
 for(const path of paths){await reducedPage.goto(base+path);await overflow(reducedPage,'320px '+path);}
 await reducedPage.goto(base);
 assert.equal(await reducedPage.locator('[data-journey]').evaluate(e=>getComputedStyle(e.querySelector('.journey-stage')).position),'relative');
 for(const thought of await reducedPage.locator('[data-thought]').all()) assert.equal(await thought.getAttribute('aria-hidden'),'false');
 await reducedPage.goto(base+'/projects/popin/');
 assert.equal(await reducedPage.locator('[data-motion]').isDisabled(),true);
 await reducedPage.locator('[data-pipeline]').scrollIntoViewIfNeeded();
 await reducedPage.waitForTimeout(5300);
 assert.equal(await reducedPage.locator('[data-stage="0"]').getAttribute('aria-pressed'),'true');
 const running=await reducedPage.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
 assert.equal(running,0);
 await reducedPage.locator('[data-stage="2"]').click();
 assert.equal(await reducedPage.locator('[data-stage="2"]').getAttribute('aria-pressed'),'true');
 await reducedPage.screenshot({path:resolve(output,'reduced-motion-320.png'),fullPage:true});
 const downloadPromise=reducedPage.waitForEvent('download');
 await reducedPage.goto(base+'/resume/');
 await reducedPage.locator('a[download]').first().click();
 const download=await downloadPromise;
 assert.equal(download.suggestedFilename(),'Chirag-Aggarwal-Resume.pdf');
 assert.equal(await download.failure(),null);
 report.push('320px and reduced motion: no overflow, no running animations or autoplay, manual stage controls passed.');
 await reduce.close();
 const noScript=await browser.newContext({javaScriptEnabled:false});
 const fallback=await noScript.newPage();
 await fallback.goto(base);
 assert.equal(await fallback.locator('[data-thought="2"]').isVisible(),true);
 await fallback.goto(base+'/projects/popin/');
 assert.equal(await fallback.locator('.pipeline-all-details').isVisible(),true);
 assert.equal(await fallback.locator('[data-stage-panel="3"]').isVisible(),true);
 assert.equal(await fallback.locator('.motion-toggle').isVisible(),false);
 await noScript.close();
 report.push('No-JavaScript fallback: full project text and delivery-stage explanations are available.');
 report.push(`Desktop animation sample: median ${timing.medianFrameMs.toFixed(1)}ms, p95 ${timing.p95FrameMs.toFixed(1)}ms; ${timing.longTasks.length} long tasks. No external asset requests. PDF download passed.`);
 assert.deepEqual(errors,[],'browser errors');
 report.push('No browser console errors or uncaught exceptions.');
 await writeFile(resolve(output,'browser-report.json'),JSON.stringify({report,errors},null,2));
 console.log(report.join('\n'));
} finally { await browser.close(); }
