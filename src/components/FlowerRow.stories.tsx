import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import FlowerRow from './FlowerRow';
import type { EnrichedFlower } from '../types';

const catalogFlower: EnrichedFlower = {
  id: 'rose',
  names: { en: 'Rose', fr: 'Rose' },
  scientificName: 'Rosa gallica',
  colors: { blooming: '#E74C3C' },
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
};

const customFlower: EnrichedFlower = {
  ...catalogFlower,
  id: 'custom-1',
  names: { en: 'My Dahlia', fr: 'Mon Dahlia' },
  displayName: 'My Dahlia',
  colors: { blooming: '#E84393' },
  isCustom: true,
};

const noop = () => {};

const meta = {
  title: 'Molecules/FlowerRow',
  component: FlowerRow,
  argTypes: {
    flower: { table: { disable: true } },
    dragHandle: { table: { disable: true } },
    onToggle: { table: { disable: true } },
    onEdit: { table: { disable: true } },
  },
  parameters: {
    docs: {
      source: {
        code: `{/* FlowerRow renders as a fragment — requires a parent with \`group\` class for hover styles */}
<li className="group relative">
  <label className="flex flex-1 gap-[0.5rem] items-center py-[0.25rem] text-xs text-subtle cursor-pointer">
    <FlowerRow
      flower={flower}
      checked={checked}
      onToggle={() => toggleFlower(flower.id)}
    />
  </label>
</li>`,
      },
    },
  },
  decorators: [
    (Story) => (
      <ul className="w-[280px] list-none">
        <li className="group relative">
          <label className="flex flex-1 gap-[0.5rem] items-center py-[0.25rem] text-xs text-subtle cursor-pointer pl-0">
            <Story />
          </label>
        </li>
      </ul>
    ),
  ],
} satisfies Meta<typeof FlowerRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    flower: catalogFlower,
    checked: false,
    onToggle: noop,
  },
};

export const Checked: Story = {
  args: {
    flower: catalogFlower,
    checked: true,
    onToggle: noop,
  },
};

export const CustomFlower: Story = {
  args: {
    flower: customFlower,
    checked: true,
    onToggle: noop,
    onEdit: noop,
  },
};

function FlowerRowInteractive() {
  const [checked, setChecked] = useState(false);
  return (
    <FlowerRow
      flower={catalogFlower}
      checked={checked}
      onToggle={() => {
        setChecked((prev) => !prev);
      }}
    />
  );
}

export const Interactive: Story = {
  args: {
    flower: catalogFlower,
    checked: false,
    onToggle: noop,
  },
  render: () => <FlowerRowInteractive />,
};
