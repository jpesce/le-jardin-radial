import { useMemo, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import { raw as catalogRaw } from '../data/flowers.js';
import { parseMonths, firstBloomStart } from '../data/months.js';
import { LANG_STORAGE_KEY, SUPPORTED, saveLang } from '../i18n/i18n-utils.js';

const GARDEN_SIZE = 8;
const SELECTED_SIZE = 4;
const DEFAULT_OWNER = 'Tainah Drummond';
const STORAGE_KEY = 'jardin-radial';

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
    isShared: false,
  };
}

export function isValidState(s) {
  return Boolean(
    s &&
    Array.isArray(s.defaultCatalog) &&
    Array.isArray(s.garden) &&
    Array.isArray(s.selected) &&
    typeof s.customFlowers === 'object' &&
    !Array.isArray(s.customFlowers) &&
    typeof s.owner === 'string' &&
    typeof s.labels === 'boolean',
  );
}

export function reconcile(saved) {
  const currentCatalog = catalogRaw.map(pickRaw);
  const currentIds = new Set(currentCatalog.map((f) => f.id));
  const gardenSet = new Set(saved.garden);

  const merged = [...currentCatalog];

  for (const f of saved.defaultCatalog) {
    if (
      !currentIds.has(f.id) &&
      (gardenSet.has(f.id) || f.id in saved.customFlowers)
    ) {
      merged.push(f);
    }
  }

  const allIds = new Set([
    ...merged.map((f) => f.id),
    ...Object.keys(saved.customFlowers),
  ]);

  return {
    ...saved,
    defaultCatalog: merged,
    garden: saved.garden.filter((id) => allIds.has(id)),
    selected: saved.selected.filter((id) => allIds.has(id)),
  };
}

function getSharedState() {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/^\/share\/(.+)/);
  if (!match) return null;
  try {
    const decoded = JSON.parse(decompressFromEncodedURIComponent(match[1]));
    const { lang: sharedLang, ...gardenState } = decoded;
    if (!isValidState(gardenState)) return null;
    if (sharedLang && SUPPORTED.includes(sharedLang)) {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (!stored) saveLang(sharedLang);
    }
    return reconcile(gardenState);
  } catch {
    console.warn('Invalid share URL');
  }
  return null;
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const raw = JSON.parse(saved);
      // Support both Zustand persist format ({ state: {...} }) and raw format
      const parsed = raw.state ?? raw;
      if (isValidState(parsed))
        return { ...reconcile(parsed), isShared: false };
    }
  } catch {
    // Corrupted or invalid localStorage — start fresh
  }
  return null;
}

function initialState() {
  if (typeof window === 'undefined') return freshState();
  // Share URL takes priority
  const shared = getSharedState();
  if (shared) return { ...shared, isShared: true };
  // Then localStorage (read synchronously to avoid flash)
  return loadFromStorage() ?? freshState();
}

// Reducer kept as a pure function for testability
export function reducer(state, action) {
  switch (action.type) {
    case 'SET_OWNER':
      return { ...state, owner: action.value };
    case 'SET_LABELS':
      return { ...state, labels: action.value };
    case 'TOGGLE_SELECTED': {
      const id = action.id;
      if (state.selected.includes(id)) {
        return { ...state, selected: state.selected.filter((x) => x !== id) };
      }
      if (!state.garden.includes(id)) return state;
      return { ...state, selected: [...state.selected, id] };
    }
    case 'REORDER_SELECTED':
      return { ...state, selected: action.ids };
    case 'TOGGLE_GARDEN': {
      const id = action.id;
      if (state.garden.includes(id)) {
        return {
          ...state,
          garden: state.garden.filter((x) => x !== id),
          selected: state.selected.filter((x) => x !== id),
        };
      }
      const known =
        state.defaultCatalog.some((f) => f.id === id) ||
        id in state.customFlowers;
      if (!known) return state;
      return {
        ...state,
        garden: [...state.garden, id],
        selected: [...state.selected, id],
      };
    }
    case 'EDIT_FLOWER':
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
    case 'ADD_CUSTOM_FLOWER': {
      const { id, ...data } = action.payload;
      return {
        ...state,
        customFlowers: { ...state.customFlowers, [id]: data },
        garden: [...state.garden, id],
        selected: [...state.selected, id],
      };
    }
    case 'DELETE_FLOWER': {
      const { [action.id]: _, ...rest } = state.customFlowers;
      return {
        ...state,
        customFlowers: rest,
        garden: state.garden.filter((x) => x !== action.id),
        selected: state.selected.filter((x) => x !== action.id),
      };
    }
    case 'SAVE_SHARED':
      return { ...state, isShared: false };
    case 'DISMISS_SHARED': {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const raw = JSON.parse(saved);
          const parsed = raw.state ?? raw;
          if (isValidState(parsed))
            return { ...reconcile(parsed), isShared: false };
        }
      } catch {
        // Fall through to fresh
      }
      return freshState();
    }
    case 'IMPORT':
      return { ...action.payload, isShared: action.payload.isShared ?? false };
    case 'RESET':
      return freshState();
    default:
      return state;
  }
}

function stateSlice(state) {
  return {
    owner: state.owner,
    labels: state.labels,
    defaultCatalog: state.defaultCatalog,
    garden: state.garden,
    selected: state.selected,
    customFlowers: state.customFlowers,
    isShared: state.isShared,
  };
}

function dispatch(action) {
  useGardenStore.setState((state) => reducer(stateSlice(state), action));
}

