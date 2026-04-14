import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Reset from './Reset';

const noop = () => {};

const meta = {
  title: 'Organisms/Reset',
  component: Reset,
  argTypes: {
    isOpen: { control: 'boolean' },
    align: { control: 'select', options: ['right', 'left', 'center'] },
    round: { control: 'boolean' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    onToggle: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onReset: { table: { disable: true } },
  },
  args: {
    align: 'center',
    onToggle: noop,
    onClose: noop,
    onReset: noop,
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Reset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: { isOpen: false },
};

export const Open: Story = {
  args: { isOpen: true },
};

function ResetWithState(props: ComponentProps<typeof Reset>) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Reset
      {...props}
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((prev) => !prev);
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      onReset={() => {
        setIsOpen(false);
      }}
    />
  );
}

export const Interactive: Story = {
  args: { isOpen: false },
  argTypes: { isOpen: { table: { disable: true } } },
  parameters: {
    docs: {
      source: {
        code: `<Reset
  isOpen={isOpen}
  onToggle={() => setIsOpen(prev => !prev)}
  onClose={() => setIsOpen(false)}
  onReset={handleReset}
/>`,
      },
    },
  },
  render: (args) => <ResetWithState {...args} />,
};
