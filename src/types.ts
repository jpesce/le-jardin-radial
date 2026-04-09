export type FlowerState = 'dormant' | 'sprouting' | 'foliage' | 'blooming';

export type MonthStates = FlowerState[];

export type MonthsConfig = Record<string, FlowerState>;

export interface RawFlower {
  id: string;
  names: { en: string; fr: string };
  scientificName: string;
  colors: { blooming: string };
  months: MonthsConfig;
}

export interface EnrichedFlower extends RawFlower {
  monthStates: FlowerState[];
  firstBloom: number;
  displayName: string;
  isCustom?: boolean;
  inGarden?: boolean;
}

export type CustomFlowerData = Partial<Omit<RawFlower, 'id'>>;

export interface GardenState {
  owner: string;
  labels: boolean;
  defaultCatalog: RawFlower[];
  garden: string[];
  selected: string[];
  customFlowers: Record<string, CustomFlowerData>;
  isShared: boolean;
}

export type Lang = 'en' | 'fr';

export interface BloomRange {
  start: number;
  end: number;
}
