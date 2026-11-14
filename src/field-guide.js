import { notes, pickNote } from './guide-notes.js';
import { readLines } from './guide-stream.js';
import { startScout } from './scout.js';

const root = document.querySelector('[data-field-guide]');
const find = selector => root.querySelector(selector);
const panel = find('dialog');
const launch = find('.guide-launch');
const visitor = find('[data-guide-visitor]');
const noteAsk = find('[data-guide-note-ask]');
const thread = find('[data-guide-thread]');
const turns = find('[data-guide-turns]');
const welcome = find('[data-guide-welcome]');
const starters = find('[data-guide-starters]');
const tech = find('[data-guide-tech]');
const techItems = find('[data-guide-tech-items]');
const form = find('[data-guide-form]');
const field = form.elements.question;
const send = form.querySelector('button');
const status = find('[data-guide-status]');
const pet = find('[data-scout-pet]');
const petSprite = pet.querySelector('.guide-panel-scout-sprite');
const petHome = find('[data-scout-home]');
const petFinding = find('[data-scout-finding]');
const petCompose = find('[data-scout-compose]');
const chatNote = find('[data-scout-chat-note]');
const chatNoteAsk = find('[data-scout-chat-ask]');
const projectSlug = location.pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];
const projectNotes = projectSlug ? notes.filter(note => note.href.split('#')[0] === `/projects/${projectSlug}/`) : [];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hover = matchMedia('(hover: hover)');
const topics = {
  site: { label: '00 / OVERVIEW', heading: 'There’s a story behind every build.', description: 'Ask about the projects, the portfolio, or Chirag’s work.', placeholder: 'Ask about the portfolio…', prompts: ['What projects has Chirag built?', 'What does Chirag work on at HERE?', 'What award did Chirag’s hackathon team receive?'] },
  letzgo: { name: 'LetzGo', label: '01 / LETZGO', heading: 'A shared ride, engineered.', description: 'Explore the route decisions, real-time GPS, and the backend behind a trip.', placeholder: 'Ask about LetzGo…', prompts: ['How did LetzGo reduce route-matching work?', 'How did LetzGo handle live GPS?'], technologies: ['Redis', 'BullMQ', 'Socket.IO', 'PostgreSQL', 'Stripe Connect'] },
  popin: { name: 'Popin', label: '02 / POPIN', heading: 'A city, one viewport at a time.', description: 'Explore the event map, organizer tools, and the delivery pipeline.', placeholder: 'Ask about Popin…', prompts: ['How did Popin avoid duplicate map queries?', 'How did Popin keep Flutter golden tests consistent?'], technologies: ['Flutter', 'TypeScript', 'React', 'BullMQ', 'OpenTelemetry'] },
  'ez-allocate': { name: 'EZ-Allocate', label: 'PROJECT', heading: 'A fair workload.', description: 'Ask about faculty assignments, workload limits, and background exports.', placeholder: 'Ask about EZ-Allocate…', prompts: projectNotesFor('EZ-Allocate').map(note => note.question) },
  resume: { label: '03 / RESUME', heading: 'A closer look at the experience.', description: 'Explore roles, project contributions, education, and the latest skills.', placeholder: 'Ask about the resume…', prompts: ['What skills are on Chirag’s resume?', 'What did Chirag study?'] },
};
const history = [];
const seen = new Set();
let previous = '';
let activeTopic = 'site';
let returnFocus;
let request;
let currentNote;
let dismissTimer;
let projectTimer;
let chatFact;
let petMotion;

function projectNotesFor(topic) {
  return notes.filter(note => note.topic === topic);
}

function motionPaused() {
  return reduced.matches || document.documentElement.classList.contains('motion-paused');
}

function hideNote() {
  clearTimeout(dismissTimer);
  visitor.hidden = true;
}

function showNote(note) {
  if (!note || !visitor.hidden) return;
  const key = note.question ?? note.text;
  if (seen.has(key)) return;
  seen.add(key);
  currentNote = note;
  noteAsk.hidden = !note.question;
  find('[data-guide-note-topic]').textContent = note.topic;
  find('[data-guide-note-text]').textContent = note.text;
  visitor.hidden = false;

  function dismissWhenIdle() {
    if (visitor.matches(':focus-within') || (hover.matches && visitor.matches(':hover'))) {
      dismissTimer = setTimeout(dismissWhenIdle, 1000);
    }
    else hideNote();
  }
  dismissTimer = setTimeout(dismissWhenIdle, note.question ? 12000 : 3000);
}

function scheduleProjectNote() {
  clearTimeout(projectTimer);
  if (document.hidden || panel.open || motionPaused() || projectNotes.every(note => seen.has(note.question))) return;
  projectTimer = setTimeout(() => {
    if (!launch.matches('[data-held], :focus-visible')) showNote(pickNote(projectNotes, seen));
    scheduleProjectNote();
  }, projectNotes.some(note => seen.has(note.question)) ? 20000 : 7500);
}

