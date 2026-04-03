import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { flowers } from "../data/flowers.js";
import "./FlowerList.css";

const LAYOUT_TRANSITION = { duration: 0.3, ease: "easeInOut" };

export default function FlowerList({ selectedIds, onToggle, onReorder }) {
  const [search, setSearch] = useState("");
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const isSearching = search.length > 0;

  // Single sorted list: selected first (in order), then unselected (catalog order)
  const sortedFlowers = useMemo(() => {
    const filtered = flowers.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    );

    if (isSearching) return filtered;

    const selected = selectedIds
      .map((id) => filtered.find((f) => f.id === id))
      .filter(Boolean);
    const unselected = filtered.filter(
      (f) => !selectedIds.includes(f.id),
    );
    return [...selected, ...unselected];
  }, [selectedIds, search, isSearching]);

  const selectedSet = useMemo(
    () => new Set(selectedIds),
    [selectedIds],
  );

  // Drag-to-reorder (only among selected items)
  const handleDragStart = (idx) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx) => {
    dragOver.current = idx;
  };

  const handleDragEnd = () => {
    if (
      dragItem.current === null ||
      dragOver.current === null ||
      dragItem.current === dragOver.current
    ) {
      dragItem.current = null;
      dragOver.current = null;
      return;
    }

    const reordered = [...selectedIds];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOver.current, 0, removed);
    onReorder(reordered);

    dragItem.current = null;
    dragOver.current = null;
  };

  return (
    <aside className="flower-list">
      <input
        type="text"
        className="flower-search"
        placeholder="Search flowers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className="flower-items">
        <AnimatePresence initial={false}>
          {sortedFlowers.flatMap((flower, i) => {
            const isSelected = selectedSet.has(flower.id);
            const selectedIdx = selectedIds.indexOf(flower.id);

            const items = [
              <motion.li
                key={flower.id}
                layout
                transition={{ layout: LAYOUT_TRANSITION }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flower-item${isSelected ? " flower-item--selected" : ""}`}
                {...(isSelected && !isSearching
                  ? {
                      draggable: true,
                      onDragStart: () => handleDragStart(selectedIdx),
                      onDragEnter: () => handleDragEnter(selectedIdx),
                      onDragEnd: handleDragEnd,
                      onDragOver: (e) => e.preventDefault(),
                    }
                  : {})}
              >
                <label className="flower-label">
                  {isSelected && !isSearching && (
                    <span className="drag-handle">&#x2630;</span>
                  )}
                  <input
                    type="checkbox"
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

            // Insert divider as its own element after the last selected item
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
