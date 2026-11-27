// Keeps one broken program from taking the whole workstation down.
import { Component, type ReactNode } from 'react';

interface Props {
  name: string;
  children: ReactNode;
}

export class AppGuard extends Component<Props, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  componentDidCatch(e: unknown) {
    console.error(`[${this.props.name}]`, e);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="app-crash" role="alert">
        <b>{this.props.name.toUpperCase()} has stopped responding.</b>
        <p>The program performed an illegal operation. Your work is saved.</p>
        <code>{this.state.error.slice(0, 160)}</code>
        <button className="btn" onClick={() => this.setState({ error: null })}>
          Restart program
        </button>
      </div>
    );
  }
}
