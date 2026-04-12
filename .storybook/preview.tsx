import type { Preview } from '@storybook/react-vite';
import { I18nProvider } from '../src/i18n/I18nContext';
import type { Lang } from '../src/types';
import '@fontsource-variable/jetbrains-mono';
import '../src/index.css';

const preview: Preview = {
  globalTypes: {
    lang: {
      description: 'Language',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: [
          { value: 'fr', title: 'Français' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    lang: 'fr',
  },
  decorators: [
    (Story, context) => (
      <I18nProvider
        key={context.globals.lang as Lang}
        initialLang={context.globals.lang as Lang}
      >
        <Story />
      </I18nProvider>
    ),
  ],
  tags: ['autodocs'],
  parameters: {
    options: {
      storySort: {
        order: ['Atoms', 'Molecules', 'Organisms', 'Assets'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
