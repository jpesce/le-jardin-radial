import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reducer, type GardenAction } from './gardenReducer';
import {
  initialState,
  isValidState,
  reconcile,
  STORAGE_KEY,
} from './gardenReconciliation';
import type { GardenState, CustomFlowerData, ImportCallbacks } from '../types';

interface GardenActions {
  setOwner: (v: string) => void;
  setLabels: (v: boolean) => void;
  toggleSelected: (id: string) => void;
  reorderSelected: (ids: string[], draggedId?: string) => void;
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

/**
 * ID of the flower that was dragged in the most recent reorder.
 * Transient intent signal for animations — intentionally outside the Zustand
 * store to avoid re-renders and persistence serialization.
 */
export let lastDraggedId: string | null = null;

export function clearDraggedId(): void {
  lastDraggedId = null;
}

export function dispatch(action: GardenAction): void {
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
      reorderSelected: (ids: string[], draggedId?: string) => {
        lastDraggedId = draggedId ?? null;
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
