"use client";

import { useState } from "react";
import { Drug } from "@/lib/types";
import styles from "./drugInfo.module.css";

interface DrugInfoProps {
  drug: Drug;
}

const ExpandableSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.section}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.sectionTitle}
      >
        {title}
        <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && <div className={styles.sectionContent}>{children}</div>}
    </div>
  );
};

export default function DrugInfo({ drug }: DrugInfoProps) {
  return (
    <div>
      {/* Hero Card with Drug Name */}
      <div className={styles.heroCard}>
        <h1 className={styles.name}>{drug.name}</h1>
      </div>

      {/* Main Content Container */}
      <div className={styles.container}>
        {/* Trade Name */}
        {drug.trade_name && (
          <p className={styles.tradeName}>{drug.trade_name}</p>
        )}

        {/* Overview */}
        <p className={styles.overview}>{drug.overview}</p>

        {/* Expandable Sections */}
        <ExpandableSection title="Dosing">
          <p>{drug.dosing}</p>
        </ExpandableSection>

        <ExpandableSection title="Pharmacokinetics">
          <p>{drug.pharmacokinetics}</p>
        </ExpandableSection>

        <ExpandableSection title="Pharmacodynamics">
          <p>{drug.pharmacodynamics}</p>
        </ExpandableSection>

        <ExpandableSection title="Clinical Considerations">
          <p>{drug.clinical_practical_considerations}</p>
        </ExpandableSection>

        {drug.is_emergency && (
          <ExpandableSection title="Emergency Use">
            <p>Yes</p>
          </ExpandableSection>
        )}

        {drug.url && (
          <ExpandableSection title="More Info">
            <a href={drug.url} target="_blank" rel="noopener noreferrer">
              External Link
            </a>
          </ExpandableSection>
        )}
      </div>
    </div>
  );
}
