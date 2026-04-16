import { useMemo, useEffect } from 'react';
import { compressToEncodedURIComponent } from 'lz-string';
import { parseMonths, firstBloomStart } from '../data/months';
import { useGardenStore, dispatch } from './gardenStore';
import { getSharedState } from './gardenReconciliation';
import type {
  Lang,
  RawFlower,
  EnrichedFlower,
  CustomFlowerData,
  ImportCallbacks,
} from '../types';

// Re-exports for consumers (App.tsx, ErrorBoundary.tsx, tests)
export {
  STORAGE_KEY,
  isValidState,
  reconcile,
  getSharedState,
} from './gardenReconciliation';
export type { ShareResult } from './gardenReconciliation';
export { reducer } from './gardenReducer';
export type { GardenAction } from './gardenReducer';

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
  reorderSelected: (ids: string[], draggedId?: string) => void;
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
