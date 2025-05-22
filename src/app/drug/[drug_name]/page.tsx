import { notFound, redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api";
import { Drug } from "@/lib/types";
import { Metadata } from "next";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const DrugInfo = dynamic(() => import("../../components/drug/DrugInfo"), {
  ssr: false,
  loading: () => <div>Loading drug details...</div>,
});

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
    drug = await apiClient.getDrugByName(decodedName);
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
    drug = await apiClient.getDrugByName(decodedName);
    drugCache.set(decodedName, drug);
  }

  if (!drug) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-inter">
      <Header /> {/* Removed showNav prop */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full sm:px-4 sm:py-8">
        <section className="bg-gradient-hero rounded-2xl px-6 py-12 text-center text-white relative shadow-2xl transition-transform duration-300 ease-in-out z-10 hero-overlay hover:-translate-y-1 sm:px-4 sm:py-8 sm:rounded-xl">
          <h1 className="text-4xl font-bold mb-4 leading-tight relative z-10 shadow-[0_2px_4px_rgba(0,0,0,0.3)] sm:text-3xl xs:text-2xl">
            {drug.name}
          </h1>
        </section>
        <DrugInfo drug={drug} />
      </main>
      <Footer />
    </div>
  );
}
