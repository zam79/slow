"use client";

import dynamic from "next/dynamic";
import { Suspense, Component, ReactNode, memo } from "react";
import { Drug } from "@/lib/types";
import styles from "../../page.module.css";

const DrugInfo = dynamic(() => import("../drug/DrugInfo"), {
  ssr: false,
  loading: () => <div className={styles.skeletonDrugInfo}>Loading drug details...</div>,
});

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
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

const SearchWrapper = memo(function SearchWrapper({ selectedDrug }: SearchWrapperProps) {
  if (!selectedDrug) return null;

  return (
    <div className={styles.drugInfoContainer}>
      <div className={styles.drugInfoHeader}>
        <h2>{selectedDrug.name}</h2>
      </div>
      <ErrorBoundary>
        <Suspense fallback={<div className={styles.skeletonDrugInfo}>Loading drug details...</div>}>
          <DrugInfo drug={selectedDrug} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});

SearchWrapper.displayName = "SearchWrapper";
export default SearchWrapper;
