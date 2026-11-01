import './match-demo.js';
const root = document.documentElement;
root.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('[data-motion]');
let userPaused = false;
try { userPaused = localStorage.getItem('motion-paused') === 'true'; } catch { /* Storage is optional. */ }
let paused = userPaused || reduced.matches;
const motionJobs = [];

function updateMotion() {
  paused = userPaused || reduced.matches;
  root.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.querySelector('[data-motion-label]').textContent = reduced.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
  motionButton.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
  motionButton.title = reduced.matches ? 'Your system preference reduces motion' : paused ? 'Resume continuous animations' : 'Pause all continuous animations';
  motionButton.disabled = reduced.matches;
  motionJobs.forEach(job => job.sync());
  document.dispatchEvent(new Event('motionchange'));
}
motionButton.addEventListener('click', () => {
  userPaused = !userPaused;
  try { localStorage.setItem('motion-paused', String(userPaused)); } catch { /* Storage is optional. */ }
  updateMotion();
});
reduced.addEventListener('change', updateMotion);

// Every loop stops when its scene is offscreen, the tab is hidden, or motion is paused.
function loop(element, callback, duration, blocked = () => false) {
  let timer;
  const job = { element, sync() {
    clearInterval(timer);
    if (!paused && !document.hidden && element.classList.contains('in-view') && !blocked()) timer = setInterval(callback, duration);
  }};
  motionJobs.push(job);
  return job;
}
const scenes = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
    motionJobs.filter(job => job.element === entry.target).forEach(job => job.sync());
  });
}, { threshold: .08 });
document.querySelectorAll('[data-scene]').forEach(scene => scenes.observe(scene));
document.addEventListener('visibilitychange', () => {
  root.classList.toggle('tab-hidden', document.hidden);
  motionJobs.forEach(job => job.sync());
});

document.querySelectorAll('[data-city]').forEach(city => {
  let current = 0;
  let focused = false;
  const positions = ['translate(0px, 0px)', 'translate(110px, 30px)', 'translate(210px, -10px)'];
  const buttons = [...city.querySelectorAll('[data-map-select]')];
  function select(index) {
    current = index;
    city.querySelector('[data-viewport]').style.transform = positions[index];
    city.querySelector('[data-map-status]').textContent = `VIEWPORT 0${index + 1} / 03`;
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  const job = loop(city, () => select((current + 1) % 3), 4800, () => focused);
  buttons.forEach((button,index) => button.addEventListener('click', () => { select(index); job.sync(); }));
  city.addEventListener('focusin', () => { focused = true; job.sync(); });
  city.addEventListener('focusout', event => { if(!city.contains(event.relatedTarget)) { focused = false; job.sync(); } });
});

const pipeline = document.querySelector('[data-pipeline]');
if (pipeline) {
  let current = 0;
  let focused = false;
  const panels = [...document.querySelectorAll('[data-stage-panel]')];
  const buttons = [...pipeline.querySelectorAll('[data-stage]')];
  function select(index) {
    current = index;
    buttons.forEach((button,i) => {
      button.setAttribute('aria-pressed', String(i === index));
      button.querySelector('.stage-dot').textContent = i === index ? '↗' : String(i + 1).padStart(2,'0');
    });
    pipeline.querySelector('[data-stage-counter]').textContent = `0${index + 1} / 04`;
    pipeline.querySelector('[data-stage-title]').textContent = panels[index].querySelector('h3').textContent.split(': ').slice(1).join(': ');
    pipeline.querySelector('[data-stage-description]').textContent = panels[index].querySelector('p').textContent;
  }
  const job = loop(pipeline, () => select((current + 1) % 4), 5000, () => focused);
  buttons.forEach((button,index) => button.addEventListener('click', () => { select(index); job.sync(); }));
  pipeline.addEventListener('focusin', () => { focused = true; job.sync(); });
  pipeline.addEventListener('focusout', event => { if(!pipeline.contains(event.relatedTarget)) { focused = false; job.sync(); } });
}

const slideshow = document.querySelector('[data-slideshow]');
if (slideshow) {
  const slides = [...slideshow.querySelectorAll('[data-slide]')];
  const pauseButton = slideshow.querySelector('[data-slide-pause]');
  let current = 0;
  let slidePaused = false;
  let focused = false;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide,i) => { slide.hidden = i !== current; });
    slideshow.querySelector('[data-slide-caption]').textContent = current ? '02 / The people behind the projects.' : '01 / The award, shared.';
  }
  const job = loop(slideshow, () => show(current + 1), 6500, () => slidePaused || focused);
  slideshow.querySelector('[data-slide-prev]').addEventListener('click', () => { show(current - 1); job.sync(); });
  slideshow.querySelector('[data-slide-next]').addEventListener('click', () => { show(current + 1); job.sync(); });
  pauseButton.addEventListener('click', () => {
    slidePaused = !slidePaused;
    pauseButton.setAttribute('aria-pressed', String(slidePaused));
    pauseButton.setAttribute('aria-label', slidePaused ? 'Resume photo slideshow' : 'Pause photo slideshow');
    pauseButton.textContent = slidePaused ? '▷' : 'Ⅱ';
    job.sync();
  });
  slideshow.addEventListener('focusin', () => { focused = true; job.sync(); });
  slideshow.addEventListener('focusout', event => { if(!slideshow.contains(event.relatedTarget)) { focused = false; job.sync(); } });
}

