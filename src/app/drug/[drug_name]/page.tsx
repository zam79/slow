import { notFound, redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api";
import { Drug } from "@/lib/types";
import { Metadata } from "next";
import styles from "./drug.module.css";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const DrugInfo = dynamic(() => import("../../components/drug/DrugInfo"), {
  ssr: false,
  loading: () => <div>Loading drug details...</div>,
});
// Module-scoped cache
const drugCache = new Map<string, Drug | null>();

export async function generateStaticParams() {
  try {
    const drugs = await apiClient.getSitemapLight();
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

interface DrugPageProps {
  params: Promise<{ drug_name: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ drug_name: string }>;
}): Promise<Metadata> {
  const { drug_name } = await params;
  const decodedName = decodeURIComponent(drug_name);

  if (drug_name.includes("%20")) {
    const hyphenatedName = decodedName.replace(/\s+/g, "-");
    redirect(`/drug/${encodeURIComponent(hyphenatedName)}`);
  }

  let drug = drugCache.get(decodedName);
  if (!drug) {
    drug = await apiClient.getDrug(decodedName);
    drugCache.set(decodedName, drug);
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
      drug.overview?.slice(0, 160) || `Detailed information about ${drug.name}`,
    keywords: [
      drug.name,
      drug.trade_name || "",
      drug.category,
      "anesthesia",
      "pharmacology",
    ].filter(Boolean),
    openGraph: {
      title: `${drug.name} | Drugbit.info`,
      description:
        drug.overview?.slice(0, 160) ||
        `Detailed information about ${drug.name}`,
      url: `https://www.drugbit.info/drug/${drug_name}`,
      type: "website",
    },
  };
}

export default async function DrugPage({ params }: DrugPageProps) {
  const { drug_name } = await params;
  const decodedName = decodeURIComponent(drug_name);

  if (drug_name.includes("%20")) {
    const hyphenatedName = decodedName.replace(/\s+/g, "-");
    redirect(`/drug/${encodeURIComponent(hyphenatedName)}`);
  }

  let drug = drugCache.get(decodedName);
  if (!drug) {
    drug = await apiClient.getDrug(decodedName);
    drugCache.set(decodedName, drug);
  }

  if (!drug) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Header showNav={true} />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>{drug.name}</h1>
        </section>
        <DrugInfo drug={drug} />
      </main>
      <Footer />
    </div>
  );
}
