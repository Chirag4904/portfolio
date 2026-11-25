// The full stop in "Chirag." is the Dom's Little Studio mark.
// Its pupil follows the cursor, and while it is on screen the cursor points back at it.
const eye = document.querySelector('[data-studio-eye]');

if (eye) {
  const root = document.documentElement;
  const pupil = eye.querySelector('.eye-pupil');
  const rest = { x: 9.6, y: -9.6 }; // where the pupil sits in the studio logo
  const reach = 15;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const still = () => reduced.matches || root.classList.contains('motion-paused');
  const look = (x, y) => { pupil.style.transform = `translate(${x}px, ${y}px)`; };
  // Only touch a class when it changes: the class watcher below would otherwise re-run every frame.
  const setClass = (el, name, on) => { if (el.classList.contains(name) !== on) el.classList.toggle(name, on); };

  // The studio cursor: a lime circle whose line arrow always turns to face the eye.
  const CENTER = { x: 16, y: 16 }; // the hotspot: clicks land at the middle of the circle
  const pointer = document.createElement('div');
  pointer.className = 'eye-pointer';
  pointer.setAttribute('aria-hidden', 'true');
  pointer.innerHTML = '<svg class="eye-pointer-arrow" viewBox="0 0 32 32"><circle class="eye-pointer-badge" cx="16" cy="16" r="11"/><path class="eye-pointer-glyph" d="M10 16 H21.5 M16.5 11 L21.5 16 L16.5 21"/></svg>';
  document.body.append(pointer);

  let mouse = null;
  let overEye = false;
  let frame = 0;

  const update = () => {
    frame = 0;
    const box = eye.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const eyeOnScreen = box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;

    if (!mouse || still()) look(rest.x, rest.y);
    else {
      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const distance = Math.hypot(dx, dy) || 1;
      const pull = Math.min(1, distance / 160) * reach;
      look((dx / distance) * pull, (dy / distance) * pull);
    }

    const active = Boolean(mouse) && eyeOnScreen && finePointer.matches;
    setClass(root, 'eye-pointer-on', active);
    setClass(pointer, 'is-visible', active && !overEye);
    if (!active || overEye) return;

    const turn = Math.atan2(cy - mouse.y, cx - mouse.x); // the line arrow is drawn pointing right (0 rad)
    pointer.style.transform = `translate(${mouse.x - CENTER.x}px, ${mouse.y - CENTER.y}px)`;
    pointer.firstElementChild.style.transform = `rotate(${turn}rad)`;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

  look(rest.x, rest.y);
  addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    mouse = { x: event.clientX, y: event.clientY };
    // Over the eye or Domi, hand back to the real cursor (a pointer, or Domi's grab hand).
    overEye = Boolean(event.target instanceof Element && event.target.closest('.studio-eye, .guide-launch'));
    schedule();
  }, { passive: true });
  addEventListener('scroll', schedule, { passive: true });
  root.addEventListener('pointerleave', () => { mouse = null; schedule(); });
  addEventListener('resize', schedule, { passive: true });
  new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['class'] });
  finePointer.addEventListener('change', schedule);

  // An occasional blink, so the eye reads as alive even before anyone moves the mouse.
  setInterval(() => {
    if (still() || document.hidden) return;
    eye.classList.add('is-blinking');
    setTimeout(() => eye.classList.remove('is-blinking'), 170);
  }, 4800);
}
