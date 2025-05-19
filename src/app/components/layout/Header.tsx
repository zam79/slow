import Link from "next/link";
import styles from "../../page.module.css";

export default function Header({ showNav = true }: { showNav?: boolean }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleWrapper}>
          <span className={styles.logo}>Drugbit.info</span>
          <span className={styles.subtitle}>Anesthesia & ICU Essentials</span>
        </div>

        {showNav && (
          <nav aria-label="Main navigation">
            <Link href="/" className={styles.navLink}>
              Home
            </Link>
            {/* Add more links if needed, e.g., <Link href="/about">About</Link> */}
          </nav>
        )}
      </div>
    </header>
  );
}
