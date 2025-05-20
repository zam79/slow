"use client";

import { Suspense, useState } from "react";
import styles from "./page.module.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ClientSearch from "./components/search/ClientSearch";
import SearchWrapper from "./components/search/SearchWrapper";
import { Drug } from "@/lib/types";

export default function Home() {
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  const handleDrugSelect = (drug: Drug | null) => {
    setSelectedDrug(drug);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Drugs in Anesthesia and Critical Care</h1>
          <Suspense fallback={<div className={styles.loading}>Loading search...</div>}>
            <ClientSearch onDrugSelect={handleDrugSelect} />
          </Suspense>
        </section>
        <section className={styles.drugInfoSection}>
          <Suspense fallback={<div className={styles.loading}>Loading drug info...</div>}>
            <SearchWrapper onDrugSelect={handleDrugSelect} selectedDrug={selectedDrug} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
