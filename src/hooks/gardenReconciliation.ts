import { decompressFromEncodedURIComponent } from 'lz-string';
import { raw as catalogRaw } from '../data/flowers';
import { LANG_STORAGE_KEY, SUPPORTED, saveLang } from '../i18n/i18n-utils';
import type { Lang, RawFlower, GardenState } from '../types';

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

export function freshState(): GardenState {
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

export function loadFromStorage(): GardenState | null {
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

export function initialState(): GardenState {
  if (typeof window === 'undefined') return freshState();
  const shared = getSharedState();
  if (shared.status === 'valid') return { ...shared.state, isShared: true };
  return loadFromStorage() ?? freshState();
}
