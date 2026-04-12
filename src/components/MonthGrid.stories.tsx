import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import MonthGrid from './MonthGrid';
import type { FlowerState } from '../types';

const DORMANT: FlowerState[] = Array<FlowerState>(12).fill('dormant');

const meta = {
  title: 'Molecules/MonthGrid',
  component: MonthGrid,
  argTypes: {
    bloomColor: { control: 'color' },
    onChange: { table: { disable: true } },
    value: { table: { disable: true } },
  },
  args: {
    bloomColor: '#e85138',
  },
} satisfies Meta<typeof MonthGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

function MonthGridWithState(props: ComponentProps<typeof MonthGrid>) {
  const [states, setStates] = useState<FlowerState[]>(props.value);
  return <MonthGrid {...props} value={states} onChange={setStates} />;
}

export const Default: Story = {
  args: {
    value: DORMANT,
    onChange: () => {},
  },
  parameters: {
    docs: {
      source: {
        code: `<MonthGrid value={states} onChange={setStates} bloomColor="#e85138" />`,
      },
    },
  },
  render: (args) => <MonthGridWithState {...args} />,
};

export const MixedStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `<MonthGrid value={states} onChange={setStates} bloomColor="#8f80f9" />`,
      },
    },
  },
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
    onChange: () => {},
    bloomColor: '#8f80f9',
  },
  render: (args) => <MonthGridWithState {...args} />,
};
