import { useMemo, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import { raw as catalogRaw } from '../data/flowers';
import { parseMonths, firstBloomStart } from '../data/months';
import { LANG_STORAGE_KEY, SUPPORTED, saveLang } from '../i18n/i18n-utils';
import type {
  Lang,
  RawFlower,
  EnrichedFlower,
  GardenState,
  CustomFlowerData,
  ImportCallbacks,
} from '../types';

const GARDEN_SIZE = 8;
const SELECTED_SIZE = 4;
const DEFAULT_OWNER = 'Tainah Drummond';
export const STORAGE_KEY = 'jardin-radial';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const ai = a[i] as T;
    const aj = a[j] as T;
    [a[i], a[j]] = [aj, ai];
  }
  return a;
}

function pickRaw({
  id,
  names,
  scientificName,
  colors,
  months,
}: RawFlower): RawFlower {
  return { id, names, scientificName, colors, months };
}

function freshState(): GardenState {
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

export function isValidState(s: unknown): s is GardenState {
  return Boolean(
    s &&
    typeof s === 'object' &&
    Array.isArray((s as GardenState).defaultCatalog) &&
    Array.isArray((s as GardenState).garden) &&
    Array.isArray((s as GardenState).selected) &&
    typeof (s as GardenState).customFlowers === 'object' &&
    !Array.isArray((s as GardenState).customFlowers) &&
    typeof (s as GardenState).owner === 'string' &&
    typeof (s as GardenState).labels === 'boolean',
  );
}

export function reconcile(saved: GardenState): GardenState {
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

type GardenAction =
  | { type: 'SET_OWNER'; value: string }
  | { type: 'SET_LABELS'; value: boolean }
  | { type: 'TOGGLE_SELECTED'; id: string }
  | { type: 'REORDER_SELECTED'; ids: string[] }
  | { type: 'TOGGLE_GARDEN'; id: string }
  | { type: 'EDIT_FLOWER'; id: string; payload: CustomFlowerData }
  | { type: 'ADD_CUSTOM_FLOWER'; payload: { id: string } & CustomFlowerData }
  | { type: 'DELETE_FLOWER'; id: string }
  | { type: 'SAVE_SHARED' }
  | { type: 'DISMISS_SHARED' }
  | { type: 'IMPORT'; payload: GardenState }
  | { type: 'RESET' };

export type ShareResult =
  | { status: 'none' }
  | { status: 'valid'; state: GardenState }
  | { status: 'invalid' };

export function getSharedState(): ShareResult {
  if (typeof window === 'undefined') return { status: 'none' };
  const match = window.location.pathname.match(/^\/share\/(.+)/);
  if (!match) return { status: 'none' };
  try {
    const compressed = match[1];
    if (!compressed) return { status: 'invalid' };
    const decoded = JSON.parse(
      decompressFromEncodedURIComponent(compressed),
    ) as Record<string, unknown>;
    const { lang: sharedLang, ...gardenState } = decoded;
    if (!isValidState(gardenState)) return { status: 'invalid' };
    if (sharedLang && SUPPORTED.includes(sharedLang as Lang)) {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (!stored) saveLang(sharedLang as Lang);
    }
    return { status: 'valid', state: reconcile(gardenState) };
  } catch {
    return { status: 'invalid' };
  }
}

function loadFromStorage(): GardenState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const raw: Record<string, unknown> = JSON.parse(saved) as Record<
        string,
        unknown
      >;
      const parsed: unknown = raw.state ?? raw;
      if (isValidState(parsed))
        return { ...reconcile(parsed), isShared: false };
    }
  } catch {
    // Corrupted or invalid localStorage — start fresh
  }
  return null;
}

function initialState(): GardenState {
  if (typeof window === 'undefined') return freshState();
  const shared = getSharedState();
  if (shared.status === 'valid') return { ...shared.state, isShared: true };
  return loadFromStorage() ?? freshState();
}

export function reducer(state: GardenState, action: GardenAction): GardenState {
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
          const raw: Record<string, unknown> = JSON.parse(saved) as Record<
            string,
            unknown
          >;
          const parsed: unknown = raw.state ?? raw;
          if (isValidState(parsed))
            return { ...reconcile(parsed), isShared: false };
        }
      } catch {
        // Fall through to fresh
      }
      return freshState();
    }
    case 'IMPORT':
      return { ...action.payload, isShared: action.payload.isShared };
    case 'RESET':
      return freshState();
    default:
      return state;
  }
}

