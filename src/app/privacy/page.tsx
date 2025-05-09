import { Geist } from "next/font/google";
import styles from "../page.module.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function PrivacyPage() {
  return (
    <div className={`${styles.page} ${geistSans.variable}`}>
      <main className={styles.main}>
        <section className={styles.contentSection}>
          <h1 className={styles.sectionTitle}>Privacy Policy</h1>

          <div className={styles.contentCard}>
            <p className={styles.lastUpdated}>
              <em>Last Updated: January 1, 2025</em>
            </p>

            <section className={styles.policySection}>
              <h2>Information We Collect</h2>
              <p>
                Drugbit.info is committed to protecting your privacy. We collect
                minimal data necessary to operate the service:
              </p>
              <ul className={styles.policyList}>
                <li>
                  <strong>Usage Data:</strong> Anonymous analytics about how the
                  site is used
                </li>
                <li>
                  <strong>Technical Data:</strong> Browser type, device
                  information for compatibility
                </li>
                <li>
                  <strong>Cookies:</strong> Only essential cookies for site
                  functionality
                </li>
              </ul>
            </section>

            <section className={styles.policySection}>
              <h2>How We Use Information</h2>
              <p>We use collected data solely to:</p>
              <ul className={styles.policyList}>
                <li>Improve site performance and user experience</li>
                <li>Understand usage patterns to enhance content</li>
                <li>Ensure security and prevent abuse</li>
              </ul>
            </section>

            <section className={styles.policySection}>
              <h2>Data Sharing</h2>
              <p>
                We do not sell or share personal data with third parties except:
              </p>
              <ul className={styles.policyList}>
                <li>
                  Service providers necessary for site operation (under strict
                  confidentiality)
                </li>
                <li>When required by law</li>
              </ul>
            </section>

            <section className={styles.policySection}>
              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul className={styles.policyList}>
                <li>Request access to your data</li>
                <li>Request correction or deletion</li>
                <li>Opt-out of non-essential data collection</li>
              </ul>
            </section>

            <section className={styles.policySection}>
              <h2>Changes to This Policy</h2>
              <p>
                We may update this policy periodically. Significant changes will
                be announced on our website.
              </p>
            </section>

            <div className={styles.ctaButtons}>
              <Link href="/contact" className={styles.secondaryButton}>
                Contact for Privacy Questions
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