function moveScout(destination) {
  if (petSprite.parentElement === destination) return;
  const from = petSprite.getBoundingClientRect();
  petMotion?.cancel();
  destination.append(petSprite);
  if (!panel.open || motionPaused()) return;
  const to = petSprite.getBoundingClientRect();
  const dx = from.width ? from.left - to.left : 0;
  const dy = from.height ? from.top - to.top : 0;
  petMotion = petSprite.animate([
    { transform: `translate(${dx}px, ${dy}px)` },
    { transform: `translate(${dx / 2}px, ${dy / 2 - 8}px)`, offset: .5 },
    { transform: 'translate(0, 0)' },
  ], { duration: 280, easing: 'cubic-bezier(.23,1,.32,1)' });
}

function showChatFact() {
  const topic = topics[activeTopic].name;
  let pool = projectNotes.length ? projectNotes : notes;
  if (topic) pool = projectNotesFor(topic);
  if (activeTopic === 'resume') pool = notes.filter(note => ['Work', 'About'].includes(note.topic));
  const avoid = pool.length > 1 ? new Set([chatFact?.question]) : undefined;
  chatFact = pickNote(pool, avoid);
  if (!chatFact) return;
  chatNote.hidden = false;
  find('[data-scout-chat-text]').textContent = chatFact.text;
  thread.scrollTop = 0;
  moveScout(petFinding);
}

function openGuide(trigger) {
  if (panel.open) return;
  returnFocus = trigger;
  hideNote();
  panel.show();
  launch.setAttribute('aria-expanded', 'true');
  thread.scrollTop = thread.scrollHeight;
  scheduleProjectNote();
  moveScout(request ? petCompose : petHome);
}

function selectTopic(key) {
  if (!Object.hasOwn(topics, key)) return;
  if (key !== activeTopic) previous = '';
  activeTopic = key;
  const topic = topics[key];
  if (petFinding.contains(petSprite)) moveScout(petHome);
  chatNote.hidden = true;
  for (const button of root.querySelectorAll('[data-guide-topic]')) {
    button.setAttribute('aria-pressed', String(button.dataset.guideTopic === key));
  }
  find('[data-guide-topic-label]').textContent = topic.label;
  find('[data-guide-topic-heading]').textContent = topic.heading;
  find('[data-guide-topic-description]').textContent = topic.description;
  field.placeholder = topic.placeholder;
  starters.replaceChildren();
  for (const question of topic.prompts) {
    const button = document.createElement('button');
    button.type = 'button';
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    button.append(question, arrow);
    button.addEventListener('click', () => ask(question));
    starters.append(button);
  }
  tech.hidden = !topic.technologies;
  techItems.replaceChildren();
  for (const name of topic.technologies ?? []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.addEventListener('click', () => ask(`How was ${name} used in ${topic.name}?`, ''));
    techItems.append(button);
  }
}

function appendTurn(question) {
  welcome.hidden = true;
  const turn = document.createElement('article');
  turn.className = 'guide-turn';
  for (const [role, text] of [['user', question], ['reply', '']]) {
    const message = document.createElement('div');
    message.className = 'guide-message guide-message-' + role;
    const label = document.createElement('span');
    label.className = 'mono';
    label.textContent = role === 'user' ? 'You' : 'Domi';
    const content = document.createElement('p');
    content.textContent = text;
    message.append(label, content);
    turn.append(message);
  }
  turns.append(turn);
  return turn.lastElementChild;
}

function addSource(message, source) {
  if (!source || typeof source.href !== 'string' || typeof source.title !== 'string' || !source.href.startsWith('/')) return;
  const url = new URL(source.href, location.origin);
  if (url.origin !== location.origin) return;
  const link = document.createElement('a');
  link.href = url.pathname + url.hash;
  link.textContent = source.title + ' ↗';
  link.addEventListener('click', () => {
    returnFocus = null;
    panel.close();
  });
  message.append(link);
}

function remember(turn) {
  history.push(turn);
  if (history.length > 4) history.shift();
  try { sessionStorage.setItem('portfolio-guide-history', JSON.stringify(history)); } catch { /* Optional. */ }
}

function setStatus(text) {
  if (status.textContent === text) return;
  status.textContent = text;
  status.hidden = !text;
}

