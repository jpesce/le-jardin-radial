import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from 'storybook/test';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import Button from './Button';
import { Share2 } from 'lucide-react';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const meta = {
  title: 'Primitives/Popover',
  component: PopoverContent,
  argTypes: {
    align: { control: 'select', options: ['start', 'center', 'end'] },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PopoverContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function PopoverWithState({ align }: { align?: 'start' | 'center' | 'end' }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" round size="lg" icon={<Share2 size={14} />} />
      </PopoverTrigger>
      <PopoverContent align={align} className="gap-2 w-64 py-3 px-4">
        <p className="text-xs font-bold text-fg lowercase">Share menu</p>
        <p className="text-2xs text-subtle">
          Click outside or press Escape to close.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export const Default: Story = {
  args: {
    align: 'center',
  },
  parameters: {
    docs: {
      source: {
        code: `<Popover open={isOpen} onOpenChange={setIsOpen}>
  <PopoverTrigger asChild>
    <Button onClick={toggle} />
  </PopoverTrigger>
  <PopoverContent align="center" className="gap-2 w-64 py-3 px-4">
    <p>Content</p>
  </PopoverContent>
</Popover>`,
      },
    },
  },
  render: (args) => <PopoverWithState align={args.align} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await sleep(600);
    await userEvent.click(button);
  },
};
