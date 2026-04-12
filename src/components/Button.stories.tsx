import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from 'storybook/test';
import { Sprout, Download, Pencil } from 'lucide-react';
import Button from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    children: { control: 'text' },
    variant: { control: 'select', options: ['outline', 'solid', 'ghost'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    color: { control: 'select', options: ['default', 'danger'] },
    round: { control: 'boolean' },
    animated: { control: 'boolean' },
    icon: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Solid: Story = {
  args: { variant: 'solid', children: 'Solid' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Danger: Story = {
  args: { variant: 'solid', color: 'danger', children: 'Erase all' },
};

export const WithIcon: Story = {
  args: {
    variant: 'outline',
    icon: <Sprout size={14} />,
    children: 'Plan garden',
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'outline',
    round: true,
    size: 'lg',
    icon: <Download size={14} />,
  },
};

export const Small: Story = {
  args: { variant: 'outline', size: 'sm', children: 'Small' },
};

export const ExtraSmall: Story = {
  args: {
    variant: 'ghost',
    size: 'xs',
    icon: <Pencil size={10} />,
  },
};

function AnimatedButton() {
  const [open, setOpen] = useState(false);
  return (
    <Button
      variant="outline"
      round
      size="lg"
      icon={<Sprout size={14} />}
      animated
      onClick={() => {
        setOpen((prev) => !prev);
      }}
    >
      {open ? 'Done' : 'Plan garden'}
    </Button>
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const Animated: Story = {
  args: {
    variant: 'outline',
    round: true,
    size: 'lg',
    animated: true,
    children: 'Plan garden',
  },
  parameters: {
    docs: {
      source: {
        code: `<Button variant="outline" round size="lg" icon={<Sprout size={14} />} animated>
  {isOpen ? 'Done' : 'Plan garden'}
</Button>`,
      },
    },
  },
  render: () => <AnimatedButton />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await sleep(800);
    await userEvent.click(button);
    await sleep(1200);
    await userEvent.click(button);
  },
};
