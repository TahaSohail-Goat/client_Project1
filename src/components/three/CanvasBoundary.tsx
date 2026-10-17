import { Component, type ReactNode } from "react";
export class CanvasBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Scene initialization failed", error);
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
