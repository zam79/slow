"use client";

import dynamic from "next/dynamic";
import { Suspense, Component, ReactNode, useCallback } from "react";
import { Drug } from "@/lib/types";

const SearchBar = dynamic(() => import("./SearchBar"), {
  ssr: false,
  loading: () => (
    <div className="px-3 py-3 text-center text-gray-500 text-sm">
      Loading search...
    </div>
  ),
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600 text-center">
          <p>
            Failed to load search component:{" "}
            {this.state.error?.message || "Unknown error"}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ClientSearchProps {
  onDrugSelect: (drug: Drug | null) => void;
  resetTrigger: number;
}

export default function ClientSearch({
  onDrugSelect,
  resetTrigger,
}: ClientSearchProps) {
  const handleDrugSelect = useCallback(
    (drug: Drug) => {
      onDrugSelect(drug);
    },
    [onDrugSelect]
  );

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="animate-pulse bg-gray-200 h-16 rounded-xl">
            Loading...
          </div>
        }
      >
        <div className="max-w-3xl mx-auto relative z-[100] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-2xl">
          <SearchBar
            key="search-bar"
            onDrugSelect={handleDrugSelect}
            resetTrigger={resetTrigger}
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
