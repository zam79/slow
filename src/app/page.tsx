import { Suspense } from "react";
import styles from "./page.module.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ClientSearch from "./components/search/ClientSearch";

export const revalidate = 86400; // Revalidate every 24 hours

export default async function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Drugs in Anesthesia and Critical Care</h1>
          <Suspense fallback={<div className={styles.loading}>Loading search...</div>}>
            <ClientSearch />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
