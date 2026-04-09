// Deterministic garden state for visual regression tests.
// Uses the first 8 catalog flowers with the first 4 selected.
export const SEED_STATE = {
  state: {
    owner: 'Tainah Drummond',
    labels: true,
    defaultCatalog: [
      {
        id: 'snowdrop',
        names: { en: 'Snowdrop', fr: 'Perce-neige' },
        scientificName: 'Galanthus nivalis',
        colors: { blooming: '#F0F0F0' },
        months: {
          '1-2': 'blooming',
          3: 'foliage',
          4: 'dormant',
          '5-12': 'dormant',
        },
      },
      {
        id: 'crocus',
        names: { en: 'Crocus', fr: 'Crocus' },
        scientificName: 'Crocus vernus',
        colors: { blooming: '#9B59B6' },
        months: {
          1: 'dormant',
          '2-3': 'blooming',
          4: 'foliage',
          '5-12': 'dormant',
        },
      },
      {
        id: 'daffodil',
        names: { en: 'Daffodil', fr: 'Jonquille' },
        scientificName: 'Narcissus pseudonarcissus',
        colors: { blooming: '#F1C40F' },
        months: {
          '1-2': 'dormant',
          '3-4': 'blooming',
          5: 'foliage',
          '6-12': 'dormant',
        },
      },
      {
        id: 'hyacinth',
        names: { en: 'Hyacinth', fr: 'Jacinthe' },
        scientificName: 'Hyacinthus orientalis',
        colors: { blooming: '#3498DB' },
        months: {
          '1-2': 'dormant',
          '3-4': 'blooming',
          5: 'foliage',
          '6-12': 'dormant',
        },
      },
      {
        id: 'tulip',
        names: { en: 'Tulip', fr: 'Tulipe' },
        scientificName: 'Tulipa',
        colors: { blooming: '#E74C3C' },
        months: {
          '1-2': 'dormant',
          '3-5': 'blooming',
          6: 'foliage',
          '7-12': 'dormant',
        },
      },
      {
        id: 'pansy',
        names: { en: 'Pansy', fr: 'Pensée' },
        scientificName: 'Viola tricolor',
        colors: { blooming: '#8E44AD' },
        months: {
          '1-2': 'dormant',
          '3-6': 'blooming',
          '7-8': 'foliage',
          '9-12': 'dormant',
        },
      },
      {
        id: 'iris',
        names: { en: 'Iris', fr: 'Iris' },
        scientificName: 'Iris germanica',
        colors: { blooming: '#2980B9' },
        months: {
          '1-3': 'dormant',
          '4-6': 'blooming',
          '7-8': 'foliage',
          '9-12': 'dormant',
        },
      },
      {
        id: 'peony',
        names: { en: 'Peony', fr: 'Pivoine' },
        scientificName: 'Paeonia lactiflora',
        colors: { blooming: '#E84393' },
        months: {
          '1-3': 'dormant',
          4: 'foliage',
          '5-6': 'blooming',
          '7-8': 'foliage',
          '9-12': 'dormant',
        },
      },
    ],
    garden: [
      'snowdrop',
      'crocus',
      'daffodil',
      'hyacinth',
      'tulip',
      'pansy',
      'iris',
      'peony',
    ],
    selected: ['snowdrop', 'crocus', 'daffodil', 'hyacinth'],
    customFlowers: {},
  },
  version: 0,
};

export const SEED_JSON = JSON.stringify(SEED_STATE);
