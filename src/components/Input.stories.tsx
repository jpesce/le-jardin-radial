import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './ui/input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  argTypes: {
    className: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-[240px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Tainah Drummond',
    readOnly: true,
  },
};

export const WithLabel: Story = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `<label className="flex flex-col gap-1 text-xs text-muted lowercase">
  Gardener
  <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
</label>`,
      },
    },
  },
  render: () => {
    function InputWithLabel() {
      const [value, setValue] = useState('Tainah Drummond');
      return (
        <label className="flex flex-col gap-1 text-xs text-muted lowercase tracking-[0.03em]">
          Gardener
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
        </label>
      );
    }
    return <InputWithLabel />;
  },
};
