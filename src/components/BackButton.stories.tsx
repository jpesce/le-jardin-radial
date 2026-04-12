import type { Meta, StoryObj } from '@storybook/react-vite';
import BackButton from './BackButton';

const meta = {
  title: 'Primitives/BackButton',
  component: BackButton,
  argTypes: {
    children: { control: 'text' },
  },
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Back' },
};

export const Cancel: Story = {
  args: { children: 'Cancel' },
};
