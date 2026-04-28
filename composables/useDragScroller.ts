// Slider sequentiel : avance d'une card toutes les N ms en smooth-scroll.
// Plus drag souris desktop. Pause sur hover et pendant le drag.
// Boucle infinie : items dupliques x2 dans le template, snap arriere
// silencieux quand on franchit la moitie de scrollWidth.
import type { Ref } from 'vue';

interface Options {
  intervalMs?: number;
  smoothMs?: number;
  pauseOnHover?: boolean;
}

export function useDragScroller(
  trackRef: Ref<HTMLElement | null>,
  opts: Options = {},
) {
  const intervalMs = opts.intervalMs ?? 5000;
  const smoothMs = opts.smoothMs ?? 750;
  const pauseOnHover = opts.pauseOnHover ?? true;

  let intervalId = 0;
  let isHovering = false;
  let isPointerDown = false;
  let pointerStartX = 0;
  let pointerStartScroll = 0;
  let totalDrag = 0;

  function getCardStep(el: HTMLElement) {
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return 0;
    const styles = getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return first.offsetWidth + gap;
  }

  function step() {
    const el = trackRef.value;
    if (!el || isPointerDown || (pauseOnHover && isHovering)) return;
    const cardW = getCardStep(el);
    if (!cardW) return;
    el.scrollTo({ left: el.scrollLeft + cardW, behavior: 'smooth' });
    // Apres la fin du smooth, si on a franchi la moitie de la duplication,
    // recule silencieusement de halfWidth (le contenu duplique masque le saut).
    window.setTimeout(() => {
      if (!trackRef.value) return;
      const halfWidth = trackRef.value.scrollWidth / 2;
      if (halfWidth > 0 && trackRef.value.scrollLeft >= halfWidth) {
        trackRef.value.scrollLeft -= halfWidth;
      }
    }, smoothMs);
  }

  function onPointerDown(e: PointerEvent) {
    const el = trackRef.value;
    if (!el) return;
    if (e.pointerType === 'touch') return;
    isPointerDown = true;
    pointerStartX = e.clientX;
    pointerStartScroll = el.scrollLeft;
    totalDrag = 0;
    el.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
  }

  function onPointerMove(e: PointerEvent) {
    const el = trackRef.value;
    if (!isPointerDown || !el) return;
    const dx = e.clientX - pointerStartX;
    totalDrag = Math.max(totalDrag, Math.abs(dx));
    el.scrollLeft = pointerStartScroll - dx;
  }

  function onPointerUp(e: PointerEvent) {
    const el = trackRef.value;
    if (!isPointerDown || !el) return;
    isPointerDown = false;
    try { el.releasePointerCapture(e.pointerId); } catch {}
    el.classList.remove('is-dragging');
    if (totalDrag > 6) {
      const blocker = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      el.addEventListener('click', blocker, { once: true, capture: true });
    }
  }

  const onMouseEnter = () => { isHovering = true; };
  const onMouseLeave = () => { isHovering = false; };
  const onDragStart = (e: DragEvent) => e.preventDefault();

  onMounted(() => {
    const el = trackRef.value;
    if (!el) return;
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('dragstart', onDragStart);
    intervalId = window.setInterval(step, intervalMs);
  });

  onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId);
    const el = trackRef.value;
    if (!el) return;
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerUp);
    el.removeEventListener('mouseenter', onMouseEnter);
    el.removeEventListener('mouseleave', onMouseLeave);
    el.removeEventListener('dragstart', onDragStart);
  });
}
