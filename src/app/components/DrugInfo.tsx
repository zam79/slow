// src/app/components/DrugInfo.tsx
"use client";

import { useState, useEffect } from "react";
import { Drug } from "@/lib/types";
import styles from "./drugInfo.module.css";

interface DrugInfoProps {
  drug: Drug;
}

export default function DrugInfo({ drug }: DrugInfoProps) {
  const [openSections, setOpenSections] = useState({
    dosing: false,
    pharmacokinetics: false,
    pharmacodynamics: false,
    clinical: false,
  });

  useEffect(() => {
    console.log(`Drug changed to: ${drug.name}`);
    setOpenSections({
      dosing: false,
      pharmacokinetics: false,
      pharmacodynamics: false,
      clinical: false,
    });
  }, [drug]);

  const toggleSection = (section: keyof typeof openSections) => {
    console.log(`Toggling section: ${section}`);
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.name}>{drug.name}</h2>
      {drug.trade_name && (
        <p className={styles.tradeName}>({drug.trade_name})</p>
      )}
      <p className={styles.category}>{drug.category}</p>
      <p className={styles.overview}>{drug.overview}</p>
      <div className={styles.section}>
        <button
          onClick={() => toggleSection("dosing")}
          className={styles.sectionTitle}
          aria-expanded={openSections.dosing}
          aria-controls="dosing-section"
        >
          Dosing
          <span className={styles.arrow}>
            {openSections.dosing ? "▲" : "▼"}
          </span>
        </button>
        {openSections.dosing && (
          <div id="dosing-section" className={styles.sectionContent}>
            {drug.dosing}
          </div>
        )}
      </div>
      <div className={styles.section}>
        <button
          onClick={() => toggleSection("pharmacokinetics")}
          className={styles.sectionTitle}
          aria-expanded={openSections.pharmacokinetics}
          aria-controls="pharmacokinetics-section"
        >
          Pharmacokinetics
          <span className={styles.arrow}>
            {openSections.pharmacokinetics ? "▲" : "▼"}
          </span>
        </button>
        {openSections.pharmacokinetics && (
          <div id="pharmacokinetics-section" className={styles.sectionContent}>
            {drug.pharmacokinetics}
          </div>
        )}
      </div>
      <div className={styles.section}>
        <button
          onClick={() => toggleSection("pharmacodynamics")}
          className={styles.sectionTitle}
          aria-expanded={openSections.pharmacodynamics}
          aria-controls="pharmacodynamics-section"
        >
          Pharmacodynamics
          <span className={styles.arrow}>
            {openSections.pharmacodynamics ? "▲" : "▼"}
          </span>
        </button>
        {openSections.pharmacodynamics && (
          <div id="pharmacodynamics-section" className={styles.sectionContent}>
            {drug.pharmacodynamics}
          </div>
        )}
      </div>
      <div className={styles.section}>
        <button
          onClick={() => toggleSection("clinical")}
          className={styles.sectionTitle}
          aria-expanded={openSections.clinical}
          aria-controls="clinical-section"
        >
          Clinical Practical Considerations
          <span className={styles.arrow}>
            {openSections.clinical ? "▲" : "▼"}
          </span>
        </button>
        {openSections.clinical && (
          <div id="clinical-section" className={styles.sectionContent}>
            {drug.clinical_practical_considerations}
          </div>
        )}
      </div>
    </div>
  );
}
