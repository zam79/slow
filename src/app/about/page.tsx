import { Geist } from "next/font/google";
import styles from "../page.module.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function AboutPage() {
  return (
    <div className={`${styles.page} ${geistSans.variable}`}>
      <main className={styles.main}>
        <section className={styles.contentSection}>
          <h1 className={styles.sectionTitle}>About Drugbit.info</h1>

          <div className={styles.contentCard}>
            <section className={styles.aboutSection}>
              <h2>Our Mission</h2>
              <p>
                Drugbit.info was created to provide anesthesia and critical care
                professionals with quick, reliable access to essential drug
                information. Our goal is to streamline clinical decision-making
                with accurate, up-to-date data presented in a clear, accessible
                format.
              </p>
            </section>

            <section className={styles.aboutSection}>
              <h2>Who We Are</h2>
              <p>
                We&apos;re a team of anesthesiologists, pharmacists, and
                software developers passionate about improving patient care
                through better information access. Our content is carefully
                curated and regularly reviewed by board-certified specialists.
              </p>
            </section>

            <section className={styles.aboutSection}>
              <h2>Data Sources</h2>
              <p>Our information comes from reputable sources including:</p>
              <ul className={styles.aboutList}>
                <li>FDA-approved prescribing information</li>
                <li>Peer-reviewed medical literature</li>
                <li>Clinical practice guidelines</li>
                <li>Manufacturer data sheets</li>
              </ul>
            </section>

            <section className={styles.aboutSection}>
              <h2>Disclaimer</h2>
              <p>
                While we strive for accuracy, Drugbit.info is intended as a
                reference tool only and should not replace professional clinical
                judgment. Always verify critical information and consult primary
                sources when making patient care decisions.
              </p>
            </section>

            <div className={styles.ctaButtons}>
              <Link href="/contact" className={styles.primaryButton}>
                Contact Us
              </Link>
              <Link href="/" className={styles.secondaryButton}>
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
