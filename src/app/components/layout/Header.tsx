"use client";

import Link from "next/link";
import styles from "../../page.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleWrapper}>
          <Link href="/" className={styles.logo}>
            Drugbit.info
          </Link>
          <span className={styles.subtitle}>Anesthesia & ICU Essentials</span>
        </div>
      </div>
    </header>
  );
}
