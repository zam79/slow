import { Drug } from "@/lib/types";
import styles from "./drugInfo.module.css";

interface DrugInfoProps {
  drug: Drug;
}

export default function DrugInfo({ drug }: DrugInfoProps) {
  return (
    <div className={styles.drugInfo}>
      <p>
        <strong>Category:</strong> {drug.category}
      </p>
      {drug.trade_name && (
        <p>
          <strong>Trade Name:</strong> {drug.trade_name}
        </p>
      )}
      <p>
        <strong>Overview:</strong> {drug.overview}
      </p>
      <p>
        <strong>Dosing:</strong> {drug.dosing}
      </p>
      <p>
        <strong>Pharmacokinetics:</strong> {drug.pharmacokinetics}
      </p>
      <p>
        <strong>Pharmacodynamics:</strong> {drug.pharmacodynamics}
      </p>
      <p>
        <strong>Clinical Considerations:</strong>{" "}
        {drug.clinical_practical_considerations}
      </p>
      {drug.is_emergency && (
        <p>
          <strong>Emergency Use:</strong> Yes
        </p>
      )}
      {drug.url && (
        <p>
          <strong>More Info:</strong>{" "}
          <a href={drug.url} target="_blank" rel="noopener noreferrer">
            External Link
          </a>
        </p>
      )}
    </div>
  );
}
