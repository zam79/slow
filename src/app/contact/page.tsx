import { Geist } from "next/font/google";
import styles from "../page.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function ContactPage() {
  return (
    <div className={`${styles.page} ${geistSans.variable}`}>
      <main className={styles.main}>
        <section className={styles.contentSection}>
          <h1 className={styles.sectionTitle}>Contact Us</h1>

          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h2>General Inquiries</h2>
              <p>
                <a href="mailto:info@drugbit.info" className={styles.link}>
                  info@drugbit.info
                </a>
              </p>
              <p>We typically respond within 2 business days.</p>
            </div>

            <div className={styles.contactCard}>
              <h2>Content Corrections</h2>
              <p>
                <a href="mailto:content@drugbit.info" className={styles.link}>
                  content@drugbit.info
                </a>
              </p>
              <p>Please include references for any suggested updates.</p>
            </div>

            <div className={styles.contactCard}>
              <h2>Technical Support</h2>
              <p>
                <a href="mailto:support@drugbit.info" className={styles.link}>
                  support@drugbit.info
                </a>
              </p>
              <p>Report bugs or technical issues.</p>
            </div>

            <div className={styles.contactForm}>
              <h2>Send Us a Message</h2>
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    className={styles.formTextarea}
                    required
                  ></textarea>
                </div>
                <button type="submit" className={styles.primaryButton}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
