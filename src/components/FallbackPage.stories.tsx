import type { Meta, StoryObj } from '@storybook/react-vite';
import FallbackPage from './FallbackPage';
import Button from './ui/button';

const meta = {
  title: 'Organisms/FallbackPage',
  component: FallbackPage,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    actions: { table: { disable: true } },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FallbackPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotFound: Story = {
  args: {
    title: 'Nothing planted here',
    description:
      'This path doesn\u2019t lead anywhere in the garden. Head back to see what\u2019s blooming.',
    actions: (
      <Button variant="solid" size="md">
        Go to garden
      </Button>
    ),
  },
};

export const InvalidShare: Story = {
  args: {
    title: 'This bouquet wilted',
    description:
      'The share link seems to be invalid or incomplete. Ask for a fresh one, or head to your garden.',
    actions: (
      <Button variant="solid" size="md">
        Go to garden
      </Button>
    ),
  },
};
