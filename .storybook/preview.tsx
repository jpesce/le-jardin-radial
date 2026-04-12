import type { Preview } from '@storybook/react-vite';
import { I18nProvider } from '../src/i18n/I18nContext';
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
        key={context.globals.lang as string}
        initialLang={context.globals.lang as string}
      >
        <Story />
      </I18nProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
