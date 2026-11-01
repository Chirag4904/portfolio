import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'})});
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
await mkdir('test-results',{recursive:true});
const errors=[];
const report=[];
const pinCenter=async(page,id)=>page.locator(`[data-passenger="${id}"]`).evaluate(pin=>{const p=new DOMPoint(0,0).matrixTransform(pin.getScreenCTM());return {x:p.x,y:p.y};});
const routeCenter=async page=>page.locator('[data-driver-route]').evaluate(path=>{const p=path.getPointAtLength(path.getTotalLength()*.5);const point=new DOMPoint(p.x,p.y).matrixTransform(path.getScreenCTM());return {x:point.x,y:point.y};});
function track(page){page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});}
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>{
  window.audioContexts=[];window.audioStarts=0;
  const Native=window.AudioContext;
  window.AudioContext=class extends Native {
   constructor(...args){super(...args);window.audioContexts.push(this);}
   createGain(){
    const gain=super.createGain(),connect=gain.connect.bind(gain);
    gain.connect=(target,...args)=>{
     if(target===this.destination){window.audioMeter=this.createAnalyser();window.audioMeter.fftSize=2048;connect(window.audioMeter);}
     return connect(target,...args);
    };
    return gain;
   }
   createBufferSource(){const source=super.createBufferSource();const start=source.start.bind(source);source.start=(...args)=>{window.audioStarts++;return start(...args);};return source;}
  };
 });
 const page=await context.newPage();track(page);
 await page.goto(base);
 await page.locator('[data-matching]').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('[data-match-results] li').count(),3);
 assert.equal(await page.evaluate(()=>window.audioContexts.length),0,'no audio context before opt-in');
 const from=await pinCenter(page,2),to=await routeCenter(page);
 await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:12});await page.mouse.up();
 assert.equal(await page.locator('[data-match-results] li').first().getAttribute('data-rank-passenger'),'2');
 assert.match(await page.locator('[data-match-status]').textContent(),/1: passenger 2/);
 await page.locator('[data-passenger="2"]').focus();
 const before=await page.locator('[data-passenger="2"]').getAttribute('transform');
 await page.keyboard.press('ArrowRight');
 assert.notEqual(await page.locator('[data-passenger="2"]').getAttribute('transform'),before);
 await page.keyboard.press('Delete');
 assert.equal(await page.locator('[data-passenger]').count(),2);
 await page.locator('[data-add-passenger]').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('[data-passenger]').count(),3);
 assert.equal(await page.locator('[data-passenger="4"]').evaluate(e=>e===document.activeElement),true);
 await page.locator('[data-add-passenger]').click();
 assert.equal(await page.locator('[data-add-passenger]').getAttribute('aria-pressed'),'true');
 await page.mouse.click(to.x,to.y+80);
 assert.equal(await page.locator('[data-passenger]').count(),4);
 await page.locator('[data-add-passenger]').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('[data-passenger]').count(),5);
 assert.equal(await page.locator('[data-add-passenger]').isDisabled(),true);
 await page.locator('[data-reset-passengers]').click();
 assert.equal(await page.locator('[data-passenger]').count(),3);
 assert.equal(await page.locator('[data-add-passenger]').isDisabled(),false);
 const dragStart=await pinCenter(page,1);
 const original=await page.locator('[data-passenger="1"]').getAttribute('transform');
 await page.mouse.move(dragStart.x,dragStart.y);await page.mouse.down();await page.mouse.move(dragStart.x+80,dragStart.y+20);
 await page.keyboard.press('Escape');await page.mouse.up();
 assert.equal(await page.locator('[data-passenger="1"]').getAttribute('transform'),original,'Escape restores drag origin');
 assert.equal(await page.locator('[data-sound]').count(),0,'sound control is disabled');
 assert.equal(await page.evaluate(()=>window.audioContexts.length),0,'no audio is initialized');
 await page.locator('[data-matching]').screenshot({path:resolve('test-results/matching-desktop.png')});
 await page.goto(base+'/projects/letzgo/');
 assert.equal(await page.locator('[data-match-results] li').count(),3);
 await page.goto(base+'/projects/popin/');
 assert.equal(await page.locator('[data-sound]').count(),0);
 assert.equal(await page.evaluate(()=>window.audioContexts.length),0);
 await context.close();
 report.push('Desktop: live re-ranking, mouse drag, keyboard movement/removal/addition, click placement, limit, reset, and Escape cancellation passed.');
 report.push('Audio is disabled and no audio context is created.');
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();track(phone);await phone.goto(base);
 await phone.locator('[data-matching]').scrollIntoViewIfNeeded();
 const touchFrom=await pinCenter(phone,2),touchTo=await routeCenter(phone);
 const cdp=await mobile.newCDPSession(phone);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touchFrom.x,y:touchFrom.y}]});
 for(let i=1;i<=8;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touchFrom.x+(touchTo.x-touchFrom.x)*i/8,y:touchFrom.y+(touchTo.y-touchFrom.y)*i/8}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await phone.locator('[data-match-results] li').first().getAttribute('data-rank-passenger'),'2');
 await phone.locator('[data-add-passenger]').tap();
 const box=await phone.locator('[data-match-map]').boundingBox();
 await phone.touchscreen.tap(box.x+box.width*.4,box.y+box.height*.8);
 assert.equal(await phone.locator('[data-passenger]').count(),4);
 await phone.locator('[data-matching]').screenshot({path:resolve('test-results/matching-mobile.png')});
 for(const width of [390,320,768,1024]) {
  await phone.setViewportSize({width,height:844});await phone.goto(base);
  assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow at ${width}`);
 }
 await mobile.close();
 const reduced=await browser.newContext({reducedMotion:'reduce'});
 const quietPage=await reduced.newPage();track(quietPage);await quietPage.goto(base+'/projects/letzgo/');
 await quietPage.locator('[data-passenger="1"]').focus();await quietPage.keyboard.press('ArrowLeft');
 assert.match(await quietPage.locator('[data-match-status]').textContent(),/passenger/);
 assert.equal(await quietPage.locator('[data-sound]').count(),0);
 await reduced.close();
 assert.deepEqual(errors,[]);
 report.push('Touch drag and tap placement passed. No overflow at 320, 390, 768, or 1024px. Reduced-motion interaction remains functional; no browser errors.');
 await writeFile('test-results/playground-report.json',JSON.stringify({report,errors},null,2));console.log(report.join('\n'));
} finally {await browser.close();}
