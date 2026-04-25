import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4 font-sans text-ink">
          <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-soft">
            <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
            <p className="mb-6 text-sm leading-6 text-stone-600">{this.state.error?.message || "An unexpected React error occurred."}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}