import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { radius } from "../styles/designSystem";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border2)",
          borderRadius: radius.lg, padding: "32px", textAlign: "center",
          margin: "20px",
        }}>
          <div style={{ marginBottom: 12 }}><AlertTriangle size={40} /></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </div>
          <button
            onClick={() => this.setState({ error: null, info: null })}
            style={{
              background: "var(--red)", color: "#fff", border: "none",
              borderRadius: radius.md, padding: "10px 24px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
