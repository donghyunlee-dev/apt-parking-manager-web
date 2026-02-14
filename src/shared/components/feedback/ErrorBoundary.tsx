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
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
            문제가 발생했습니다. 새로고침 후 다시 시도해주세요.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
