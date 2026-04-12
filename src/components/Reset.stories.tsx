import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Reset from './Reset';

const meta = {
  title: 'Components/Reset',
  component: Reset,
  argTypes: {
    isOpen: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="flex justify-end p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Reset>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveReset() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Reset
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
  args: {
    isOpen: false,
    onToggle: () => {},
    onClose: () => {},
    onReset: () => {},
  },
  render: () => <InteractiveReset />,
};
