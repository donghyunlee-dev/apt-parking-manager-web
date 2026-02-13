import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import AppRouter from './routes/AppRouter';
import { worker } from './api/mock';
import { isDevelopment } from './shared/utils/env';
import ErrorBoundary from './shared/components/feedback/ErrorBoundary';
import ToastListener from './shared/components/feedback/ToastListener';

if (isDevelopment) {
  worker.start({
    onUnhandledRequest: 'bypass',
  });
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <ToastListener />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
