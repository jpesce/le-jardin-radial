import { useState, useRef } from "react";
import { flowers } from "../data/flowers.js";
import "./FlowerList.css";

export default function FlowerList({ selectedIds, onToggle, onReorder }) {
  const [search, setSearch] = useState("");
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const filtered = flowers.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const isSearching = search.length > 0;

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

      {/* Reorderable selected flowers */}
      {!isSearching && selectedIds.length > 0 && (
        <ul className="flower-items flower-items--selected">
          {selectedIds.map((id, idx) => {
            const flower = flowers.find((f) => f.id === id);
            if (!flower) return null;
            return (
              <li
                key={flower.id}
                className="flower-item flower-item--selected"
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <span className="drag-handle">&#x2630;</span>
                <label className="flower-label">
                  <input
                    type="checkbox"
                    checked
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
              </li>
            );
          })}
        </ul>
      )}

      {/* Divider */}
      {!isSearching && selectedIds.length > 0 && (
        <div className="flower-divider" />
      )}

      {/* All / filtered flowers */}
      <ul className="flower-items">
        {filtered
          .filter((f) => isSearching || !selectedIds.includes(f.id))
          .map((flower) => {
            const checked = selectedIds.includes(flower.id);
            return (
              <li key={flower.id} className="flower-item">
                <label className="flower-label">
                  <input
                    type="checkbox"
                    checked={checked}
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
              </li>
            );
          })}
      </ul>
    </aside>
  );
}
