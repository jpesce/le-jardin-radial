import type { Meta, StoryObj } from '@storybook/react-vite';
import { useI18n } from '../i18n/I18nContext';
import FallbackPage from './FallbackPage';
import Button from './Button';

const meta = {
  title: 'Components/FallbackPage',
  component: FallbackPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FallbackPage>;

export default meta;
type Story = StoryObj<typeof meta>;

function NotFoundStory() {
  const { t } = useI18n();
  return (
    <FallbackPage
      title={t('notFoundTitle') as string}
      description={t('notFoundDescription') as string}
      actions={
        <Button variant="solid" size="md">
          {t('notFoundCta') as string}
        </Button>
      }
    />
  );
}

export const NotFound: Story = {
  args: { title: '', description: '', actions: null },
  render: () => <NotFoundStory />,
};

function InvalidShareStory() {
  const { t } = useI18n();
  return (
    <FallbackPage
      title={t('invalidShareTitle') as string}
      description={t('invalidShareDescription') as string}
      actions={
        <Button variant="solid" size="md">
          {t('invalidShareCta') as string}
        </Button>
      }
    />
  );
}

export const InvalidShare: Story = {
  args: { title: '', description: '', actions: null },
  render: () => <InvalidShareStory />,
};
