import type { Meta, StoryObj } from '@storybook/react-vite';
import SadFlower from './SadFlower';

const meta = {
  title: 'Assets/SadFlower',
  component: SadFlower,
  argTypes: {
    className: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SadFlower>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { className: 'w-40' },
};
