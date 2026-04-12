import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Checkbox from './Checkbox';

const meta = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  argTypes: {
    checked: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: { checked: false },
};

export const Checked: Story = {
  args: { checked: true },
};

function CheckboxWithState(props: ComponentProps<typeof Checkbox>) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return (
    <label className="flex gap-2 items-center text-xs text-subtle cursor-pointer">
      <Checkbox
        {...props}
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
        }}
      />
      Show flower names
    </label>
  );
}

export const Interactive: Story = {
  args: { checked: false },
  argTypes: { checked: { table: { disable: true } } },
  render: (args) => <CheckboxWithState {...args} />,
};
