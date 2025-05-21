"use client";

import dynamic from "next/dynamic";
import { Suspense, Component, ReactNode, useCallback } from "react";
import styles from "./search.module.css";
import { Drug } from "@/lib/types";

const SearchBar = dynamic(() => import("./SearchBar"), {
  ssr: false,
  loading: () => <div className={styles.searchLoading}>Loading search...</div>,
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
        <div className={styles.errorContainer}>
          <p>Failed to load search component: {this.state.error?.message || "Unknown error"}</p>
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

export default function ClientSearch({ onDrugSelect, resetTrigger }: ClientSearchProps) {
  // Memoize onDrugSelect to prevent rerenders
  const handleDrugSelect = useCallback((drug: Drug) => {
    onDrugSelect(drug);
  }, [onDrugSelect]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className={styles.skeletonSearch}>Loading...</div>}>
        <div className={styles.searchWrapper}>
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
