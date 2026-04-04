import { useState, useCallback, useMemo } from "react";
import RadialChart from "./components/RadialChart.jsx";
import FlowerList from "./components/FlowerList.jsx";
import { flowers } from "./data/flowers.js";
import "./App.css";

const INITIAL_IDS = ["rose", "lavender", "sunflower", "tulip", "snowdrop"];

export default function App() {
  const [selectedIds, setSelectedIds] = useState(INITIAL_IDS);
  const [showLabels, setShowLabels] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleToggle = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // Reverse so top of sidebar list = outermost ring
  const selected = useMemo(
    () =>
      [...selectedIds]
        .reverse()
        .map((id) => flowers.find((f) => f.id === id))
        .filter(Boolean),
    [selectedIds],
  );

  return (
    <div className="app">
      <main className="chart-area">
        <RadialChart flowers={selected} showLabels={showLabels} />
      </main>
      <FlowerList
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onReorder={setSelectedIds}
        showLabels={showLabels}
        onShowLabelsChange={setShowLabels}
        isOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((prev) => !prev)}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}
