// Sprite sheets from Zenochi, scaled to fit the portfolio launcher.
const sprites = {
  idle: ['idle', 82, 72, 10],
  walk: ['walking', 80, 71, 10],
  jump: ['jump', 82, 72, 8],
  fall: ['fall', 82, 72, 8],
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const gravity = 1550;
const walkingSpeed = 58;
const steeringSpeed = 240;

export function startScout({ root, launch, visitor, panel, motionPaused, showNote, hideNote, seen, notes }) {
  const sprite = launch.querySelector('.scout-sprite');
  const label = launch.querySelector('.scout-label');
  const hover = matchMedia('(hover: hover)');
  const paths = [...document.querySelectorAll('[data-scout-path]')].map(element => ({
    element,
    note: element.dataset.scoutStop ? { topic: 'Domi', text: element.dataset.scoutStop } : undefined,
  }));
  for (const note of notes) {
    for (const element of document.querySelectorAll(note.selector)) paths.push({ element, note });
  }
  const header = document.querySelector('.site-header');
  let x, feet, floor, left, right, ceiling, home;
  let ground = null, vx = 0, vy = 0, direction = -1;
  let frame, previous, gesture, suppressClick, spriteState;
  const keys = new Set();
  let command, steerUntil = 0;
  let keysUsed = false;
  try { keysUsed = sessionStorage.getItem('domi-keys-used') === 'true'; } catch { /* Optional. */ }
  launch.toggleAttribute('data-keys-used', keysUsed);

  function learnedKeys() {
    if (keysUsed) return;
    keysUsed = true;
    launch.dataset.keysUsed = '';
    label.style.transform = '';
    try { sessionStorage.setItem('domi-keys-used', 'true'); } catch { /* Optional. */ }
  }

  function clearKeys() {
    keys.clear();
    command = undefined;
    steerUntil = 0;
  }

  function measure() {
    home = root.getBoundingClientRect();
    floor = home.bottom;
    left = 8 + home.width / 2;
    right = innerWidth - left;
    ceiling = Math.min(floor, launch.offsetHeight + Math.max(8, header.getBoundingClientRect().bottom));
    x = clamp(x ?? home.right - home.width / 2, left, right);
    feet = clamp(feet ?? floor, ceiling, floor);
  }

  function paint(state, time = 0) {
    const [file, width, height, count] = sprites[state];
    const index = Math.floor(time / 100) % count;
    const key = `${state}:${index}:${direction}`;
    if (spriteState !== key) {
      spriteState = key;
      sprite.style.width = `${width * .8}px`;
      sprite.style.height = `${height * .8}px`;
      sprite.style.backgroundImage = `url('/assets/scout/${file}.png')`;
      sprite.style.backgroundSize = `${width * count * .8}px 100%`;
      sprite.style.backgroundPositionX = `${-index * width * .8}px`;
      sprite.style.transform = `scaleX(${direction})`;
    }
    launch.style.transform = `translate3d(${x - home.left - home.width / 2}px, ${feet - floor}px, 0)`;
    if (!keysUsed) {
      const edge = label.offsetWidth / 2 + 8;
      label.style.transform = `translateX(${clamp(x, edge, innerWidth - edge) - x}px)`;
    }
    if (!visitor.hidden) {
      const width = visitor.offsetWidth;
      const bubbleX = clamp(x - width / 2, 12, innerWidth - width - 12);
      const above = feet - launch.offsetHeight - visitor.offsetHeight - 12;
      const bubbleY = above >= 12 ? above : clamp(feet + 12, 12, innerHeight - visitor.offsetHeight - 12);
      const side = above >= 12 ? 'above' : 'below';
      if (visitor.dataset.side !== side) visitor.dataset.side = side;
      visitor.style.setProperty('--scout-tail', `${clamp(x - bubbleX, 20, width - 20)}px`);
      visitor.style.transform = `translate3d(${bubbleX}px, ${bubbleY}px, 0)`;
    }
  }

  function tick(time) {
    frame = undefined;
    if (motionPaused() || document.hidden || panel.open) {
      clearKeys();
      return;
    }
    const dt = previous === undefined ? 0 : Math.min((time - previous) / 1000, .04);
    previous = time;
    measure();
    if (gesture) {
      paint(gesture.dragged ? 'jump' : 'idle');
      frame = requestAnimationFrame(tick);
      return;
    }

    const surfaces = paths.map(path => ({ ...path, bounds: path.element.getBoundingClientRect() }))
      .filter(({ bounds }) => bounds.width && bounds.top >= ceiling && bounds.top <= floor);
    const onPath = ({ bounds }) => x >= bounds.left + 10 && x <= bounds.right - 10;
    const support = surfaces.find(surface => surface.element === ground && onPath(surface));
    const holding = !visitor.hidden || (!launch.hasAttribute('data-steering') &&
      (launch.matches(':focus-visible') || (hover.matches && launch.matches(':hover'))));
    if (support) feet = support.bounds.top;
    else if (ground) {
      ground = null;
      hideNote();
    }

    const steering = Number(keys.has('d')) - Number(keys.has('a'));
    const manual = keys.size > 0 || time < steerUntil;
    const grounded = support || (!vx && !vy && feet >= floor);
    let state = 'idle';
    if (grounded && command === 'w') {
      ground = null;
      vy = -900;
      learnedKeys();
    } else if (support && command === 's') {
      ground = null;
      feet += 2;
      vy = 90;
      learnedKeys();
    }
    command = undefined;

    if (steering) {
      direction = steering;
      vx = 0;
      const nextX = clamp(x + steering * steeringSpeed * dt, left, right);
      if (nextX !== x) learnedKeys();
      x = nextX;
      state = 'walk';
    }
    if (ground && !onPath(support)) ground = null;

    if (grounded && !vy && !manual && !holding) {
      if (x <= left) direction = 1;
      if (x >= right) direction = -1;
      x = clamp(x + direction * walkingSpeed * dt, left, right);
      state = 'walk';

      const next = surfaces.find(surface => {
        const rise = feet - surface.bounds.top;
        if (rise < 16 || rise > Math.min(310, innerHeight * .52) || !onPath(surface)) return false;
        return surface.note ? !seen.has(surface.note.question ?? surface.note.text) : !support;
      });
      if (next) {
        vy = -Math.sqrt(2 * gravity * (feet - next.bounds.top + 14));
        vx = 0;
        ground = null;
      } else if (support && !onPath(support)) {
        ground = null;
      }
    }

    if (!ground && (vy || vx || feet < floor)) {
      const before = feet;
      vy += gravity * dt;
      x = clamp(x + vx * dt, left, right);
      feet = clamp(feet + vy * dt, ceiling, floor);
      if (feet === ceiling && vy < 0) vy = 0;
      state = vy < 0 ? 'jump' : 'fall';
      if (vy >= 0) {
        const landed = surfaces.reduce((first, surface) => {
          const top = surface.bounds.top;
          return onPath(surface) && before <= top && feet >= top && (!first || top < first.bounds.top) ? surface : first;
        }, null);
        if (landed || feet >= floor) {
          ground = landed?.element ?? null;
          feet = landed?.bounds.top ?? floor;
          vx = vy = 0;
          state = 'idle';
          // Paw prints are paused; keep the landing reactions active.
          // if (landed?.element.hasAttribute('data-scout-stop')) landed.element.dataset.scoutDiscovered = '';
          if (landed?.note) showNote(landed.note);
        }
      }
    }
    paint(state, state === 'idle' && holding ? 0 : time);
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    previous = undefined;
    clearKeys();
    if (motionPaused()) {
      gesture = ground = null;
      delete launch.dataset.held;
      launch.style.transform = '';
      vx = vy = 0;
      x = feet = undefined;
      hideNote();
      sprite.style.cssText = '';
      spriteState = undefined;
    } else if (!document.hidden && !panel.open) {
      frame = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (key === 'tab') delete launch.dataset.steering;
    if (!['a', 'd', 'w', 's'].includes(key) || event.defaultPrevented || event.isComposing ||
        event.ctrlKey || event.metaKey || event.altKey || motionPaused() || panel.open || gesture ||
        event.target.closest?.('input, textarea, select, [contenteditable], [role="textbox"]')) return;
    event.preventDefault();
    if (event.repeat) return;
    launch.dataset.steering = '';
    keys.add(key);
    hideNote();
    if (key === 'w' || key === 's') command = key;
  });
  window.addEventListener('keyup', event => {
    if (keys.delete(event.key.toLowerCase())) steerUntil = performance.now() + 900;
  });
  window.addEventListener('blur', () => {
    clearKeys();
    gesture = null;
    delete launch.dataset.held;
  });
  document.addEventListener('focusin', event => {
    if (event.target.closest('input, textarea, select, [contenteditable], [role="textbox"]')) clearKeys();
  });

  launch.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    delete launch.dataset.steering;
    if (motionPaused()) return;
    clearKeys();
    measure();
    gesture = {
      id: event.pointerId, startX: event.clientX, startY: event.clientY,
      offsetX: x - event.clientX, offsetY: feet - event.clientY,
      lastX: event.clientX, lastY: event.clientY, time: event.timeStamp,
      vx: 0, vy: 0, dragged: false,
    };
  });
  window.addEventListener('pointermove', event => {
    delete launch.dataset.steering;
    if (gesture?.id !== event.pointerId) return;
    if (!gesture.dragged) {
      if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 7) return;
      launch.setPointerCapture(event.pointerId);
      gesture.dragged = suppressClick = true;
      launch.dataset.held = '';
      ground = null;
      hideNote();
    }
    const elapsed = Math.max(event.timeStamp - gesture.time, 12);
    gesture.vx = clamp((event.clientX - gesture.lastX) * 1000 / elapsed, -620, 620);
    gesture.vy = clamp((event.clientY - gesture.lastY) * 1000 / elapsed, -880, 680);
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    gesture.time = event.timeStamp;
    x = clamp(event.clientX + gesture.offsetX, left, right);
    feet = clamp(event.clientY + gesture.offsetY, ceiling, floor);
    if (gesture.vx) direction = Math.sign(gesture.vx);
    paint('jump');
  });
  function release(event) {
    if (gesture?.id !== event.pointerId) return;
    if (gesture.dragged) {
      const flung = event.type === 'pointerup' && event.timeStamp - gesture.time < 85;
      vx = flung ? gesture.vx : 0;
      vy = flung ? gesture.vy : 0;
    }
    delete launch.dataset.held;
    gesture = null;
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  launch.addEventListener('lostpointercapture', release);
  launch.addEventListener('click', event => {
    if (suppressClick && event.detail) event.stopPropagation();
    suppressClick = false;
  });

  panel.addEventListener('close', sync);
  document.addEventListener('motionchange', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pageshow', sync);
  measure();
  paint('idle');
  sync();
}
