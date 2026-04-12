import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Popover from './Popover';
import Button from './Button';
import { Share2 } from 'lucide-react';

const meta = {
  title: 'Primitives/Popover',
  component: Popover,
  argTypes: {
    isOpen: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    className: { control: 'text' },
    trigger: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="flex justify-end p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    ariaLabel: 'Example popover',
    className: 'gap-2 w-64 py-3 px-4',
    children: <p className="text-xs text-subtle">Popover content goes here.</p>,
  },
};

function PopoverWithTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
      trigger={
        <Button
          variant="outline"
          round
          size="lg"
          icon={<Share2 size={14} />}
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
        />
      }
      ariaLabel="Share menu"
      className="gap-2 w-64 py-3 px-4"
    >
      <p className="text-xs font-bold text-fg lowercase">Share menu</p>
      <p className="text-2xs text-subtle">
        Click outside or press Escape to close.
      </p>
    </Popover>
  );
}

export const WithTrigger: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => <PopoverWithTrigger />,
};
