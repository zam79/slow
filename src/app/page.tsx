// src/app/page.tsx
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "./page.module.css";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import ClientNav from "./components/ClientNav";
import ClientSearch from "./components/ClientSearch";
import { Drug } from "@/lib/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export default async function Home() {
  try {
    const categories = await apiClient.getCategories();
    const categoryDrugs: { [key: string]: Drug[] } = {};
    await Promise.all(
      categories.map(async (category) => {
        const drugs = await apiClient.getDrugsByCategory(category);
        categoryDrugs[category] = drugs;
      })
    );
    const initialCategory = categories[0] || "Other";

    return (
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleWrapper}>
              <span className={`${styles.logo} ${geistSans.variable}`}>
                Drugbit.info
              </span>
              <span className={`${styles.subtitle} ${geistSans.variable}`}>
                Anesthesia & ICU Essentials
              </span>
            </div>
            <Suspense fallback={<div>Loading navigation...</div>}>
              <ClientNav
                categories={categories}
                initialCategory={initialCategory}
                initialDrugs={categoryDrugs[initialCategory]}
                allDrugs={categoryDrugs}
              />
            </Suspense>
          </div>
        </header>
        <main className={styles.main}>
          <section className={styles.heroSection}>
            <h1 className={styles.heroTitle}>
              Drugs in Anesthesia and Critical Care
            </h1>
            <Suspense fallback={<div>Loading search...</div>}>
              <ClientSearch />
            </Suspense>
          </section>
        </main>
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
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleWrapper}>
              <span className={`${styles.logo} ${geistSans.variable}`}>
                Drugbit.info
              </span>
              <span className={`${styles.subtitle} ${geistSans.variable}`}>
                Anesthesia & ICU Essentials
              </span>
            </div>
          </div>
        </header>
        <main className={styles.main}>
          <section className={styles.heroSection}>
            <h1 className={styles.heroTitle}>Error loading content</h1>
            <p>Please try again later.</p>
          </section>
        </main>
      </div>
    );
  }
}

export const revalidate = 86400;
