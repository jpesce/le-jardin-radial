import { useState, useCallback } from "react";
import RadialChart from "./components/RadialChart.jsx";
import FlowerList from "./components/FlowerList.jsx";
import { flowers } from "./data/flowers.js";
import "./App.css";

const INITIAL_IDS = ["rose", "lavender", "sunflower", "tulip", "snowdrop"];

export default function App() {
  const [selectedIds, setSelectedIds] = useState(INITIAL_IDS);
  const [showLabels, setShowLabels] = useState(true);

  const handleToggle = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const selected = selectedIds
    .map((id) => flowers.find((f) => f.id === id))
    .filter(Boolean);

  return (
    <div className="app">
      <FlowerList selectedIds={selectedIds} onToggle={handleToggle} />
      <main className="chart-area">
        <div className="chart-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            Labels
          </label>
        </div>
        <RadialChart flowers={selected} showLabels={showLabels} />
      </main>
    </div>
  );
}
