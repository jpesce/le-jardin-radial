import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Popover from './Popover';
import Button from './Button';
import { Share2 } from 'lucide-react';

const meta = {
  title: 'Primitives/Popover',
  component: Popover,
  argTypes: {
    isOpen: { control: 'boolean' },
    align: { control: 'select', options: ['right', 'left', 'center'] },
    ariaLabel: { control: 'text' },
    className: { control: 'text' },
    onClose: { table: { disable: true } },
    trigger: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    align: 'center',
    ariaLabel: 'Example popover',
    className: 'gap-2 w-64 py-3 px-4',
    children: <p className="text-xs text-subtle">Popover content goes here.</p>,
  },
  decorators: [
    (Story) => (
      <div className="relative flex justify-center p-8">
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
  },
};

function PopoverWithState(props: ComponentProps<typeof Popover>) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      {...props}
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
    />
  );
}

export const WithTrigger: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
  },
  render: (args) => <PopoverWithState {...args} />,
};
