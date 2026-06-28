import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-start gap-4 my-4 backdrop-blur-md">
          <div className="flex-shrink-0 text-2xl text-red-500">
            🚨
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-red-400">
              Something went wrong in this section.
            </h3>
            <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 px-3 py-1.5 rounded-lg border border-red-500/30 transition-all font-semibold"
            >
              Reload Section
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
