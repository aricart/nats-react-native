import React from "react";

type Props = {
  fallback: (err: Error) => React.ReactNode;
  children: React.ReactNode;
};
type State = { err: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { err: null };
  static getDerivedStateFromError(err: Error): State {
    return { err };
  }
  componentDidCatch(err: Error) {
    console.error("ErrorBoundary:", err);
  }
  render() {
    if (this.state.err) return this.props.fallback(this.state.err);
    return this.props.children;
  }
}
