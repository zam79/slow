"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import styles from "./search.module.css";
import { Drug } from "@/lib/types";

const SearchBar = dynamic(
  () => import("./SearchBar").catch(() => ({
    default: () => <div>Failed to load search component</div>,
  })),
  {
    ssr: false,
    loading: () => (
      <div className={styles.searchLoading}>Loading search...</div>
    ),
  }
);

interface ClientSearchProps {
  onDrugSelect: (drug: Drug) => void;
}

export default function ClientSearch({ onDrugSelect }: ClientSearchProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={styles.searchWrapper}>
        <SearchBar onDrugSelect={onDrugSelect} />
      </div>
    </Suspense>
  );
}
