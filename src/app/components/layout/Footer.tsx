import Link from "next/link";
import styles from "../../page.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerContent}>
        <p>© 2025 Drugbit.info. All rights reserved.</p>
        <Link href="/about" className={styles.footerLink}>
          About
        </Link>
        <Link href="/contact" className={styles.footerLink}>
          Contact
        </Link>
        <Link href="/privacy" className={styles.footerLink}>
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
