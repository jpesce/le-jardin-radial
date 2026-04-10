import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

import { LANG_STORAGE_KEY, resolveLangFromPath } from '../i18n/i18n-utils';
import { STORAGE_KEY } from '../hooks/useGarden';
import Button from './Button';

const strings = {
  en: {
    title: 'well, that didn\u2019t bloom',
    description:
      'something unexpected happened. try refreshing the page, or start with a fresh garden.',
    reload: 'refresh page',
    reset: 'start fresh',
  },
  fr: {
    title: 'oups, \u00e7a n\u2019a pas fleuri',
    description:
      'quelque chose d\u2019inattendu s\u2019est produit. essayez de rafra\u00eechir la page, ou recommencez avec un nouveau jardin.',
    reload: 'rafra\u00eechir la page',
    reset: 'recommencer',
  },
};

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
      <div className="flex flex-col items-center justify-center min-h-dvh gap-6 p-8 text-fg">
        <svg viewBox="20 55 80 100" className="w-32 h-40" aria-hidden="true">
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0,60,135; 3,60,135; 0,60,135; -3,60,135; 0,60,135"
              dur="4s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
            />
            <path
              d="M42 132 L46 146 L74 146 L78 132Z"
              fill="#dad7d4"
              stroke="#443528"
              strokeWidth="2.25"
              strokeLinejoin="round"
            />
            <line
              x1="42"
              y1="132"
              x2="78"
              y2="132"
              stroke="#443528"
              strokeWidth="2.25"
              strokeLinecap="round"
            />
            <path
              d="M60 132 Q58 118 56 108 Q54 100 52 94"
              fill="none"
              stroke="#443528"
              strokeWidth="2.25"
              strokeLinecap="round"
            />
            <path
              d="M56 118 Q44 110 40 116 Q42 122 56 118Z"
              fill="#c1bcb7"
              stroke="#443528"
              strokeWidth="2.25"
              strokeLinejoin="round"
            />
            <path
              d="M58 112 Q70 106 72 112 Q68 118 58 112Z"
              fill="#c1bcb7"
              stroke="#443528"
              strokeWidth="2.25"
              strokeLinejoin="round"
            />
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-8,52,82; -11,52,82; -8,52,82; -5,52,82; -8,52,82"
                dur="3.5s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
              />
              <ellipse
                cx="52"
                cy="68"
                rx="7"
                ry="11"
                fill="#e8e6e5"
                stroke="#443528"
                strokeWidth="2.25"
                transform="rotate(0,52,82)"
              />
              <ellipse
                cx="52"
                cy="68"
                rx="7"
                ry="11"
                fill="#e8e6e5"
                stroke="#443528"
                strokeWidth="2.25"
                transform="rotate(-51.4,52,82)"
              />
              <ellipse
                cx="52"
                cy="68"
                rx="7"
                ry="11"
                fill="#e8e6e5"
                stroke="#443528"
                strokeWidth="2.25"
                transform="rotate(51.4,52,82)"
              />
              <ellipse
                cx="52"
                cy="68"
                rx="7"
                ry="11"
                fill="#e8e6e5"
                stroke="#443528"
                strokeWidth="2.25"
                transform="rotate(-102.9,52,82)"
              />
              <ellipse
                cx="52"
                cy="68"
                rx="7"
                ry="11"
                fill="#e8e6e5"
                stroke="#443528"
                strokeWidth="2.25"
                transform="rotate(102.9,52,82)"
              />
              <ellipse
                cx="52"
                cy="68"
                rx="7"
                ry="11"
                fill="#e8e6e5"
                stroke="#443528"
                strokeWidth="2.25"
                transform="rotate(-154.3,52,82)"
              />
              <ellipse
                cx="52"
                cy="68"
                rx="7"
                ry="11"
                fill="#e8e6e5"
                stroke="#443528"
                strokeWidth="2.25"
                transform="rotate(154.3,52,82)"
              />
              <circle
                cx="52"
                cy="82"
                r="12"
                fill="#c1bcb7"
                stroke="#443528"
                strokeWidth="2.25"
              />
              <circle cx="47" cy="78" r="2.5" fill="white" opacity="0.3" />
              <g stroke="#443528" strokeWidth="2.25" strokeLinecap="round">
                <line x1="45" y1="78" x2="49" y2="82" />
                <line x1="49" y1="78" x2="45" y2="82" />
              </g>
              <g stroke="#443528" strokeWidth="2.25" strokeLinecap="round">
                <line x1="55" y1="78" x2="59" y2="82" />
                <line x1="59" y1="78" x2="55" y2="82" />
              </g>
              <path
                fill="none"
                stroke="#443528"
                strokeWidth="2.25"
                strokeLinecap="round"
              >
                <animate
                  attributeName="d"
                  values="M47 87 Q52 84 57 87; M47 88 Q52 85 57 88; M47 87 Q52 84 57 87"
                  dur="3s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                />
              </path>
            </g>
          </g>
        </svg>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-sm font-bold lowercase tracking-[0.03em]">
            {t.title}
          </h1>
          <p className="max-w-64 text-xs text-muted lowercase tracking-[0.03em]">
            {t.description}
          </p>
        </div>
        <div className="flex gap-3">
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
        </div>
      </div>
    );
  }
}
