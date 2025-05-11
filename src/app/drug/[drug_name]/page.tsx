import { notFound, redirect } from "next/navigation";
import { Inter } from "next/font/google";
import Link from "next/link";
import DrugInfo from "../../components/DrugInfo";
import { apiClient } from "@/lib/api";
import { Drug } from "@/lib/types";
import { Metadata } from "next";
import styles from "../../page.module.css";
import navStyles from "../../components/nav.module.css";

// Module-scoped cache to persist across generateMetadata and DrugPage
const drugCache = new Map<string, Drug | null>();

const inter = Inter({
  weight: ["300", "500", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateStaticParams() {
  try {
    const drugs = await apiClient.getSitemapDrugs();
    const uniqueDrugs = Array.from(new Set(drugs.map((drug) => drug.name))).map(
      (name) => drugs.find((drug) => drug.name === name)
    );
    return uniqueDrugs.map((drug) => ({
      drug_name: drug!.name, // Preserve hyphenated name
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

interface DrugPageProps {
  params: Promise<{ drug_name: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ drug_name: string }>;
}): Promise<Metadata> {
  const { drug_name } = await params;
  if (drug_name.includes("%20")) {
    const hyphenatedName = drug_name.replace(/%20/g, "-");
    redirect(`/drug/${encodeURIComponent(hyphenatedName)}`);
  }

  // Check cache first
  let drug: Drug | null = drugCache.get(drug_name) ?? null;
  if (drug === null) {
    console.log(`Cache miss for ${drug_name}, fetching from API`);
    drug = await apiClient.getDrug(drug_name);
    drugCache.set(drug_name, drug);
  } else {
    console.log(`Cache hit for ${drug_name}`);
  }

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
}

export default async function DrugPage({ params }: DrugPageProps) {
  const { drug_name } = await params;
  if (drug_name.includes("%20")) {
    const hyphenatedName = drug_name.replace(/%20/g, "-");
    redirect(`/drug/${encodeURIComponent(hyphenatedName)}`);
  }

  // Check cache first
  let drug: Drug | null = drugCache.get(drug_name) ?? null;
  if (drug === null) {
    console.log(`Cache miss for ${drug_name}, fetching from API`);
    drug = await apiClient.getDrug(drug_name);
    drugCache.set(drug_name, drug);
  } else {
    console.log(`Cache hit for ${drug_name}`);
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
