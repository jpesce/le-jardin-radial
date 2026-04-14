import type { Meta, StoryObj } from '@storybook/react-vite';
import FlowerEditor from './FlowerEditor';
import type { EnrichedFlower } from '../types';

const noop = () => {};

const existingFlower: EnrichedFlower = {
  id: 'custom-1',
  names: { en: 'My Dahlia', fr: 'Mon Dahlia' },
  scientificName: 'Dahlia pinnata',
  colors: { blooming: '#E84393' },
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
};

const meta = {
  title: 'Organisms/FlowerEditor',
  component: FlowerEditor,
  argTypes: {
    flower: { table: { disable: true } },
    onSave: { table: { disable: true } },
    onCancel: { table: { disable: true } },
    onDelete: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-[280px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FlowerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {
    flower: null,
    onSave: noop,
    onCancel: noop,
  },
};

export const Edit: Story = {
  args: {
    flower: existingFlower,
    onSave: noop,
    onCancel: noop,
    onDelete: noop,
  },
};
