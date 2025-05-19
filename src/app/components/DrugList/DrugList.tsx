"use client";

import { useEffect, useRef } from "react";
import styles from "./DrugList.module.css";
import { Drug } from "@/lib/types";

interface DrugListProps {
  drugs: Drug[];
  onDrugSelect: (drug: Drug) => void;
}

export default function DrugList({ drugs, onDrugSelect }: DrugListProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Auto-focus the first item when the list opens
  useEffect(() => {
    if (listRef.current && drugs.length > 0) {
      const firstItem = listRef.current.querySelector("li");
      firstItem?.focus();
    }
  }, [drugs]);

  return (
    <ul
      id="drug-list"
      className={styles.drugList}
      ref={listRef}
      role="menu"
      aria-label="Drug list"
    >
      {drugs.length > 0 ? (
        drugs.map((drug) => (
          <li
            key={drug.id}
            className={styles.drugItem}
            role="menuitem"
            tabIndex={0}
            onClick={() => onDrugSelect(drug)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onDrugSelect(drug);
              }
            }}
          >
            {drug.name}
          </li>
        ))
      ) : (
        <li className={styles.loading}>Loading drugs...</li>
      )}
    </ul>
  );
}
