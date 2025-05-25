"use client";

import dynamic from "next/dynamic";
import { Suspense, Component, ReactNode, memo } from "react";
import { Drug } from "@/lib/types";

const DrugInfo = dynamic(() => import("../drug/DrugInfo"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded-xl">
      Loading drug details...
    </div>
  ),
});

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Failed to load drug details</div>;
    }
    return this.props.children;
  }
}

interface SearchWrapperProps {
  selectedDrug: Drug | null;
}

const SearchWrapper = memo(function SearchWrapper({
  selectedDrug,
}: SearchWrapperProps) {
  if (!selectedDrug) return null;

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 z-0">
      <div className="mb-4">
        <h2>{selectedDrug.name}</h2>
      </div>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="animate-pulse bg-gray-200 h-64 rounded-xl">
              Loading drug details...
            </div>
          }
        >
          <DrugInfo drug={selectedDrug} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});

SearchWrapper.displayName = "SearchWrapper";
export default SearchWrapper;
