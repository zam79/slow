"use client";

import { Suspense, useState, useCallback } from "react";
import styles from "./page.module.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ClientSearch from "./components/search/ClientSearch";
import SearchWrapper from "./components/search/SearchWrapper";
import { Drug } from "@/lib/types";

export default function Home() {
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleDrugSelect = useCallback((drug: Drug | null) => {
    setSelectedDrug(drug);
    setResetTrigger((prev) => prev + 1); // Increment for reset
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Drugs in Anesthesia and Critical Care</h1>
          <Suspense fallback={<div className={styles.loading}>Loading search...</div>}>
            <ClientSearch
              onDrugSelect={handleDrugSelect}
              resetTrigger={resetTrigger}
            />
          </Suspense>
        </section>
        <section className={styles.drugInfoSection}>
          <Suspense fallback={<div className={styles.loading}>Loading drug info...</div>}>
            <SearchWrapper selectedDrug={selectedDrug} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
