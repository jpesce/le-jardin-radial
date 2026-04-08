import { useReducer, useMemo, useCallback, useEffect } from "react";
import { raw as catalogRaw } from "../data/flowers.js";
import { parseMonths, firstBloomStart } from "../data/months.js";

const GARDEN_SIZE = 8;
const SELECTED_SIZE = 4;
const DEFAULT_OWNER = "Tainah Drummond";
const STORAGE_KEY = "jardin-radial";

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

function freshState() {
  const catalog = catalogRaw.map(pickRaw);
  const shuffled = shuffle(catalog);
  const garden = shuffled.slice(0, GARDEN_SIZE).map((f) => f.id);
  const selected = garden.slice(0, SELECTED_SIZE);

  return {
    owner: DEFAULT_OWNER,
    labels: true,
    defaultCatalog: catalog,
    garden,
    selected,
    customFlowers: {},
  };
}

function isValidState(s) {
  return (
    s &&
    Array.isArray(s.defaultCatalog) &&
    Array.isArray(s.garden) &&
    Array.isArray(s.selected) &&
    typeof s.customFlowers === "object" &&
    typeof s.owner === "string" &&
    typeof s.labels === "boolean"
  );
}

function reconcile(saved) {
  const currentCatalog = catalogRaw.map(pickRaw);
  const currentIds = new Set(currentCatalog.map((f) => f.id));
  const gardenSet = new Set(saved.garden);

  // Start with current catalog
  const merged = [...currentCatalog];

  // Keep saved catalog flowers that were removed from current BUT are in use
  for (const f of saved.defaultCatalog) {
    if (!currentIds.has(f.id) && (gardenSet.has(f.id) || f.id in saved.customFlowers)) {
      merged.push(f);
    }
  }

  // Clean garden/selected: remove IDs that no longer exist anywhere
  const allIds = new Set([...merged.map((f) => f.id), ...Object.keys(saved.customFlowers)]);

  return {
    ...saved,
    defaultCatalog: merged,
    garden: saved.garden.filter((id) => allIds.has(id)),
    selected: saved.selected.filter((id) => allIds.has(id)),
  };
}

function initialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isValidState(parsed)) return reconcile(parsed);
    }
  } catch {}
  return freshState();
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
      if (!state.garden.includes(id)) return state;
      return { ...state, selected: [...state.selected, id] };
    }
    case "REORDER_SELECTED":
      return { ...state, selected: action.ids };
    case "TOGGLE_GARDEN": {
      const id = action.id;
      if (state.garden.includes(id)) {
        return {
          ...state,
          garden: state.garden.filter((x) => x !== id),
          selected: state.selected.filter((x) => x !== id),
        };
      }
      const known = state.defaultCatalog.some((f) => f.id === id) || id in state.customFlowers;
      if (!known) return state;
      return {
        ...state,
        garden: [...state.garden, id],
        selected: [...state.selected, id],
      };
    }
    case "EDIT_FLOWER":
      return {
        ...state,
        customFlowers: {
          ...state.customFlowers,
          [action.id]: {
            ...(state.customFlowers[action.id] || {}),
            ...action.payload,
          },
        },
      };
    case "ADD_CUSTOM_FLOWER": {
      const { id, ...data } = action.payload;
      return {
        ...state,
        customFlowers: { ...state.customFlowers, [id]: data },
        garden: [...state.garden, id],
        selected: [...state.selected, id],
      };
    }
    case "DELETE_FLOWER": {
      const { [action.id]: _, ...rest } = state.customFlowers;
      return {
        ...state,
        customFlowers: rest,
        garden: state.garden.filter((x) => x !== action.id),
        selected: state.selected.filter((x) => x !== action.id),
      };
    }
    case "RESET":
      return freshState();
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

  // Auto-save to localStorage on every state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // All available flowers: catalog merged with overrides + pure custom entries
  const catalogIds = useMemo(
    () => new Set(state.defaultCatalog.map((f) => f.id)),
    [state.defaultCatalog],
  );

  const availableFlowers = useMemo(() => {
    const fromCatalog = state.defaultCatalog.map((f) => {
      const override = state.customFlowers[f.id];
      return enrich(override ? { ...f, ...override } : f, lang);
    });
    const custom = Object.entries(state.customFlowers)
      .filter(([id]) => !catalogIds.has(id))
      .map(([id, data]) => ({ ...enrich({ id, ...data }, lang), isCustom: true }));
    const sortedCatalog = fromCatalog.sort((a, b) => a.firstBloom - b.firstBloom);
    const sortedCustom = custom.sort((a, b) => a.firstBloom - b.firstBloom);
    return [...sortedCustom, ...sortedCatalog];
  }, [state.defaultCatalog, state.customFlowers, catalogIds, lang]);

  // Garden flowers: available flowers that are in the garden
  const gardenSet = useMemo(() => new Set(state.garden), [state.garden]);

  const gardenFlowers = useMemo(
    () => availableFlowers.filter((f) => gardenSet.has(f.id)),
    [availableFlowers, gardenSet],
  );

  // Selected flowers: garden flowers on the chart (reversed for ring order)
  const selectedFlowers = useMemo(
    () =>
      [...state.selected]
        .reverse()
        .map((id) => gardenFlowers.find((f) => f.id === id))
        .filter(Boolean),
    [state.selected, gardenFlowers],
  );

  // All flowers for manage view: available flowers with inGarden flag
  const allFlowers = useMemo(
    () => availableFlowers.map((f) => ({ ...f, inGarden: gardenSet.has(f.id) })),
    [availableFlowers, gardenSet],
  );

  const setOwner = useCallback((v) => dispatch({ type: "SET_OWNER", value: v }), []);
  const setLabels = useCallback((v) => dispatch({ type: "SET_LABELS", value: v }), []);
  const toggleSelected = useCallback((id) => dispatch({ type: "TOGGLE_SELECTED", id }), []);
  const reorderSelected = useCallback((ids) => dispatch({ type: "REORDER_SELECTED", ids }), []);
  const toggleGarden = useCallback((id) => dispatch({ type: "TOGGLE_GARDEN", id }), []);
  const editFlower = useCallback((id, data) => dispatch({ type: "EDIT_FLOWER", id, payload: data }), []);
  const addCustomFlower = useCallback((data) => {
    dispatch({ type: "ADD_CUSTOM_FLOWER", payload: { id: crypto.randomUUID(), ...data } });
  }, []);
  const deleteFlower = useCallback((id) => dispatch({ type: "DELETE_FLOWER", id }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    owner: state.owner,
    labels: state.labels,
    selected: state.selected,
    gardenFlowers,
    selectedFlowers,
    allFlowers,
    setOwner,
    setLabels,
    toggleSelected,
    reorderSelected,
    toggleGarden,
    editFlower,
    addCustomFlower,
    deleteFlower,
    reset,
  };
}
