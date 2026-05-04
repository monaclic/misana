// Drag souris + scroll horizontal natif sur un track.
// Variante minimale de useDragScroller, sans auto-advance ni boucle infinie.
// Pour les listes finies (ex. 6 categories) ou la duplication n'a pas
// de sens : l'utilisateur drag, le scroll snap fait son travail, c'est tout.
import type { Ref } from 'vue';

export function useHorizontalDrag(trackRef: Ref<HTMLElement | null>) {
  let isPointerDown = false;
  let pointerStartX = 0;
  let pointerStartScroll = 0;
  let totalDrag = 0;

  function onPointerDown(e: PointerEvent) {
    const el = trackRef.value;
    if (!el || e.pointerType === 'touch') return;
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
    // Bloque le click si on a vraiment drag (>6px) pour eviter d'ouvrir
    // la card sur laquelle on a relache.
    if (totalDrag > 6) {
      const blocker = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      el.addEventListener('click', blocker, { once: true, capture: true });
    }
  }

  const onDragStart = (e: DragEvent) => e.preventDefault();

  onMounted(() => {
    const el = trackRef.value;
    if (!el) return;
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('dragstart', onDragStart);
  });

  onBeforeUnmount(() => {
    const el = trackRef.value;
    if (!el) return;
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerUp);
    el.removeEventListener('dragstart', onDragStart);
  });
}
