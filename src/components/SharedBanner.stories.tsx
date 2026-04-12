import type { Meta, StoryObj } from '@storybook/react-vite';
import SharedBanner from './SharedBanner';

const noop = () => {};

const meta = {
  title: 'Organisms/SharedBanner',
  component: SharedBanner,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    backgroundColor: { control: 'color' },
    animateEntry: { control: 'boolean' },
    onSave: { table: { disable: true } },
    onDismiss: { table: { disable: true } },
  },
  args: {
    onSave: noop,
    onDismiss: noop,
    animateEntry: true,
  },
} satisfies Meta<typeof SharedBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightBackground: Story = {
  args: {
    backgroundColor: '#f9d748',
  },
};

export const DarkBackground: Story = {
  args: {
    backgroundColor: '#0c00ff',
  },
};
