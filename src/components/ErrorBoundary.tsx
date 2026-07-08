import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, Trash2 } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in boundary:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      if (this.props.onReset) {
        this.props.onReset();
      }
      this.setState({ hasError: false, error: null });
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[300px] bg-neutral-900 border border-red-500/20 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center select-none shadow-2xl">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20 animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          
          <h3 className="text-base font-black text-neutral-100 uppercase tracking-widest">
            {this.props.fallbackTitle || "Voting Terminal Error"}
          </h3>
          
          <p className="text-xs text-neutral-400 mt-2 max-w-sm leading-relaxed">
            An unexpected runtime error occurred inside this module. This could be due to corrupt offline state cache or network subscription issues.
          </p>

          <div className="w-full mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-left font-mono text-[10px] text-red-400/90 overflow-x-auto max-h-32 select-text">
            <span className="font-bold">Error:</span> {this.state.error?.message || String(this.state.error)}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-6">
            <button
              type="button"
              onClick={this.handleReset}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset App</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-neutral-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