export const useGardenStore = create(
  persist(
    () => ({
      ...initialState(),

      // Actions
      setOwner: (v) => dispatch({ type: 'SET_OWNER', value: v }),
      setLabels: (v) => dispatch({ type: 'SET_LABELS', value: v }),
      toggleSelected: (id) => dispatch({ type: 'TOGGLE_SELECTED', id }),
      reorderSelected: (ids) => dispatch({ type: 'REORDER_SELECTED', ids }),
      toggleGarden: (id) => dispatch({ type: 'TOGGLE_GARDEN', id }),
      editFlower: (id, data) =>
        dispatch({ type: 'EDIT_FLOWER', id, payload: data }),
      addCustomFlower: (data) =>
        dispatch({
          type: 'ADD_CUSTOM_FLOWER',
          payload: { id: crypto.randomUUID(), ...data },
        }),
      deleteFlower: (id) => dispatch({ type: 'DELETE_FLOWER', id }),
      reset: () => dispatch({ type: 'RESET' }),

      saveShared: () => {
        dispatch({ type: 'SAVE_SHARED' });
        // replaceState: share URL is consumed, back button won't re-show shared view
        window.history.replaceState(null, '', '/');
      },
      dismissShared: () => {
        dispatch({ type: 'DISMISS_SHARED' });
        // pushState (not replace): keeps share URL in history so back button works
        window.history.pushState(null, '', '/');
      },
      importJson: (file, { onSuccess, onError } = {}) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            if (isValidState(parsed)) {
              dispatch({ type: 'IMPORT', payload: reconcile(parsed) });
              onSuccess?.();
            } else {
              onError?.('invalid');
            }
          } catch {
            onError?.('parse');
          }
        };
        reader.readAsText(file);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => (state.isShared ? undefined : stateSlice(state)),
      merge: (persisted, current) => {
        // Don't let persisted state override a shared garden loaded from URL
        if (current.isShared) return current;
        return { ...current, ...persisted };
      },
    },
  ),
);

// Derived state: enrich flowers with month data and display names
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
  const store = useGardenStore();

  // Re-check share URL on browser back/forward
  useEffect(() => {
    const handler = () => {
      const shared = getSharedState();
      if (shared) {
        dispatch({ type: 'IMPORT', payload: { ...shared, isShared: true } });
      } else if (useGardenStore.getState().isShared) {
        dispatch({ type: 'DISMISS_SHARED' });
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const catalogIds = useMemo(
    () => new Set(store.defaultCatalog.map((f) => f.id)),
    [store.defaultCatalog],
  );

  const availableFlowers = useMemo(() => {
    const fromCatalog = store.defaultCatalog.map((f) => {
      const override = store.customFlowers[f.id];
      return enrich(override ? { ...f, ...override } : f, lang);
    });
    const custom = Object.entries(store.customFlowers)
      .filter(([id]) => !catalogIds.has(id))
      .map(([id, data]) => ({
        ...enrich({ id, ...data }, lang),
        isCustom: true,
      }));
    const sortedCatalog = fromCatalog.sort(
      (a, b) => a.firstBloom - b.firstBloom,
    );
    const sortedCustom = custom.sort((a, b) => a.firstBloom - b.firstBloom);
    return [...sortedCustom, ...sortedCatalog];
  }, [store.defaultCatalog, store.customFlowers, catalogIds, lang]);

  const gardenSet = useMemo(() => new Set(store.garden), [store.garden]);

  const gardenFlowers = useMemo(
    () => availableFlowers.filter((f) => gardenSet.has(f.id)),
    [availableFlowers, gardenSet],
  );

  const selectedFlowers = useMemo(
    () =>
      [...store.selected]
        .reverse()
        .map((id) => gardenFlowers.find((f) => f.id === id))
        .filter(Boolean),
    [store.selected, gardenFlowers],
  );

  const allFlowers = useMemo(
    () =>
      availableFlowers.map((f) => ({ ...f, inGarden: gardenSet.has(f.id) })),
    [availableFlowers, gardenSet],
  );

  const getShareUrl = useMemo(() => {
    return () => {
      const state = useGardenStore.getState();
      const { isShared: _, defaultCatalog, ...shareable } = state;
      const shareSet = new Set(state.garden);
      const minimalCatalog = defaultCatalog.filter((f) => shareSet.has(f.id));
      // Strip action functions
      const data = {};
      for (const key of Object.keys(shareable)) {
        if (typeof shareable[key] !== 'function') data[key] = shareable[key];
      }
      const payload = { ...data, defaultCatalog: minimalCatalog, lang };
      const compressed = compressToEncodedURIComponent(JSON.stringify(payload));
      return `${window.location.origin}/share/${compressed}`;
    };
  }, [lang]);

  const exportJson = useMemo(() => {
    return () => {
      const state = useGardenStore.getState();
      const { isShared: _, ...shareable } = state;
      const data = {};
      for (const key of Object.keys(shareable)) {
        if (typeof shareable[key] !== 'function') data[key] = shareable[key];
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jardin-radial-${state.owner.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
  }, []);

  return {
    owner: store.owner,
    labels: store.labels,
    selected: store.selected,
    isShared: store.isShared,
    gardenFlowers,
    selectedFlowers,
    allFlowers,
    setOwner: store.setOwner,
    setLabels: store.setLabels,
    toggleSelected: store.toggleSelected,
    reorderSelected: store.reorderSelected,
    toggleGarden: store.toggleGarden,
    editFlower: store.editFlower,
    addCustomFlower: store.addCustomFlower,
    deleteFlower: store.deleteFlower,
    reset: store.reset,
    getShareUrl,
    exportJson,
    importJson: store.importJson,
    saveShared: store.saveShared,
    dismissShared: store.dismissShared,
  };
}
