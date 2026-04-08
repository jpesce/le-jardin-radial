import { useState, useEffect, useCallback } from "react";

const DRAG_THRESHOLD = 3;

export function useDragReorder(listRef, selected, onReorder) {
  const [dragFrom, setDragFrom] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Global grabbing cursor while dragging
  useEffect(() => {
    document.body.classList.toggle("is-dragging", dragFrom !== null);
    return () => document.body.classList.remove("is-dragging");
  }, [dragFrom]);

  const handlePointerDown = useCallback(
    (e, selectedIdx) => {
      if (e.target.closest('input[type="checkbox"]')) return;
      if (e.button !== 0) return;

      const startY = e.clientY;
      const currentIds = [...selected];
      let isDragging = false;
      let currentTarget = null;

      const getInsertIndex = (clientY) => {
        const items = listRef.current?.querySelectorAll("[data-selected-idx]");
        if (!items) return selectedIdx;
        for (const item of items) {
          const idx = parseInt(item.dataset.selectedIdx);
          const rect = item.getBoundingClientRect();
          if (clientY < rect.top + rect.height / 2) return idx;
        }
        return currentIds.length;
      };

      const onMove = (moveEvent) => {
        if (!isDragging) {
          if (Math.abs(moveEvent.clientY - startY) < DRAG_THRESHOLD) return;
          isDragging = true;
          setDragFrom(selectedIdx);
        }
        moveEvent.preventDefault();
        currentTarget = getInsertIndex(moveEvent.clientY);
        setDropTarget(currentTarget);
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);

        if (isDragging && currentTarget !== null) {
          let toIdx = currentTarget;
          if (toIdx > selectedIdx) toIdx--;
          if (selectedIdx !== toIdx) {
            const reordered = [...currentIds];
            const [removed] = reordered.splice(selectedIdx, 1);
            reordered.splice(toIdx, 0, removed);
            onReorder(reordered);
          }
        }

        setDragFrom(null);
        setDropTarget(null);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [selected, onReorder, listRef],
  );

  return { dragFrom, dropTarget, handlePointerDown };
}
