import { apiClient } from "@/lib/api";
import { NextResponse } from "next/server";
import { Drug } from "@/lib/types";

export const dynamic = "force-dynamic";

const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const validateDrug = (drug: Drug) => {
  if (!drug?.name) {
    console.warn("Invalid drug:", JSON.stringify(drug));
    throw new Error("Invalid drug object: Missing name");
  }
  return {
    name: String(drug.name),
    url: drug.url || null,
  };
};

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.drugbit.info";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const sitemapKey = process.env.NEXT_PUBLIC_SITEMAP_KEY || "";
  const currentDate = new Date();

  if (!sitemapKey) {
    console.error("SITEMAP_KEY not set in environment variables");
  }

  try {
    console.log("Generating sitemap...");
    console.log("Base URL:", baseUrl);
    console.log("API URL:", apiUrl);

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

    let drugs: Array<{ name: string; url: string | null }> = [];
    try {
      const drugsRaw = await apiClient.getSitemapDrugs();
      console.log("Sitemap drugs fetched:", drugsRaw.length);
      drugs = drugsRaw
        .map((drug, index) => {
          try {
            return validateDrug(drug);
          } catch (error) {
            console.warn(`Skipping invalid drug at index ${index}:`, error);
            return null;
          }
        })
        .filter(
          (drug): drug is { name: string; url: string | null } => drug !== null
        );
    } catch (apiError) {
      console.error("API Error fetching sitemap drugs:", apiError);
      return new NextResponse("Error fetching sitemap drugs", { status: 500 });
    }

    console.log("Valid drugs for sitemap:", drugs.length);
    console.log(
      "Drug names:",
      drugs.map((d) => d.name)
    );

    const drugUrls = drugs.map((drug) => {
      const loc =
        drug.url || `${baseUrl}/drug/${encodeURIComponent(drug.name)}`;
      const escapedLoc = escapeXml(loc);
      console.log(`Generated URL for ${drug.name}: ${escapedLoc}`);
      return {
        loc: escapedLoc,
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
    response.headers.set("X-Debug-Sitemap", "Generated");
    return response;
  } catch (error) {
    console.error("SITEMAP_ERROR:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Failed to generate sitemap</message>
  <timestamp>${new Date().toISOString()}</timestamp>
  <details>${escapeXml(errorMessage)}</details>
</error>`;

    const errorResponse = new NextResponse(errorXml);
    errorResponse.headers.set("Content-Type", "application/xml");
    errorResponse.headers.set("X-Debug-Sitemap", "Error");
    return errorResponse;
  }
}
