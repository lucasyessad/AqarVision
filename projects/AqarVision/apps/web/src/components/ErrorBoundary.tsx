"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center min-h-[200px] p-8">
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Une erreur est survenue
              </p>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 dark:bg-teal-500 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-fast"
              >
                Réessayer
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
