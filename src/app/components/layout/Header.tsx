import Link from "next/link";
import styles from "../../page.module.css";
import navStyles from "@/app/components/navigation/nav.module.css";

export default function Header({ showNav = true }: { showNav?: boolean }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleWrapper}>
          <span className={styles.logo}>Drugbit.info</span>
          <span className={styles.subtitle}>Anesthesia & ICU Essentials</span>
        </div>
        {showNav && (
          <nav
            className={navStyles.nav}
            aria-label="Drug categories navigation"
          >
            <div className={navStyles.categoryWrapper}>
              <Link href="/" className={navStyles.mainButton}>
                Back to Home
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
