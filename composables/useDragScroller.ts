// Auto-slider continu + drag souris pour les tracks scroll horizontales.
// Pour boucle infinie : duplique les items dans le template et le scroll
// reset a la moitie de la largeur des qu'il la passe.
import type { Ref } from 'vue';

interface Options {
  speedPxPerFrame?: number;
  pauseOnHover?: boolean;
}

export function useDragScroller(
  trackRef: Ref<HTMLElement | null>,
  opts: Options = {},
) {
  const speed = opts.speedPxPerFrame ?? 0.5;
  const pauseOnHover = opts.pauseOnHover ?? true;

  let raf = 0;
  let isHovering = false;
  let isPointerDown = false;
  let pointerStartX = 0;
  let pointerStartScroll = 0;
  let totalDrag = 0;

  function tick() {
    const el = trackRef.value;
    if (el && !isPointerDown && !(pauseOnHover && isHovering)) {
      el.scrollLeft += speed;
      const halfWidth = el.scrollWidth / 2;
      if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function onPointerDown(e: PointerEvent) {
    const el = trackRef.value;
    if (!el) return;
    if (e.pointerType === 'touch') return; // touch natif gere le scroll
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
    // bloque le click qui suit un drag (sinon NuxtLink navigue par accident)
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

  // Empecher le drag natif d'image (Chrome / Firefox)
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
    raf = requestAnimationFrame(tick);
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
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
