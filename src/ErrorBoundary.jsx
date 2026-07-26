import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled runtime error in Multimodal AI Chat:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 text-white">
          <div className="max-w-md rounded-2xl border border-red-500/20 bg-gray-900/80 p-8 text-center backdrop-blur-lg">
            <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
            <p className="mt-3 text-sm text-gray-400">
              The application encountered an unexpected runtime error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
