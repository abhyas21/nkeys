import { Component } from "react";
import { STORE_KEY } from "../lib/storage";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : "Unknown runtime error"
    };
  }

  componentDidCatch(error, info) {
    console.error("NKeys runtime error:", error, info);
  }

  handleReset = () => {
    window.localStorage.removeItem(STORE_KEY);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 px-4 py-10 text-ink sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Runtime error
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">
              The app hit an error while loading
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              This usually means saved browser data is corrupted or a runtime exception occurred.
              Clearing the local demo data is the fastest recovery step.
            </p>
            <p className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
              Error: {this.state.errorMessage || "Unknown runtime error"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                Clear local data and reload
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full border border-stone-200 px-6 py-3 text-sm font-semibold text-ink transition hover:border-stone-900"
              >
                Reload only
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
