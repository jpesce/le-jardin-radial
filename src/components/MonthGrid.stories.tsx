import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import MonthGrid from './MonthGrid';
import type { FlowerState } from '../types';

const noop = () => {};
const DORMANT: FlowerState[] = Array<FlowerState>(12).fill('dormant');

const meta = {
  title: 'Components/MonthGrid',
  component: MonthGrid,
  argTypes: {
    bloomColor: { control: 'color' },
    onChange: { control: false },
    value: { control: false },
  },
} satisfies Meta<typeof MonthGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: DORMANT,
    onChange: noop,
    bloomColor: '#e85138',
  },
};

export const MixedStates: Story = {
  args: {
    value: [
      'dormant',
      'dormant',
      'sprouting',
      'foliage',
      'blooming',
      'blooming',
      'blooming',
      'foliage',
      'foliage',
      'sprouting',
      'dormant',
      'dormant',
    ],
    onChange: noop,
    bloomColor: '#8f80f9',
  },
};

function InteractiveGrid() {
  const [states, setStates] = useState<FlowerState[]>(DORMANT);
  return <MonthGrid value={states} onChange={setStates} bloomColor="#ff6700" />;
}

export const Interactive: Story = {
  args: {
    value: DORMANT,
    onChange: noop,
  },
  render: () => <InteractiveGrid />,
};
