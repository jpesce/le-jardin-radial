import { describe, it, expect } from 'vitest';
import { reducer, isValidState, reconcile } from './useGarden';
import type { GardenState, RawFlower } from '../types';

const flower = (id: string): RawFlower => ({
  id,
  names: { en: id, fr: id },
  scientificName: '',
  colors: { blooming: '#fff' },
  months: { '1-12': 'dormant' },
});

const baseState = (): GardenState => ({
  owner: 'Test',
  labels: true,
  defaultCatalog: [flower('rose'), flower('tulip'), flower('lily')],
  garden: ['rose', 'tulip'],
  selected: ['rose'],
  customFlowers: {},
  isShared: false,
});

describe('reducer', () => {
  describe('SET_OWNER', () => {
    it('updates owner', () => {
      const state = baseState();
      const next = reducer(state, { type: 'SET_OWNER', value: 'Alice' });
      expect(next.owner).toBe('Alice');
    });

    it('does not mutate other state', () => {
      const state = baseState();
      const next = reducer(state, { type: 'SET_OWNER', value: 'Alice' });
      expect(next.garden).toBe(state.garden);
      expect(next.selected).toBe(state.selected);
    });
  });

  describe('SET_LABELS', () => {
    it('toggles labels', () => {
      const state = baseState();
      const next = reducer(state, { type: 'SET_LABELS', value: false });
      expect(next.labels).toBe(false);
    });
  });

  describe('TOGGLE_SELECTED', () => {
    it('adds garden flower to selected', () => {
      const state = baseState();
      const next = reducer(state, { type: 'TOGGLE_SELECTED', id: 'tulip' });
      expect(next.selected).toContain('tulip');
    });

    it('removes flower from selected', () => {
      const state = baseState();
      const next = reducer(state, { type: 'TOGGLE_SELECTED', id: 'rose' });
      expect(next.selected).not.toContain('rose');
    });

    it('does not add flower not in garden', () => {
      const state = baseState();
      const next = reducer(state, { type: 'TOGGLE_SELECTED', id: 'lily' });
      expect(next.selected).not.toContain('lily');
      expect(next.selected).toEqual(state.selected);
    });

    it('does not add unknown flower', () => {
      const state = baseState();
      const next = reducer(state, {
        type: 'TOGGLE_SELECTED',
        id: 'nonexistent',
      });
      expect(next).toBe(state);
    });

    it('preserves order when adding', () => {
      const state = { ...baseState(), selected: ['rose'] };
      const next = reducer(state, { type: 'TOGGLE_SELECTED', id: 'tulip' });
      expect(next.selected).toEqual(['rose', 'tulip']);
    });
  });

  describe('REORDER_SELECTED', () => {
    it('replaces selected array', () => {
      const state = { ...baseState(), selected: ['rose', 'tulip'] };
      const next = reducer(state, {
        type: 'REORDER_SELECTED',
        ids: ['tulip', 'rose'],
      });
      expect(next.selected).toEqual(['tulip', 'rose']);
    });
  });

  describe('TOGGLE_GARDEN', () => {
    it('removes flower from garden', () => {
      const state = baseState();
      const next = reducer(state, { type: 'TOGGLE_GARDEN', id: 'rose' });
      expect(next.garden).not.toContain('rose');
    });

    it('also removes from selected when removing from garden', () => {
      const state = baseState();
      const next = reducer(state, { type: 'TOGGLE_GARDEN', id: 'rose' });
      expect(next.selected).not.toContain('rose');
    });

    it('adds catalog flower to garden', () => {
      const state = baseState();
      const next = reducer(state, { type: 'TOGGLE_GARDEN', id: 'lily' });
      expect(next.garden).toContain('lily');
    });

    it('auto-selects when adding to garden', () => {
      const state = baseState();
      const next = reducer(state, { type: 'TOGGLE_GARDEN', id: 'lily' });
      expect(next.selected).toContain('lily');
    });

    it('rejects unknown flower', () => {
      const state = baseState();
      const next = reducer(state, {
        type: 'TOGGLE_GARDEN',
        id: 'nonexistent',
      });
      expect(next).toBe(state);
    });

    it('adds custom flower to garden', () => {
      const state: GardenState = {
        ...baseState(),
        customFlowers: {
          'custom-1': {
            names: { en: 'Custom', fr: 'Custom' },
            months: { '1-12': 'dormant' },
          },
        },
      };
      const next = reducer(state, { type: 'TOGGLE_GARDEN', id: 'custom-1' });
      expect(next.garden).toContain('custom-1');
      expect(next.selected).toContain('custom-1');
    });
  });

  describe('EDIT_FLOWER', () => {
    it('creates override for catalog flower', () => {
      const state = baseState();
      const next = reducer(state, {
        type: 'EDIT_FLOWER',
        id: 'rose',
        payload: { colors: { blooming: '#ff0000' } },
      });
      expect(next.customFlowers.rose).toEqual({
        colors: { blooming: '#ff0000' },
      });
    });

    it('merges with existing override', () => {
      const state: GardenState = {
        ...baseState(),
        customFlowers: { rose: { colors: { blooming: '#ff0000' } } },
      };
      const next = reducer(state, {
        type: 'EDIT_FLOWER',
        id: 'rose',
        payload: { scientificName: 'Rosa' },
      });
      expect(next.customFlowers.rose).toEqual({
        colors: { blooming: '#ff0000' },
        scientificName: 'Rosa',
      });
    });

    it('does not affect garden or selected', () => {
      const state = baseState();
      const next = reducer(state, {
        type: 'EDIT_FLOWER',
        id: 'rose',
        payload: { colors: { blooming: '#ff0000' } },
      });
      expect(next.garden).toBe(state.garden);
      expect(next.selected).toBe(state.selected);
    });
  });

  describe('ADD_CUSTOM_FLOWER', () => {
    it('adds to customFlowers, garden, and selected', () => {
      const state = baseState();
      const next = reducer(state, {
        type: 'ADD_CUSTOM_FLOWER',
        payload: {
          id: 'custom-1',
          names: { en: 'My Flower', fr: 'Ma Fleur' },
          months: { '6-8': 'blooming', '1-5': 'dormant', '9-12': 'dormant' },
        },
      });
      const custom = next.customFlowers['custom-1'];
      expect(custom).toBeDefined();
      expect(custom?.names?.en).toBe('My Flower');
      expect(next.garden).toContain('custom-1');
      expect(next.selected).toContain('custom-1');
    });

    it('does not store id inside customFlowers data', () => {
      const state = baseState();
      const next = reducer(state, {
        type: 'ADD_CUSTOM_FLOWER',
        payload: { id: 'custom-1', names: { en: 'X', fr: 'X' }, months: {} },
      });
      expect(
        (next.customFlowers['custom-1'] as Record<string, unknown>).id,
      ).toBeUndefined();
    });
  });

  describe('DELETE_FLOWER', () => {
    it('removes from customFlowers', () => {
      const state: GardenState = {
        ...baseState(),
        customFlowers: { 'custom-1': { names: { en: 'X', fr: 'X' } } },
        garden: ['rose', 'custom-1'],
        selected: ['rose', 'custom-1'],
      };
      const next = reducer(state, { type: 'DELETE_FLOWER', id: 'custom-1' });
      expect(next.customFlowers['custom-1']).toBeUndefined();
    });

    it('removes from garden and selected', () => {
      const state: GardenState = {
        ...baseState(),
        customFlowers: { 'custom-1': { names: { en: 'X', fr: 'X' } } },
        garden: ['rose', 'custom-1'],
        selected: ['rose', 'custom-1'],
      };
      const next = reducer(state, { type: 'DELETE_FLOWER', id: 'custom-1' });
      expect(next.garden).not.toContain('custom-1');
      expect(next.selected).not.toContain('custom-1');
    });

    it('preserves other flowers', () => {
      const state: GardenState = {
        ...baseState(),
        customFlowers: {
          'custom-1': { names: { en: 'X', fr: 'X' } },
          'custom-2': { names: { en: 'Y', fr: 'Y' } },
        },
        garden: ['rose', 'custom-1', 'custom-2'],
      };
      const next = reducer(state, { type: 'DELETE_FLOWER', id: 'custom-1' });
      expect(next.customFlowers['custom-2']).toBeDefined();
      expect(next.garden).toContain('custom-2');
    });
  });

  describe('RESET', () => {
    it('returns a fresh state', () => {
      const state: GardenState = {
        ...baseState(),
        owner: 'Modified',
        customFlowers: { x: {} },
      };
      const next = reducer(state, { type: 'RESET' });
      expect(next.owner).toBe('Tainah Drummond');
      expect(next.customFlowers).toEqual({});
    });

    it('has garden and selected arrays', () => {
      const next = reducer(baseState(), { type: 'RESET' });
      expect(Array.isArray(next.garden)).toBe(true);
      expect(Array.isArray(next.selected)).toBe(true);
      expect(next.garden.length).toBeGreaterThan(0);
      expect(next.selected.length).toBeGreaterThan(0);
    });
  });

  describe('SAVE_SHARED', () => {
    it('sets isShared to false', () => {
      const state = { ...baseState(), isShared: true };
      const next = reducer(state, { type: 'SAVE_SHARED' });
      expect(next.isShared).toBe(false);
    });

    it('preserves garden state', () => {
      const state = { ...baseState(), isShared: true };
      const next = reducer(state, { type: 'SAVE_SHARED' });
      expect(next.owner).toBe(state.owner);
      expect(next.garden).toBe(state.garden);
      expect(next.selected).toBe(state.selected);
    });
  });

  describe('DISMISS_SHARED', () => {
    it('returns fresh state when no localStorage', () => {
      const state = { ...baseState(), isShared: true, owner: 'Shared User' };
      const next = reducer(state, { type: 'DISMISS_SHARED' });
      expect(next.isShared).toBe(false);
      expect(next.owner).toBe('Tainah Drummond');
    });
  });

  describe('shared garden flow', () => {
    it('dismiss then re-import restores shared state (back button)', () => {
      const shared = { ...baseState(), owner: 'Shared', isShared: true };
      let state = reducer(baseState(), { type: 'IMPORT', payload: shared });
      expect(state.isShared).toBe(true);
      expect(state.owner).toBe('Shared');

      state = reducer(state, { type: 'DISMISS_SHARED' });
      expect(state.isShared).toBe(false);

      state = reducer(state, {
        type: 'IMPORT',
        payload: { ...shared, isShared: true },
      });
      expect(state.isShared).toBe(true);
      expect(state.owner).toBe('Shared');
    });

    it('save then re-import shows shared view again', () => {
      const shared = { ...baseState(), owner: 'Shared', isShared: true };
      let state = reducer(baseState(), { type: 'IMPORT', payload: shared });

      state = reducer(state, { type: 'SAVE_SHARED' });
      expect(state.isShared).toBe(false);
      expect(state.owner).toBe('Shared');

      state = reducer(state, {
        type: 'IMPORT',
        payload: { ...shared, isShared: true },
      });
      expect(state.isShared).toBe(true);
    });
  });

  describe('IMPORT', () => {
    it('replaces state with payload', () => {
      const state = baseState();
      const imported: GardenState = {
        ...baseState(),
        owner: 'Imported',
        garden: ['lily'],
        selected: ['lily'],
      };
      const next = reducer(state, { type: 'IMPORT', payload: imported });
      expect(next.owner).toBe('Imported');
      expect(next.garden).toEqual(['lily']);
    });

    it('defaults isShared to false when not in payload', () => {
      const state = baseState();
      const imported: GardenState = { ...baseState(), owner: 'Imported' };
      const next = reducer(state, { type: 'IMPORT', payload: imported });
      expect(next.isShared).toBe(false);
    });

    it('preserves isShared when set in payload', () => {
      const state = baseState();
      const imported: GardenState = { ...baseState(), isShared: true };
      const next = reducer(state, { type: 'IMPORT', payload: imported });
      expect(next.isShared).toBe(true);
    });
  });

  describe('unknown action', () => {
    it('returns state unchanged', () => {
      const state = baseState();
      const next = reducer(state, { type: 'UNKNOWN' } as never);
      expect(next).toBe(state);
    });
  });
});

