import { useState } from "react";
import { flowers } from "../data/flowers.js";
import "./FlowerList.css";

export default function FlowerList({ selectedIds, onToggle }) {
  const [search, setSearch] = useState("");

  const filtered = flowers.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

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
        {filtered.map((flower) => {
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
                  style={{ background: flower.colors?.blooming ?? "#E84393" }}
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
