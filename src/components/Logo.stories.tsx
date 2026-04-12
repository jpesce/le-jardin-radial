import type { Meta, StoryObj } from '@storybook/react-vite';
import Logo from './Logo';

const meta = {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    name: { control: 'text' },
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

export const Default: Story = {
  args: { className: 'w-full h-auto', name: 'Tainah Drummond' },
};

export const DifferentName: Story = {
  args: { className: 'w-full h-auto', name: 'Alice' },
};
