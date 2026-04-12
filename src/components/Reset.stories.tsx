import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Reset from './Reset';

const meta = {
  title: 'Components/Reset',
  component: Reset,
  argTypes: {
    isOpen: { control: 'boolean' },
    onToggle: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onReset: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="flex justify-end p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Reset>;

export default meta;
type Story = StoryObj<typeof meta>;

function ResetWithState(props: ComponentProps<typeof Reset>) {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  return (
    <Reset
      {...props}
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((prev) => !prev);
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      onReset={() => {
        setIsOpen(false);
      }}
    />
  );
}

export const Interactive: Story = {
  args: {
    isOpen: false,
    onToggle: () => {},
    onClose: () => {},
    onReset: () => {},
  },
  argTypes: { isOpen: { table: { disable: true } } },
  render: (args) => <ResetWithState {...args} />,
};
