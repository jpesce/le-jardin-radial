import type { Meta, StoryObj } from '@storybook/react-vite';
import Logo from './Logo';

const meta = {
  title: 'Assets/Logo',
  component: Logo,
  argTypes: {
    circleOuterColor: { control: 'color' },
    circleInnerColor: { control: 'color' },
    variant: { control: 'select', options: ['stacked', 'inline'] },
  },
  decorators: [
    (Story) => (
      <div className="p-8 w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stacked: Story = {
  args: {
    className: 'w-full h-auto',
    circleOuterColor: '#e85138',
    circleInnerColor: '#f9d748',
  },
};

export const Inline: Story = {
  args: {
    className: 'w-full h-auto',
    circleOuterColor: '#e85138',
    circleInnerColor: '#f9d748',
    variant: 'inline',
  },
};
