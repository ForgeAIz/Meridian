// ─── ErrorBoundary ──────────────────────────────────────────────────────────
// Catches JavaScript errors in child components and shows a fallback UI.
// Prevents a crash in one chart from taking down the entire dashboard.

"use client";

import { Component } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  label?: string;
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

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-48 items-center justify-center rounded border border-dashed border-clay/30 bg-clay/5">
            <div className="text-center">
              <p className="text-sm text-clay">
                {this.props.label ?? "Something went wrong"}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 text-xs text-slate hover:text-ink underline"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
