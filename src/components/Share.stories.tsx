import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from 'storybook/test';
import Share from './Share';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const noop = () => {};

const meta = {
  title: 'Organisms/Share',
  component: Share,
  argTypes: {
    isOpen: { control: 'boolean' },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    round: { control: 'boolean' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    onToggle: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onGetShareUrl: { table: { disable: true } },
    onExportJson: { table: { disable: true } },
    onExportSvg: { table: { disable: true } },
    onExportPng: { table: { disable: true } },
    onImportJson: { table: { disable: true } },
  },
  args: {
    align: 'center',
    onToggle: noop,
    onClose: noop,
    onGetShareUrl: () => 'https://jardin.pesce.cc/share/example',
    onExportJson: noop,
    onExportSvg: noop,
    onExportPng: noop,
    onImportJson: noop,
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Share>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: { isOpen: false },
};

export const Open: Story = {
  args: { isOpen: true },
};

function ShareWithState(props: ComponentProps<typeof Share>) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Share
      {...props}
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((prev) => !prev);
      }}
      onClose={() => {
        setIsOpen(false);
      }}
    />
  );
}

export const Interactive: Story = {
  args: { isOpen: false },
  argTypes: { isOpen: { table: { disable: true } } },
  parameters: {
    docs: {
      source: {
        code: `<Share
  isOpen={isOpen}
  onToggle={() => setIsOpen(prev => !prev)}
  onClose={() => setIsOpen(false)}
  onGetShareUrl={() => getShareUrl()}
  onExportJson={exportJson}
  onExportSvg={exportSvg}
  onExportPng={exportPng}
  onImportJson={importJson}
/>`,
      },
    },
  },
  render: (args) => <ShareWithState {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await sleep(600);
    await userEvent.click(button);
  },
};
