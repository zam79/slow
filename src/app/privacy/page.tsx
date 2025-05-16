import { Metadata } from "next";
import styles from "../page.module.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Drugbit.info",
  description: "Read our privacy policy to understand how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p>
            At Drugbit.info, we value your privacy. This policy outlines how we
            collect, use, and protect your data.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
