import type { Meta, StoryObj } from '@storybook/react-vite';
import BackButton from './BackButton';

const meta = {
  title: 'Atoms/BackButton',
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
