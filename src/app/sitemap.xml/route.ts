import { apiClient } from "@/lib/api";
import { NextResponse } from "next/server";
import { Drug } from "@/lib/types";

export const dynamic = "force-dynamic";

const validateDrug = (drug: Drug) => {
  if (!drug?.name) {
    console.warn("Invalid drug:", JSON.stringify(drug));
    throw new Error("Invalid drug object: Missing name");
  }
  return {
    name: String(drug.name),
  };
};

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.drugbit.info";
  const currentDate = new Date();

  try {
    console.log("Generating sitemap...");
    console.log("Base URL:", baseUrl);

    const staticUrls = [
      {
        loc: `${baseUrl}/`,
        lastmod: currentDate.toISOString(),
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: `${baseUrl}/about`,
        lastmod: currentDate.toISOString(),
        changefreq: "yearly",
        priority: 0.5,
      },
    ];

    // Fetch drugs with error handling
    let drugs: Array<{ name: string }> = [];
    try {
      const drugsRaw = await apiClient.searchDrugs("", { fetchAll: true });
      console.log("Drugs fetched:", drugsRaw.length);
      drugs = drugsRaw
        .map((drug, index) => {
          try {
            return validateDrug(drug);
          } catch (error) {
            console.warn(`Skipping invalid drug at index ${index}:`, error);
            return null;
          }
        })
        .filter((drug): drug is { name: string } => drug !== null);
    } catch (apiError) {
      console.error("API Error fetching drugs:", apiError);
      // Fallback: Hardcode a few drugs
      drugs = [
        { name: "acyclovir" },
        { name: "albumin" },
        { name: "alteplase" },
      ];
    }

    console.log("Valid drugs for sitemap:", drugs.length);

    const drugUrls = drugs.map((drug) => {
      const slug = drug.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      return {
        loc: `${baseUrl}/drug/${encodeURIComponent(slug)}`,
        lastmod: currentDate.toISOString(),
        changefreq: "weekly",
        priority: 0.8,
      };
    });

    const allUrls = [...staticUrls, ...drugUrls];
    console.log("Total URLs in sitemap:", allUrls.length);

    if (allUrls.length === 0) {
      console.warn("No URLs generated for sitemap");
    }

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

    console.log("Sitemap XML length:", xmlContent.length);

    const response = new NextResponse(xmlContent);
    response.headers.set("Content-Type", "application/xml");
    response.headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
    response.headers.set("X-Debug-Sitemap", "Generated"); // Debug header
    return response;
  } catch (error) {
    console.error("SITEMAP_ERROR:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Failed to generate sitemap</message>
  <timestamp>${new Date().toISOString()}</timestamp>
  <details>${errorMessage}</details>
</error>`;

    const errorResponse = new NextResponse(errorXml);
    errorResponse.headers.set("Content-Type", "application/xml");
    errorResponse.headers.set("X-Debug-Sitemap", "Error");
    return errorResponse;
  }
}
