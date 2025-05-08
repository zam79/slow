"use client";

import dynamic from "next/dynamic";
import styles from "./search.module.css";
import { Suspense } from "react";

const SearchBar = dynamic(
  () =>
    import("./SearchBar").catch(() => ({
      default: () => <div>Failed to load search component</div>,
    })),
  {
    ssr: false,
    loading: () => (
      <div className={styles.searchLoading}>Loading search...</div>
    ),
  }
);

export default function ClientSearch() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={styles.searchWrapper}>
        <SearchBar />
      </div>
    </Suspense>
  );
}
