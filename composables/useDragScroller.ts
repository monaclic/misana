// Slider sequentiel : avance d'une card a un rythme controle, smooth-scroll
// custom pour controler la duree et l'easing. Plus drag souris desktop.
// Pause sur hover et pendant le drag.
// Boucle infinie : items dupliques x2, snap arriere silencieux quand on
// franchit la moitie de scrollWidth.
import type { Ref } from 'vue';

interface Options {
  intervalMs?: number;
  firstStepDelayMs?: number;
  smoothDurationMs?: number;
  pauseOnHover?: boolean;
}

export function useDragScroller(
  trackRef: Ref<HTMLElement | null>,
  opts: Options = {},
) {
  const intervalMs = opts.intervalMs ?? 5000;
  const firstStepDelayMs = opts.firstStepDelayMs ?? 1500;
  const smoothDurationMs = opts.smoothDurationMs ?? 1100;
  const pauseOnHover = opts.pauseOnHover ?? true;

  let firstTimeout = 0;
  let intervalId = 0;
  let scrollRaf = 0;
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

  // Easing ease-out cubic : depart rapide, fin tres douce.
  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  function smoothScrollBy(el: HTMLElement, delta: number) {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    const start = el.scrollLeft;
    const startTime = performance.now();
    const dur = smoothDurationMs;

    function animate(now: number) {
      const t = Math.min((now - startTime) / dur, 1);
      const eased = easeOutCubic(t);
      el.scrollLeft = start + delta * eased;
      if (t < 1) {
        scrollRaf = requestAnimationFrame(animate);
      } else {
        // Apres la fin du smooth, si on a franchi la moitie du contenu
        // duplique, recule silencieusement (le contenu duplique masque le saut).
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
    }

    scrollRaf = requestAnimationFrame(animate);
  }

  function step() {
    const el = trackRef.value;
    if (!el || isPointerDown || (pauseOnHover && isHovering)) return;
    const cardW = getCardStep(el);
    if (!cardW) return;
    smoothScrollBy(el, cardW);
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
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
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
    // Premier pas declenche tot, puis cadence reguliere.
    firstTimeout = window.setTimeout(() => {
      step();
      intervalId = window.setInterval(step, intervalMs);
    }, firstStepDelayMs);
  });

  onBeforeUnmount(() => {
    if (firstTimeout) clearTimeout(firstTimeout);
    if (intervalId) clearInterval(intervalId);
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
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
