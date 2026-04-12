import { Component, type ErrorInfo, type ReactNode } from 'react';
import { LANG_STORAGE_KEY, resolveLangFromPath } from '../i18n/i18n-utils';
import { STORAGE_KEY } from '../hooks/useGarden';
import Button from './Button';
import FallbackPage from './FallbackPage';

const strings = {
  en: {
    title: 'Well, that didn\u2019t bloom',
    description:
      'Something unexpected happened. Try refreshing the page, or start with a fresh garden.',
    reload: 'Refresh page',
    reset: 'Start fresh',
  },
  fr: {
    title: 'Oups, \u00e7a n\u2019a pas fleuri',
    description:
      'Quelque chose d\u2019inattendu s\u2019est produit. Essayez de rafra\u00eechir la page, ou recommencez avec un nouveau jardin.',
    reload: 'Rafra\u00eechir la page',
    reset: 'Recommencer',
  },
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console -- Error boundaries should log caught errors
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.replace('/');
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    const lang = resolveLangFromPath(
      window.location.pathname,
      localStorage.getItem(LANG_STORAGE_KEY),
    );
    const t = strings[lang];

    return (
      <FallbackPage
        title={t.title}
        description={t.description}
        actions={
          <>
            <Button variant="solid" size="md" onClick={this.handleReload}>
              {t.reload}
            </Button>
            <Button
              variant="outline"
              size="md"
              className="text-fg"
              onClick={this.handleReset}
            >
              {t.reset}
            </Button>
          </>
        }
      />
    );
  }
}
