import {
  freshState,
  isValidState,
  reconcile,
  STORAGE_KEY,
} from './gardenReconciliation';
import type { GardenState, CustomFlowerData } from '../types';

export type GardenAction =
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
