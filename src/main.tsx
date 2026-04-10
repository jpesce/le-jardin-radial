import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/jetbrains-mono';
import ErrorBoundary from './components/ErrorBoundary';
import { I18nProvider } from './i18n/I18nContext';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');
createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
