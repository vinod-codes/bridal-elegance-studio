import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
          <h2 className="text-2xl font-heading font-bold text-slate-800">Oops, something went wrong!</h2>
          <p className="text-slate-500 max-w-md">We're sorry, but an unexpected error occurred. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-[#2c3e50] text-white">
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
