import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="loading error" style={{ padding: 32, margin: 24 }}>
          <strong>Something went wrong loading the dashboard.</strong>
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{this.state.error.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
