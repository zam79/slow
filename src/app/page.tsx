import { Suspense } from "react";
import styles from "./page.module.css";
import { apiClient } from "@/lib/api";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ClientNav from "./components/navigation/ClientNav";
import ClientSearch from "./components/search/ClientSearch";
import { Drug } from "@/lib/types";

export const revalidate = 86400; // Revalidate every 24 hours

export default async function Home() {
  let categories: string[] = [];
  let categoryDrugs: { [key: string]: Drug[] } = {};
  let initialCategory: string = "Other";

  try {
    categoryDrugs = await apiClient.getAllDrugsByCategories();
    categories = Object.keys(categoryDrugs).filter((key) => key && Array.isArray(categoryDrugs[key]));
    initialCategory = categories[0] || "Other";
    console.log("API Response:", {
      categories,
      initialCategory,
      initialDrugs: categoryDrugs[initialCategory]?.map((d) => d.name) || [],
      initialDrugsCount: categoryDrugs[initialCategory]?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }

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
        <Suspense fallback={<div className={styles.loading}>Loading navigation...</div>}>
          <ClientNav
            categories={categories}
            initialCategory={initialCategory}
            initialDrugs={categoryDrugs[initialCategory] || []}
            allDrugs={categoryDrugs}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
