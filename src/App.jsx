import { useState } from "react";
import RadialChart from "./components/RadialChart.jsx";
import { flowers } from "./data/flowers.js";
import "./App.css";

const INITIAL_IDS = ["rose", "lavender", "sunflower", "tulip", "snowdrop"];

export default function App() {
  const [selectedIds, setSelectedIds] = useState(INITIAL_IDS);

  const selected = selectedIds
    .map((id) => flowers.find((f) => f.id === id))
    .filter(Boolean);

  return (
    <div className="app">
      <RadialChart flowers={selected} />
    </div>
  );
}
