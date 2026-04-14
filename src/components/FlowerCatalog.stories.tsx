import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import FlowerCatalog from './FlowerCatalog';
import type { EnrichedFlower } from '../types';

const flowers: EnrichedFlower[] = [
  {
    id: 'snowdrop',
    names: { en: 'Snowdrop', fr: 'Perce-neige' },
    scientificName: 'Galanthus nivalis',
    colors: { blooming: '#F0F0F0' },
    months: { '1-2': 'blooming', 3: 'foliage', '4-12': 'dormant' },
    monthStates: [
      'blooming',
      'blooming',
      'foliage',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
    ],
    firstBloom: 0,
    displayName: 'Snowdrop',
    inGarden: true,
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
    monthStates: [
      'dormant',
      'dormant',
      'blooming',
      'blooming',
      'blooming',
      'foliage',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
      'dormant',
    ],
    firstBloom: 2,
    displayName: 'Tulip',
    inGarden: false,
  },
  {
    id: 'rose',
    names: { en: 'Rose', fr: 'Rose' },
    scientificName: 'Rosa gallica',
    colors: { blooming: '#E84393' },
    months: {
      '5-9': 'blooming',
      '3-4': 'foliage',
      '10-12': 'dormant',
      '1-2': 'dormant',
    },
    monthStates: [
      'dormant',
      'dormant',
      'foliage',
      'foliage',
      'blooming',
      'blooming',
      'blooming',
      'blooming',
      'blooming',
      'dormant',
      'dormant',
      'dormant',
    ],
    firstBloom: 4,
    displayName: 'Rose',
    inGarden: true,
  },
  {
    id: 'custom-1',
    names: { en: 'My Dahlia', fr: 'Mon Dahlia' },
    scientificName: 'Dahlia pinnata',
    colors: { blooming: '#9B59B6' },
    months: {
      '6-10': 'blooming',
      '4-5': 'foliage',
      '11-12': 'dormant',
      '1-3': 'dormant',
    },
    monthStates: [
      'dormant',
      'dormant',
      'dormant',
      'foliage',
      'foliage',
      'blooming',
      'blooming',
      'blooming',
      'blooming',
      'blooming',
      'dormant',
      'dormant',
    ],
    firstBloom: 5,
    displayName: 'My Dahlia',
    isCustom: true,
    inGarden: true,
  },
];

const noop = () => {};

const meta = {
  title: 'Organisms/FlowerCatalog',
  component: FlowerCatalog,
  argTypes: {
    flowers: { table: { disable: true } },
    onToggle: { table: { disable: true } },
    onBack: { table: { disable: true } },
    onEditFlower: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-[280px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FlowerCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    flowers,
    onToggle: noop,
    onBack: noop,
    onEditFlower: noop,
  },
};

function CatalogInteractive() {
  const [items, setItems] = useState(flowers);
  return (
    <FlowerCatalog
      flowers={items}
      onToggle={(id) => {
        setItems((prev) =>
          prev.map((f) => (f.id === id ? { ...f, inGarden: !f.inGarden } : f)),
        );
      }}
      onBack={noop}
      onEditFlower={noop}
    />
  );
}

export const Interactive: Story = {
  args: {
    flowers,
    onToggle: noop,
    onBack: noop,
    onEditFlower: noop,
  },
  render: () => <CatalogInteractive />,
};
