"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Drug } from "@/lib/types";
import styles from "../../page.module.css";

const DrugInfo = dynamic(() => import("../drug/DrugInfo"), {
  ssr: false,
  loading: () => <div>Loading drug details...</div>,
});

interface SearchWrapperProps {
  onDrugSelect: (drug: Drug | null) => void;
  selectedDrug: Drug | null;
}

export default function SearchWrapper({ onDrugSelect, selectedDrug }: SearchWrapperProps) {
  const handleClearDrug = () => {
    onDrugSelect(null); // Clear by notifying parent
  };

  return (
    <div>
      {selectedDrug && (
        <div className={styles.drugInfoContainer}>
          <div className={styles.drugInfoHeader}>
            <h2>{selectedDrug.name}</h2>
            <button
              onClick={handleClearDrug}
              className={styles.clearButton}
              aria-label="Clear selected drug"
            >
              Clear
            </button>
          </div>
          <Suspense fallback={<div>Loading drug details...</div>}>
            <DrugInfo drug={selectedDrug} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
