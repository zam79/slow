import { Metadata } from "next";
import styles from "../page.module.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "About | Drugbit.info",
  description: "Learn more about Drugbit.info and our mission.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>About Drugbit.info</h1>
          <p>
            Drugbit.info is dedicated to providing detailed drug information for
            anesthesia and critical care professionals.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
