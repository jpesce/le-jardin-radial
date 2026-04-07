import { useReducer, useMemo, useCallback } from "react";
import { raw as catalogRaw, flowers as catalogFlowers } from "../data/flowers.js";
import { parseMonths, firstBloomStart } from "../data/months.js";

const GARDEN_SIZE = 8;
const SELECTED_SIZE = 4;
const DEFAULT_OWNER = "Tainah Drummond";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRaw({ id, names, scientificName, colors, months }) {
  return { id, names, scientificName, colors, months };
}

function initialState() {
  const shuffled = shuffle(catalogRaw);
  const gardenFlowers = shuffled.slice(0, GARDEN_SIZE);
  const selected = gardenFlowers.slice(0, SELECTED_SIZE).map((f) => f.id);

  return {
    owner: DEFAULT_OWNER,
    labels: true,
    selected,
    flowers: gardenFlowers.map(pickRaw),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_OWNER":
      return { ...state, owner: action.value };
    case "SET_LABELS":
      return { ...state, labels: action.value };
    case "TOGGLE_SELECTED": {
      const id = action.id;
      if (state.selected.includes(id)) {
        return { ...state, selected: state.selected.filter((x) => x !== id) };
      }
      if (!state.flowers.some((f) => f.id === id)) return state;
      return { ...state, selected: [...state.selected, id] };
    }
    case "REORDER_SELECTED":
      return { ...state, selected: action.ids };
    case "TOGGLE_GARDEN": {
      const id = action.id;
      const inGarden = state.flowers.some((f) => f.id === id);
      if (inGarden) {
        return {
          ...state,
          flowers: state.flowers.filter((f) => f.id !== id),
          selected: state.selected.filter((x) => x !== id),
        };
      }
      const entry = catalogRaw.find((f) => f.id === id);
      if (!entry) return state;
      return {
        ...state,
        flowers: [...state.flowers, pickRaw(entry)],
        selected: [...state.selected, id],
      };
    }
    default:
      return state;
  }
}

function enrich(flower, lang) {
  const monthStates = parseMonths(flower.months);
  return {
    ...flower,
    monthStates,
    firstBloom: firstBloomStart(monthStates),
    displayName: flower.names[lang],
  };
}

export function useGarden(lang) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const gardenFlowers = useMemo(
    () =>
      state.flowers
        .map((f) => enrich(f, lang))
        .sort((a, b) => a.firstBloom - b.firstBloom),
    [state.flowers, lang],
  );

  const selectedFlowers = useMemo(
    () =>
      [...state.selected]
        .reverse()
        .map((id) => gardenFlowers.find((f) => f.id === id))
        .filter(Boolean),
    [state.selected, gardenFlowers],
  );

  const gardenIds = useMemo(
    () => new Set(state.flowers.map((f) => f.id)),
    [state.flowers],
  );

  const allFlowersEnriched = useMemo(
    () =>
      catalogFlowers.map((f) => ({
        ...f,
        displayName: f.names[lang],
        inGarden: gardenIds.has(f.id),
      })),
    [gardenIds, lang],
  );

  const setOwner = useCallback((v) => dispatch({ type: "SET_OWNER", value: v }), []);
  const setLabels = useCallback((v) => dispatch({ type: "SET_LABELS", value: v }), []);
  const toggleSelected = useCallback((id) => dispatch({ type: "TOGGLE_SELECTED", id }), []);
  const reorderSelected = useCallback((ids) => dispatch({ type: "REORDER_SELECTED", ids }), []);
  const toggleGarden = useCallback((id) => dispatch({ type: "TOGGLE_GARDEN", id }), []);

  return {
    owner: state.owner,
    labels: state.labels,
    selected: state.selected,
    gardenFlowers,
    selectedFlowers,
    allFlowers: allFlowersEnriched,
    setOwner,
    setLabels,
    toggleSelected,
    reorderSelected,
    toggleGarden,
  };
}
