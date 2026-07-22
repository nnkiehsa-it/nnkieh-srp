const PRESSABLE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]:not([aria-disabled="true"])',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="switch"]:not([aria-disabled="true"])',
  '[data-list-row-trigger]',
  '.pressable',
  '.interactive-surface',
  '.content-trigger',
  '.text-trigger',
  '.nav-item',
  '.dropdown-item',
  '.list-surface-row--interactive',
].join(',');

const MINIMUM_VISIBLE_MS = 120;
const MOVE_TOLERANCE_PX = 12;

interface ActivePress {
  element: HTMLElement;
  startedAt: number;
  startX: number;
  startY: number;
}

let initialized = false;

function findPressable(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLElement>(PRESSABLE_SELECTOR) : null;
}

export function initializePressFeedback() {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;
  const activePresses = new Map<number, ActivePress>();

  document.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const element = findPressable(event.target);
    if (!element || element.matches(':disabled, [aria-disabled="true"]')) return;
    element.classList.add('is-pressing');
    activePresses.set(event.pointerId, {
      element,
      startedAt: performance.now(),
      startX: event.clientX,
      startY: event.clientY,
    });
  }, { capture: true, passive: true });

  document.addEventListener('pointermove', (event) => {
    const press = activePresses.get(event.pointerId);
    if (!press) return;
    if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) <= MOVE_TOLERANCE_PX) return;
    press.element.classList.remove('is-pressing');
    activePresses.delete(event.pointerId);
  }, { capture: true, passive: true });

  const release = (event: PointerEvent, immediate = false) => {
    const press = activePresses.get(event.pointerId);
    if (!press) return;
    activePresses.delete(event.pointerId);
    const remaining = immediate ? 0 : Math.max(0, MINIMUM_VISIBLE_MS - (performance.now() - press.startedAt));
    window.setTimeout(() => {
      const stillPressed = [...activePresses.values()].some((active) => active.element === press.element);
      if (!stillPressed) press.element.classList.remove('is-pressing');
    }, remaining);
  };

  document.addEventListener('pointerup', (event) => release(event), { capture: true, passive: true });
  document.addEventListener('pointercancel', (event) => release(event, true), { capture: true, passive: true });
}
