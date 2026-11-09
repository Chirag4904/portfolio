import { notes } from './guide-notes.js';
import { readLines } from './guide-stream.js';

const root = document.querySelector('[data-field-guide]');
const find = selector => root.querySelector(selector);
const panel = find('dialog');
const launch = find('.guide-launch');
const visitor = find('[data-guide-visitor]');
const thread = find('[data-guide-thread]');
const turns = find('[data-guide-turns]');
const welcome = find('[data-guide-welcome]');
const starters = find('[data-guide-starters]');
const form = find('[data-guide-form]');
const field = form.elements.question;
const send = form.querySelector('button');
const status = find('[data-guide-status]');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const history = [];
const seen = new Set();
let previous = '';
let returnFocus;
let request;
let currentNote;
let dismissTimer;
let noteMotion;

function motionPaused() {
  return reduced.matches || document.documentElement.classList.contains('motion-paused');
}

function selectNote() {
  const position = innerHeight * .55;
  const visible = notes.find(note => {
    const bounds = document.querySelector(note.selector)?.getBoundingClientRect();
    return bounds && bounds.top < position && bounds.bottom > position;
  });
  if (visible) return visible;
  return notes.find(note => note.href.startsWith('/projects/') && note.href.split('#')[0] === location.pathname) ?? notes[0];
}

function hideNote() {
  clearTimeout(dismissTimer);
  noteMotion?.cancel();
  visitor.hidden = true;
}

function showNote() {
  if (document.hidden || panel.open || !visitor.hidden || motionPaused()) return;
  const context = selectNote();
  const unseen = notes.filter(note => !seen.has(note.question) && (location.pathname === '/' || note.topic === context.topic));
  const note = seen.has(context.question) ? unseen[Math.floor(Math.random() * unseen.length)] : context;
  if (!note) return;
  seen.add(note.question);
  currentNote = note;
  find('[data-guide-note-topic]').textContent = note.topic.toUpperCase() + ' / FIELD NOTE';
  find('[data-guide-note-text]').textContent = note.text;
  visitor.hidden = false;

  const distance = innerWidth > 560 ? Math.min(150, innerWidth * .15) : 25;
  noteMotion = find('.guide-visitor-bird').animate([
    { transform: `translate(${-distance}px, 9px) rotate(-9deg)`, opacity: 0 },
    { transform: `translate(${-distance * .55}px, -3px) rotate(5deg)`, opacity: 1 },
    { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
  ], { duration: 480, easing: 'cubic-bezier(.77,0,.175,1)' });
  dismissTimer = setTimeout(() => {
    if (!visitor.matches(':focus-within, :hover')) hideNote();
  }, 12000);
}

function openGuide(trigger) {
  if (panel.open) return;
  returnFocus = trigger;
  hideNote();
  panel.show();
  launch.setAttribute('aria-expanded', 'true');
  thread.scrollTop = thread.scrollHeight;
}

function renderSuggestions() {
  const choices = new Set([selectNote().question, notes[2].question, 'What skills are on Chirag’s résumé?', notes[0].question]);
  for (const question of Array.from(choices).slice(0, 3)) {
    const button = document.createElement('button');
    button.type = 'button';
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    button.append(question, arrow);
    button.addEventListener('click', () => ask(question));
    starters.append(button);
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
    label.textContent = role === 'user' ? 'YOU' : 'GUIDE';
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

async function ask(question) {
  if (!question || request) return;
  const controller = new AbortController();
  request = controller;
  const message = appendTurn(question);
  const output = message.querySelector('p');
  let answer = '';
  let source;
  field.value = '';
  send.textContent = '■';
  send.setAttribute('aria-label', 'Stop reply');
  setStatus('Looking through the notes…');
  thread.scrollTop = thread.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
      body: JSON.stringify({ question, previous }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'The guide is temporarily unavailable.');
    }
    for await (const line of readLines(response.body)) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.error) throw new Error(event.error);
      if (typeof event.text === 'string') {
        const follow = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 60;
        answer += event.text;
        output.textContent = answer;
        setStatus('Replying…');
        if (follow) thread.scrollTop = thread.scrollHeight;
      }
      if (event.source) source = event.source;
    }
    if (!answer.trim()) throw new Error('The guide sent an empty reply. Try again.');
    addSource(message, source);
    if (thread.scrollHeight - thread.scrollTop - thread.clientHeight < 60) thread.scrollTop = thread.scrollHeight;
    previous = question;
    remember({ question, answer, source });
    setStatus('Reply complete.');
  } catch (error) {
    const messageText = controller.signal.aborted ? 'Reply stopped.' : error.message;
    if (!answer) output.textContent = messageText;
    setStatus(messageText);
  } finally {
    request = null;
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
find('[data-guide-dismiss]').addEventListener('click', () => {
  hideNote();
  launch.focus({ preventScroll: true });
});
find('[data-guide-note-ask]').addEventListener('click', () => {
  openGuide(launch);
  if (currentNote) ask(currentNote.question);
});
panel.addEventListener('close', () => {
  launch.setAttribute('aria-expanded', 'false');
  returnFocus?.focus({ preventScroll: true });
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
renderSuggestions();
root.hidden = false;
for (const trigger of document.querySelectorAll('button[data-guide-open][hidden]')) trigger.hidden = false;
handleHash();
addEventListener('hashchange', handleHash);
setTimeout(showNote, 6500);
setInterval(showNote, 18000);
new MutationObserver(() => { if (motionPaused()) hideNote(); })
  .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
reduced.addEventListener('change', () => { if (motionPaused()) hideNote(); });
