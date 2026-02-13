import type { ReactNode } from 'react';
import { Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            문제가 발생했습니다. 새로고침 후 다시 시도해주세요.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