function stateSlice(state: GardenStoreState): GardenState {
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

interface GardenActions {
  setOwner: (v: string) => void;
  setLabels: (v: boolean) => void;
  toggleSelected: (id: string) => void;
  reorderSelected: (ids: string[]) => void;
  toggleGarden: (id: string) => void;
  editFlower: (id: string, data: CustomFlowerData) => void;
  addCustomFlower: (data: CustomFlowerData) => void;
  deleteFlower: (id: string) => void;
  reset: () => void;
  saveShared: () => void;
  dismissShared: () => void;
  importJson: (file: File, callbacks?: ImportCallbacks) => void;
}

type GardenStoreState = GardenState & GardenActions;

function dispatch(action: GardenAction): void {
  useGardenStore.setState((state) => reducer(stateSlice(state), action));
}

export const useGardenStore = create<GardenStoreState>()(
  persist(
    () => ({
      ...initialState(),

      setOwner: (v: string) => {
        dispatch({ type: 'SET_OWNER', value: v });
      },
      setLabels: (v: boolean) => {
        dispatch({ type: 'SET_LABELS', value: v });
      },
      toggleSelected: (id: string) => {
        dispatch({ type: 'TOGGLE_SELECTED', id });
      },
      reorderSelected: (ids: string[]) => {
        dispatch({ type: 'REORDER_SELECTED', ids });
      },
      toggleGarden: (id: string) => {
        dispatch({ type: 'TOGGLE_GARDEN', id });
      },
      editFlower: (id: string, data: CustomFlowerData) => {
        dispatch({ type: 'EDIT_FLOWER', id, payload: data });
      },
      addCustomFlower: (data: CustomFlowerData) => {
        dispatch({
          type: 'ADD_CUSTOM_FLOWER',
          payload: { id: crypto.randomUUID(), ...data },
        });
      },
      deleteFlower: (id: string) => {
        dispatch({ type: 'DELETE_FLOWER', id });
      },
      reset: () => {
        dispatch({ type: 'RESET' });
      },

      saveShared: () => {
        dispatch({ type: 'SAVE_SHARED' });
        window.history.replaceState(null, '', '/');
      },
      dismissShared: () => {
        dispatch({ type: 'DISMISS_SHARED' });
        window.history.pushState(null, '', '/');
      },
      importJson: (
        file: File,
        { onSuccess, onError }: ImportCallbacks = {},
      ) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed: unknown = JSON.parse(reader.result as string);
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
      partialize: (state: GardenStoreState) =>
        state.isShared ? undefined : stateSlice(state),
      merge: (persisted, current) => {
        const currentState = current as GardenStoreState;
        if (currentState.isShared) return currentState;
        return { ...currentState, ...(persisted as Partial<GardenState>) };
      },
    },
  ),
);

function enrich(
  flower: RawFlower & { id: string },
  lang: Lang,
): EnrichedFlower {
  const monthStates = parseMonths(flower.months);
  return {
    ...flower,
    monthStates,
    firstBloom: firstBloomStart(monthStates),
    displayName: flower.names[lang],
  };
}

export interface UseGardenReturn {
  owner: string;
  labels: boolean;
  selected: string[];
  isShared: boolean;
  gardenFlowers: EnrichedFlower[];
  selectedFlowers: EnrichedFlower[];
  allFlowers: EnrichedFlower[];
  setOwner: (v: string) => void;
  setLabels: (v: boolean) => void;
  toggleSelected: (id: string) => void;
  reorderSelected: (ids: string[]) => void;
  toggleGarden: (id: string) => void;
  editFlower: (id: string, data: CustomFlowerData) => void;
  addCustomFlower: (data: CustomFlowerData) => void;
  deleteFlower: (id: string) => void;
  reset: () => void;
  getShareUrl: () => string;
  exportJson: () => void;
  importJson: (file: File, callbacks?: ImportCallbacks) => void;
  saveShared: () => void;
  dismissShared: () => void;
}

export function useGarden(lang: Lang): UseGardenReturn {
  const store = useGardenStore();

  useEffect(() => {
    const handler = () => {
      const shared = getSharedState();
      if (shared.status === 'valid') {
        dispatch({
          type: 'IMPORT',
          payload: { ...shared.state, isShared: true },
        });
      } else if (useGardenStore.getState().isShared) {
        dispatch({ type: 'DISMISS_SHARED' });
      }
    };
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('popstate', handler);
    };
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
        ...enrich({ id, ...data } as RawFlower, lang),
        isCustom: true as const,
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
        .filter((f): f is EnrichedFlower => Boolean(f)),
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
      const data: Record<string, unknown> = {};
      for (const key of Object.keys(shareable)) {
        if (typeof (shareable as Record<string, unknown>)[key] !== 'function')
          data[key] = (shareable as Record<string, unknown>)[key];
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
      const data: Record<string, unknown> = {};
      for (const key of Object.keys(shareable)) {
        if (typeof (shareable as Record<string, unknown>)[key] !== 'function')
          data[key] = (shareable as Record<string, unknown>)[key];
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
