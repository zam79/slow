import Link from "next/link";
import styles from "../../page.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerContent}>
        <p>© 2025 Drugbit.info. All rights reserved.</p>
        <ul className={styles.footerNavList}>
          <li>
            <Link href="/about" className={styles.footerNavLink}>
              About
            </Link>
          </li>
          <li>
            <Link href="/privacy" className={styles.footerNavLink}>
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/contact" className={styles.footerNavLink}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