async function ask(question, prior = previous) {
  if (!question || request) return;
  const controller = new AbortController();
  request = controller;
  const topic = activeTopic;
  const message = appendTurn(question);
  const output = message.querySelector('p');
  let answer = '';
  let source;
  const queued = [];
  let displayed = 0;
  let finishPacing;
  field.value = '';
  send.textContent = '■';
  send.setAttribute('aria-label', 'Stop reply');
  panel.dataset.scoutState = 'thinking';
  moveScout(petCompose);
  chatNoteAsk.disabled = true;
  setStatus('Looking through the notes…');
  thread.scrollTop = thread.scrollHeight;

  // Buffer a few characters so network bursts don't set the reading pace.
  const pacing = setInterval(() => {
    if (!displayed && queued.length < 24 && !finishPacing) return;
    if (displayed < queued.length) {
      const follow = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 60;
      const next = Math.min(displayed + 4, queued.length);
      answer += queued.slice(displayed, next).join('');
      displayed = next;
      output.textContent = answer;
      setStatus('Replying…');
      if (follow) thread.scrollTop = thread.scrollHeight;
    }
    if (displayed === queued.length) finishPacing?.();
  }, 50);
  controller.signal.addEventListener('abort', () => {
    clearInterval(pacing);
    finishPacing?.();
  }, { once: true });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
      body: JSON.stringify({ question, previous: prior, topic }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 405) throw new Error('This preview does not have a chat endpoint. Domi’s saved facts are still available under Surprise me.');
      throw new Error(data.error || 'The guide is temporarily unavailable.');
    }
    for await (const line of readLines(response.body)) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.error) throw new Error(event.error);
      if (typeof event.text === 'string') queued.push(...event.text);
      if (event.source) source = event.source;
    }
    if (displayed < queued.length && !controller.signal.aborted) {
      await new Promise(resolve => { finishPacing = resolve; });
    }
    controller.signal.throwIfAborted();
    if (!answer.trim()) throw new Error('The guide sent an empty reply. Try again.');
    addSource(message, source);
    if (thread.scrollHeight - thread.scrollTop - thread.clientHeight < 60) thread.scrollTop = thread.scrollHeight;
    if (topic === activeTopic) previous = question;
    remember({ question, answer, source });
    setStatus('Reply complete.');
  } catch (error) {
    const messageText = controller.signal.aborted ? 'Reply stopped.' : error.message;
    if (!answer) output.textContent = messageText;
    setStatus(messageText);
  } finally {
    clearInterval(pacing);
    request = null;
    panel.dataset.scoutState = 'ready';
    chatNoteAsk.disabled = false;
    send.textContent = '↑';
    send.setAttribute('aria-label', 'Send question');
  }
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-guide-open]');
  if (!trigger || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  event.preventDefault();
  openGuide(trigger);
});
find('[data-guide-close]').addEventListener('click', () => panel.close());
find('[data-guide-dismiss]').addEventListener('click', event => {
  hideNote();
  if (event.detail === 0) launch.focus({ preventScroll: true });
});
function askAboutNote(note) {
  if (!note || request) return;
  const key = note.topic.toLowerCase();
  selectTopic(Object.hasOwn(topics, key) ? key : 'site');
  ask(note.question);
}
noteAsk.addEventListener('click', () => {
  openGuide(launch);
  askAboutNote(currentNote);
});
pet.addEventListener('click', showChatFact);
field.addEventListener('focus', () => {
  if (panel.open) moveScout(petCompose);
});
chatNoteAsk.addEventListener('click', () => {
  field.focus({ preventScroll: true });
  askAboutNote(chatFact);
});
for (const button of root.querySelectorAll('[data-guide-topic]')) {
  button.addEventListener('click', () => selectTopic(button.dataset.guideTopic));
}
panel.addEventListener('close', () => {
  launch.setAttribute('aria-expanded', 'false');
  petMotion?.cancel();
  returnFocus?.focus({ preventScroll: true });
  scheduleProjectNote();
});
panel.addEventListener('keydown', event => {
  if (event.key === 'Escape') panel.close();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (request) request.abort();
  else ask(field.value.trim());
});
send.addEventListener('click', event => {
  if (!request) return;
  event.preventDefault();
  request.abort();
});

function handleHash() {
  if (location.hash === '#ask-letzgo') openGuide(launch);
  if (location.hash === '#routing') {
    const section = document.querySelector('details#routing');
    if (section) section.open = true;
  }
}

try {
  const saved = JSON.parse(sessionStorage.getItem('portfolio-guide-history') || '[]');
  if (Array.isArray(saved)) {
    for (const turn of saved.slice(-4)) {
      if (typeof turn?.question !== 'string' || typeof turn.answer !== 'string') continue;
      const message = appendTurn(turn.question);
      message.querySelector('p').textContent = turn.answer;
      addSource(message, turn.source);
      history.push(turn);
      previous = turn.question;
    }
  }
} catch { /* Optional. */ }
const pageTopic = projectSlug ?? (location.pathname === '/resume/' ? 'resume' : 'site');
selectTopic(pageTopic);
root.hidden = false;
for (const trigger of document.querySelectorAll('button[data-guide-open][hidden]')) trigger.hidden = false;
handleHash();
addEventListener('hashchange', handleHash);
startScout({ root, launch, visitor, panel, motionPaused, showNote, hideNote, seen, notes });
document.addEventListener('visibilitychange', scheduleProjectNote);
document.addEventListener('motionchange', () => {
  if (motionPaused()) petMotion?.cancel();
  scheduleProjectNote();
});
scheduleProjectNote();
