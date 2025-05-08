// src/app/drug/[drug_name]/page.tsx
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import Link from "next/link";
import DrugInfo from "../../components/DrugInfo";
import { apiClient } from "@/lib/api";
import { Drug } from "@/lib/types";
import { Metadata } from "next";
import styles from "../../page.module.css";
import navStyles from "../../components/nav.module.css";

const inter = Inter({
  weight: ["300", "500", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});

// Generate static paths for all drugs at build time
export async function generateStaticParams() {
  try {
    const drugs = await apiClient.searchDrugs("", { fetchAll: true });
    return drugs.map((drug) => ({
      drug_name: drug.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ drug_name: string }>;
}): Promise<Metadata> {
  const { drug_name } = await params;
  const drugName = decodeURIComponent(drug_name.replace(/-/g, " "));
  try {
    const drug = await apiClient.getDrug(drugName);
    if (!drug) {
      return {
        title: "Drug Not Found | Drugbit.info",
        description: "The requested drug could not be found.",
      };
    }
    return {
      title: `${drug.name} | Drugbit.info`,
      description:
        drug.overview.slice(0, 160) ||
        `Detailed information about ${drug.name}`,
      keywords: [
        drug.name,
        drug.trade_name || "",
        drug.category,
        "anesthesia",
        "pharmacology",
      ],
      openGraph: {
        title: `${drug.name} | Drugbit.info`,
        description: drug.overview.slice(0, 160),
        url: `https://www.drugbit.info/drug/${drug_name}`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error | Drugbit.info",
      description: "An error occurred while fetching drug information.",
    };
  }
}

interface DrugPageProps {
  params: Promise<{ drug_name: string }>;
}

export default async function DrugPage({ params }: DrugPageProps) {
  const { drug_name } = await params;
  const drugName = decodeURIComponent(drug_name.replace(/-/g, " "));
  let drug: Drug | null = null;

  try {
    drug = await apiClient.getDrug(drugName);
  } catch (error) {
    console.error("Error fetching drug:", error);
  }

  if (!drug) {
    notFound();
  }

  return (
    <div className={`${styles.page} ${inter.variable}`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleWrapper}>
            <span className={`${styles.logo} ${inter.variable}`}>
              Drugbit.info
            </span>
            <span className={`${styles.subtitle} ${inter.variable}`}>
              Anesthesia & ICU Essentials
            </span>
          </div>
          <nav
            className={navStyles.nav}
            aria-label="Drug categories navigation"
          >
            <div className={navStyles.categoryWrapper}>
              <Link href="/" className={navStyles.mainButton}>
                Back to Home
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>{drug.name}</h1>
        </section>
        <DrugInfo drug={drug} />
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
}