const entrances = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) { entry.target.classList.add('is-visible'); entrances.unobserve(entry.target); }
  });
}, {threshold:.08});
document.querySelectorAll('.feature-copy,.experience-grid>h2,.about-grid>h2,.award-copy,.chapter-title').forEach(element => {
  element.classList.add('reveal');
  entrances.observe(element);
});
updateMotion();

const opening = document.querySelector('[data-opening-connection]');
if (opening) {
  let current = 0;
  let inspecting = false;
  const notes = ['It starts with someone who needs it.', 'Then comes the question: what could I build?', 'The good part: someone actually using it.'];
  const buttons = [...opening.querySelectorAll('[data-opening-select]')];
  function select(index) {
    current = index;
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(index === i)));
    opening.querySelectorAll('[data-opening-node]').forEach((node,i) => node.classList.toggle('is-current', index === i));
    opening.querySelector('[data-opening-note]').textContent = notes[index];
  }
  const job = loop(opening, () => select((current + 1) % 3), 4300, () => inspecting);
  buttons.forEach((button,i) => button.addEventListener('click', () => { select(i); job.sync(); }));
  opening.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || paused) return;
    const bounds = opening.getBoundingClientRect();
    select(Math.min(2, Math.max(0, Math.floor((event.clientX - bounds.left) / bounds.width * 3))));
  });
  opening.addEventListener('pointerenter', event => {if(event.pointerType==='mouse') {inspecting=true;job.sync();}});
  opening.addEventListener('pointerleave', () => {inspecting=false;job.sync();});
  opening.addEventListener('focusin', () => {inspecting=true;job.sync();});
  opening.addEventListener('focusout', event => {if(!opening.contains(event.relatedTarget)) {inspecting=false;job.sync();}});
  job.sync();
}

const journey = document.querySelector('[data-journey]');
const progressBar = document.querySelector('[data-reading-progress]');
const thoughts = [...document.querySelectorAll('[data-thought]')];
const thoughtButtons = [...document.querySelectorAll('[data-thought-select]')];
const layers = [...document.querySelectorAll('[data-layer]')];
const readingLines = [...document.querySelectorAll('[data-read-line]')];
let framePending = false;
let selectedThought = -1;
let journeyLinear = null;

function showThought(index, progress) {
  const linear = paused || innerHeight <= 650;
  if(selectedThought !== index || journeyLinear !== linear) {
    selectedThought = index;
    journeyLinear = linear;
    thoughts.forEach((thought,i) => {
      thought.classList.toggle('is-current', index === i);
      thought.inert = !linear && index !== i;
      thought.setAttribute('aria-hidden', String(!linear && index !== i));
    });
    thoughtButtons.forEach((button,i) => button.setAttribute('aria-pressed', String(index === i)));
    if(journey) journey.querySelector('[data-journey-counter]').textContent = ['01 — THE PERSON','02 — THE ENGINEERING','03 — THE IMPACT'][index];
  }
  const mobile = innerWidth <= 760;
  const spread = progress < .55 ? Math.min(1,progress/.4) : Math.max(0,1-(progress-.55)/.45);
  layers.forEach(layer => {
    const i = Number(layer.dataset.layer);
    if(linear) {layer.style.transform='';return;}
    const distance = mobile ? 14 + spread*71 : 18 + spread*117;
    const y = (mobile ? 30 : 55) + (i - 1)*distance;
    layer.style.transform = `translateY(${y}px) rotateX(${50-progress*8}deg) rotateZ(${-25+progress*7}deg)`;
  });
}

function renderScroll() {
  framePending = false;
  const fullHeight = document.documentElement.scrollHeight - innerHeight;
  if(progressBar) progressBar.style.transform = `scaleX(${fullHeight > 0 ? scrollY/fullHeight : 0})`;
  if(journey) {
    const rect = journey.getBoundingClientRect();
    const top = innerWidth <= 760 ? 107 : 80;
    if((rect.bottom >= 0 && rect.top <= innerHeight) || journeyLinear !== (paused || innerHeight <= 650)) {
      const progress = Math.min(1, Math.max(0, (top-rect.top)/Math.max(1,rect.height-innerHeight+top)));
      showThought(Math.min(2, Math.floor(progress*3)), progress);
    }
  }
  for(const line of readingLines) {
    const rect = line.getBoundingClientRect();
    line.classList.toggle('read-active', paused || rect.top < innerHeight*.78);
  }
}
function scheduleScroll() {
  if(!framePending) {framePending=true;requestAnimationFrame(renderScroll);}
}
window.addEventListener('scroll', scheduleScroll, {passive:true});
window.addEventListener('resize', scheduleScroll);
document.addEventListener('motionchange', () => {
  selectedThought=-1;
  if(journey) showThought(0,0);
  scheduleScroll();
});
thoughtButtons.forEach((button,index) => button.addEventListener('click', () => {
  // The controls move the native document, so the selected chapter and scroll position agree.
  const rect = journey.getBoundingClientRect();
  const top = innerWidth <= 760 ? 107 : 80;
  const fraction = (index + .15)/3;
  const destination = scrollY + rect.top - top + fraction * (rect.height-innerHeight+top);
  window.scrollTo({top:destination,behavior:'instant'});
  showThought(index,fraction);
}));
if(journey) showThought(0,0);
renderScroll();
