import { Metadata } from "next";
import styles from "../page.module.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Contact | Drugbit.info",
  description: "Get in touch with the Drugbit.info team.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p>Email: support@drugbit.info</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