describe('isValidState', () => {
  it('accepts valid state', () => {
    expect(isValidState(baseState())).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidState(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isValidState(undefined)).toBe(false);
  });

  it('rejects missing defaultCatalog', () => {
    const s = baseState() as unknown as Record<string, unknown>;
    delete s.defaultCatalog;
    expect(isValidState(s)).toBe(false);
  });

  it('rejects non-array garden', () => {
    expect(isValidState({ ...baseState(), garden: 'not-array' })).toBe(false);
  });

  it('rejects non-array selected', () => {
    expect(isValidState({ ...baseState(), selected: {} })).toBe(false);
  });

  it('rejects non-object customFlowers', () => {
    expect(isValidState({ ...baseState(), customFlowers: [] })).toBe(false);
  });

  it('rejects non-string owner', () => {
    expect(isValidState({ ...baseState(), owner: 123 })).toBe(false);
  });

  it('rejects non-boolean labels', () => {
    expect(isValidState({ ...baseState(), labels: 'yes' })).toBe(false);
  });
});

describe('reconcile', () => {
  it('preserves saved state when catalog unchanged', () => {
    const saved: GardenState = {
      ...baseState(),
      owner: 'Custom Owner',
      garden: ['rose'],
      selected: ['rose'],
    };
    const result = reconcile(saved);
    expect(result.owner).toBe('Custom Owner');
    expect(result.garden).toContain('rose');
    expect(result.selected).toContain('rose');
  });

  it('adds new catalog flowers to defaultCatalog', () => {
    const saved: GardenState = {
      ...baseState(),
      defaultCatalog: [flower('rose')],
    };
    const result = reconcile(saved);
    expect(result.defaultCatalog.length).toBeGreaterThan(1);
  });

  it('removes unused catalog flowers that were deleted from catalog', () => {
    const saved: GardenState = {
      ...baseState(),
      defaultCatalog: [flower('rose'), flower('tulip'), flower('old-flower')],
      garden: ['rose'],
      selected: ['rose'],
    };
    const result = reconcile(saved);
    expect(
      result.defaultCatalog.find((f) => f.id === 'old-flower'),
    ).toBeFalsy();
  });

  it('keeps removed catalog flower if in garden', () => {
    const saved: GardenState = {
      ...baseState(),
      defaultCatalog: [flower('rose'), flower('old-flower')],
      garden: ['rose', 'old-flower'],
      selected: ['rose'],
    };
    const result = reconcile(saved);
    expect(
      result.defaultCatalog.find((f) => f.id === 'old-flower'),
    ).toBeTruthy();
    expect(result.garden).toContain('old-flower');
  });

  it('keeps removed catalog flower if in customFlowers', () => {
    const saved: GardenState = {
      ...baseState(),
      defaultCatalog: [flower('rose'), flower('old-flower')],
      garden: ['rose'],
      customFlowers: { 'old-flower': { colors: { blooming: '#000' } } },
    };
    const result = reconcile(saved);
    expect(
      result.defaultCatalog.find((f) => f.id === 'old-flower'),
    ).toBeTruthy();
  });

  it('cleans garden IDs that no longer exist', () => {
    const saved: GardenState = {
      ...baseState(),
      garden: ['rose', 'phantom-id'],
      selected: ['rose', 'phantom-id'],
    };
    const result = reconcile(saved);
    expect(result.garden).not.toContain('phantom-id');
    expect(result.selected).not.toContain('phantom-id');
  });

  it('preserves custom flower IDs in garden', () => {
    const saved: GardenState = {
      ...baseState(),
      garden: ['rose', 'custom-uuid'],
      selected: ['rose'],
      customFlowers: {
        'custom-uuid': {
          names: { en: 'My Flower', fr: 'Ma Fleur' },
          months: { '1-12': 'dormant' },
        },
      },
    };
    const result = reconcile(saved);
    expect(result.garden).toContain('custom-uuid');
  });
});
