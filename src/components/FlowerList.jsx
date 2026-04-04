import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { flowers } from "../data/flowers.js";
import "./FlowerList.css";

const LAYOUT_TRANSITION = { duration: 0.3, ease: "easeInOut" };
const DRAG_THRESHOLD = 3;

export default function FlowerList({ selectedIds, onToggle, onReorder, showLabels, onShowLabelsChange }) {
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [dragFrom, setDragFrom] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const listRef = useRef(null);

  const isSearching = search.length > 0;

  const sortedFlowers = useMemo(() => {
    const filtered = flowers.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (isSearching) return filtered;
    const selected = selectedIds
      .map((id) => filtered.find((f) => f.id === id))
      .filter(Boolean);
    const unselected = filtered.filter((f) => !selectedIds.includes(f.id));
    return [...selected, ...unselected];
  }, [selectedIds, search, isSearching]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Global grabbing cursor while dragging
  useEffect(() => {
    document.body.classList.toggle("is-dragging", dragFrom !== null);
    return () => document.body.classList.remove("is-dragging");
  }, [dragFrom]);

  const handlePointerDown = (e, selectedIdx) => {
    if (e.target.closest('input[type="checkbox"]')) return;
    if (e.button !== 0) return;

    const startY = e.clientY;
    const currentIds = [...selectedIds];
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
        setHoveredId(null);
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
      setHoveredId(null);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  return (
    <aside className="flower-list">
      <div className="sidebar-options">
        <h3 className="sidebar-title">options</h3>
        <label className="toggle-label">
          <input
            type="checkbox"
            className="checkbox"
            checked={showLabels}
            onChange={(e) => onShowLabelsChange(e.target.checked)}
          />
          show names
        </label>
      </div>
      <h3 className="sidebar-title">flowers</h3>
      {/* <input
        type="text"
        className="flower-search"
        placeholder="Search flowers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      /> */}

      <ul ref={listRef} className="flower-items">
        <AnimatePresence initial={false}>
          {sortedFlowers.flatMap((flower) => {
            const isSelected = selectedSet.has(flower.id);
            const selectedIdx = selectedIds.indexOf(flower.id);

            const isDragging = dragFrom !== null;
            const isDraggedItem = isSelected && dragFrom === selectedIdx;
            const isHovered = hoveredId === flower.id;

            const showIndicatorAbove =
              isDragging &&
              isSelected &&
              !isSearching &&
              dropTarget === selectedIdx &&
              dropTarget !== dragFrom &&
              dropTarget !== dragFrom + 1;

            const showIndicatorBelow =
              isDragging &&
              isSelected &&
              !isSearching &&
              selectedIdx === selectedIds.length - 1 &&
              dropTarget === selectedIds.length &&
              dropTarget !== dragFrom + 1;

            const items = [
              <motion.li
                key={flower.id}
                layout
                transition={{ layout: LAYOUT_TRANSITION }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isDraggedItem ? 0.4 : 1 }}
                exit={{ opacity: 0 }}
                className={
                  "flower-item" +
                  (isHovered ? " flower-item--hovered" : "") +
                  (showIndicatorAbove ? " drop-indicator-above" : "") +
                  (showIndicatorBelow ? " drop-indicator-below" : "")
                }
                data-selected-idx={
                  isSelected && !isSearching ? selectedIdx : undefined
                }
                onPointerMove={() => {
                  if (dragFrom === null && hoveredId !== flower.id)
                    setHoveredId(flower.id);
                }}
                onMouseLeave={() => setHoveredId(null)}
                onPointerDown={
                  isSelected && !isSearching
                    ? (e) => handlePointerDown(e, selectedIdx)
                    : undefined
                }
              >
                <label className="flower-label">
                  {isSelected && !isSearching && (
                    <span className="drag-handle">&#x2630;</span>
                  )}
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(flower.id)}
                  />
                  <span
                    className="flower-swatch"
                    style={{
                      background: flower.colors?.blooming ?? "#E84393",
                    }}
                  />
                  <span className="flower-name">{flower.name}</span>
                </label>
              </motion.li>,
            ];

            const isLastSelected =
              !isSearching &&
              isSelected &&
              selectedIdx === selectedIds.length - 1 &&
              sortedFlowers.length > selectedIds.length;

            if (isLastSelected) {
              items.push(
                <motion.li
                  key="__divider"
                  layout
                  transition={{ layout: LAYOUT_TRANSITION }}
                  className="flower-divider-inline"
                  aria-hidden
                />,
              );
            }

            return items;
          })}
        </AnimatePresence>
      </ul>
    </aside>
  );
}
