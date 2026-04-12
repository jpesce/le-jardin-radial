import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from 'storybook/test';
import Popover from './Popover';
import Button from './Button';
import { Share2 } from 'lucide-react';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const meta = {
  title: 'Molecules/Popover',
  component: Popover,
  argTypes: {
    align: { control: 'select', options: ['right', 'left', 'center'] },
    ariaLabel: { control: 'text' },
    className: { table: { disable: true } },
    isOpen: { table: { disable: true } },
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
      <div className="flex justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const Default: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
  },
  parameters: {
    docs: {
      source: {
        code: `<Popover
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  align="center"
  trigger={<Button onClick={toggle} />}
  ariaLabel="Menu"
  className="gap-2 w-64 py-3 px-4"
>
  <p>Content</p>
</Popover>`,
      },
    },
  },
  render: (args) => <PopoverWithState {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await sleep(600);
    await userEvent.click(button);
  },
};
