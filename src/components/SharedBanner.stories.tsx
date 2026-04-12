import type { Meta, StoryObj } from '@storybook/react-vite';
import SharedBanner from './SharedBanner';

const meta = {
  title: 'Components/SharedBanner',
  component: SharedBanner,
  argTypes: {
    owner: { control: 'text' },
    animateEntry: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SharedBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const LightOwner: Story = {
  args: {
    owner: 'Tainah Drummond',
    animateEntry: false,
    onSave: noop,
    onDismiss: noop,
  },
};

export const DarkOwner: Story = {
  args: {
    owner: 'Alice',
    animateEntry: false,
    onSave: noop,
    onDismiss: noop,
  },
};
