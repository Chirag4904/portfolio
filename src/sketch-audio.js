const toggle=document.querySelector('[data-sound]');
let context, master, noise, enabled=false, lastSound=0;
const voices=new Set();
const visibleScenes=new Set();

function updateLabel() {
  toggle.setAttribute('aria-pressed',String(enabled));
  toggle.textContent=enabled?'Sound on':'Sound off';
  toggle.title=enabled?'Mute paper and pencil sounds':'Enable subtle paper and pencil sounds';
}
function stopVoices() {
  for(const voice of voices) {const cleanup=voice.onended;voice.onended=null;voice.stop();cleanup?.();}
  voices.clear();
}

export function sketchSound(kind='pencil') {
  if(!enabled || document.hidden || context?.state!=='running') return;
  const now=context.currentTime;
  if(now-lastSound < (kind==='paper'?1:.22)) return;
  lastSound=now;
  const source=context.createBufferSource();
  const filter=context.createBiquadFilter();
  const envelope=context.createGain();
  const duration=kind==='paper'?.7:.24;
  source.buffer=noise;
  filter.type='bandpass';
  filter.frequency.value=kind==='paper'?1800:2600;
  filter.Q.value=kind==='paper'?1.1:1.4;
  source.connect(filter).connect(envelope).connect(master);
  envelope.gain.setValueAtTime(0,now);
  const level=kind==='paper'?.24:.2;
  envelope.gain.linearRampToValueAtTime(level,now+(kind==='paper'?.12:.05));
  envelope.gain.linearRampToValueAtTime(0,now+duration);
  source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();envelope.disconnect();};
  voices.add(source);
  source.start(now,Math.random());
  source.stop(now+duration);
}

if(toggle) {
  const AudioEngine=window.AudioContext || window.webkitAudioContext;
  if(!AudioEngine) {toggle.textContent='Sound unavailable';toggle.disabled=true;}
  else toggle.addEventListener('click',async()=>{
    toggle.disabled=true;
    try {
      if(enabled) {
        enabled=false;
        stopVoices();
        await context.suspend();
      } else {
        if(!context) {
          context=new AudioEngine();
          master=context.createGain();
          master.gain.value=.2;
          master.connect(context.destination);
          noise=context.createBuffer(1,context.sampleRate*2,context.sampleRate);
          const samples=noise.getChannelData(0);
          for(let i=0;i<samples.length;i++) samples[i]=Math.random()*2-1;
        }
        await context.resume();
        if(context.state!=='running') throw new Error('Audio is not running.');
        enabled=true;
        lastSound=-1;
        if(document.hidden) await context.suspend();
        else sketchSound('paper');
      }
      updateLabel();
    } catch {
      enabled=false;
      stopVoices();
      if(context && context.state!=='closed') await context.suspend().catch(()=>{});
      updateLabel();
      toggle.title='Audio could not start. Select Sound off to try again.';
    } finally {toggle.disabled=false;}
  });
  const visibility=new IntersectionObserver(entries=>{
    for(const entry of entries) {
      if(entry.isIntersecting) visibleScenes.add(entry.target);
      else visibleScenes.delete(entry.target);
    }
  });
  document.querySelectorAll('[data-scene],[data-journey]').forEach(scene=>visibility.observe(scene));
  document.addEventListener('pointermove',event=>{
    if(event.target.closest('svg,.exploded-system,.slides')) sketchSound();
  },{passive:true});
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-scene] button')) sketchSound('paper');
  });
  document.addEventListener('scroll',()=>{if(visibleScenes.size) sketchSound('paper');},{passive:true});
  document.addEventListener('visibilitychange',async()=>{
    if(!context) return;
    try {
      if(document.hidden) {stopVoices();await context.suspend();}
      else if(enabled) await context.resume();
    } catch {enabled=false;updateLabel();}
  });
  window.addEventListener('pagehide',()=>{enabled=false;stopVoices();context?.suspend().catch(()=>{});updateLabel();});
}
