import { useState, useCallback, type RefObject } from 'react';

const DRAG_THRESHOLD = 3;

interface UseDragReorderReturn {
  dragFrom: number | null;
  dropTarget: number | null;
  handlePointerDown: (e: React.PointerEvent, selectedIdx: number) => void;
}

export function useDragReorder(
  listRef: RefObject<HTMLElement | null>,
  selected: string[],
  onReorder: (ids: string[]) => void,
): UseDragReorderReturn {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, selectedIdx: number) => {
      if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
      if (e.button !== 0) return;

      const handle = e.currentTarget as HTMLElement;
      handle.setPointerCapture(e.pointerId);
      const startY = e.clientY;
      const currentIds = [...selected];
      let isDragging = false;
      let currentTarget: number | null = null;

      const getInsertIndex = (clientY: number): number => {
        const items = listRef.current?.querySelectorAll('[data-selected-idx]');
        if (!items) return selectedIdx;
        for (const item of items) {
          const idx = parseInt(
            (item as HTMLElement).dataset['selectedIdx'] ?? '',
          );
          const rect = item.getBoundingClientRect();
          if (clientY < rect.top + rect.height / 2) return idx;
        }
        return currentIds.length;
      };

      const onMove = (moveEvent: PointerEvent) => {
        if (!isDragging) {
          if (Math.abs(moveEvent.clientY - startY) < DRAG_THRESHOLD) return;
          isDragging = true;
          handle.style.cursor = 'grabbing';
          document.body.style.setProperty('user-select', 'none');
          setDragFrom(selectedIdx);
        }
        moveEvent.preventDefault();
        currentTarget = getInsertIndex(moveEvent.clientY);
        setDropTarget(currentTarget);
      };

      const cleanup = () => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onCancel);

        if (isDragging) {
          handle.releasePointerCapture(e.pointerId);
          handle.style.cursor = '';
          document.body.style.removeProperty('user-select');
        }

        setDragFrom(null);
        setDropTarget(null);
      };

      const onUp = () => {
        if (isDragging && currentTarget !== null) {
          let toIdx = currentTarget;
          if (toIdx > selectedIdx) toIdx--;
          if (selectedIdx !== toIdx) {
            const reordered = [...currentIds];
            const removed = reordered.splice(selectedIdx, 1)[0];
            if (removed !== undefined) reordered.splice(toIdx, 0, removed);
            onReorder(reordered);
          }
        }
        cleanup();
      };

      const onCancel = () => {
        cleanup();
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onCancel);
    },
    [selected, onReorder, listRef],
  );

  return { dragFrom, dropTarget, handlePointerDown };
}
