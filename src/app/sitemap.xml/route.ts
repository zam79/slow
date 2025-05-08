// src/app/sitemap.xml/route.ts
import { apiClient } from "@/lib/api";
import { NextResponse } from "next/server";
import { Drug } from "@/lib/types";

export const dynamic = "force-dynamic";

const validateDrug = (drug: Drug) => {
  if (!drug?.name) throw new Error("Invalid drug object");
  return {
    name: String(drug.name),
  };
};

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.drugbit.info";
  const currentDate = new Date();

  try {
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
      // Uncomment if /contact or /privacy pages are added
      // {
      //   loc: `${baseUrl}/contact`,
      //   lastmod: currentDate.toISOString(),
      //   changefreq: "yearly",
      //   priority: 0.5,
      // },
      // {
      //   loc: `${baseUrl}/privacy`,
      //   lastmod: currentDate.toISOString(),
      //   changefreq: "yearly",
      //   priority: 0.5,
      // },
    ];

    // Fetch all drugs for sitemap
    const drugsRaw = await apiClient.searchDrugs("", { fetchAll: true });
    const drugs = drugsRaw.map(validateDrug);

    if (drugs.length === 0) {
      console.warn("No drugs found for sitemap");
    }

    const drugUrls = drugs.map((drug) => {
      const slug = drug.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      return {
        loc: `${baseUrl}/drug/${encodeURIComponent(slug)}`,
        lastmod: currentDate.toISOString(), // Update if drug data includes a last modified date
        changefreq: "weekly",
        priority: 0.8,
      };
    });

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...staticUrls, ...drugUrls]
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

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("SITEMAP_ERROR:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Failed to generate sitemap</message>
  <timestamp>${new Date().toISOString()}</timestamp>
  <details>${error instanceof Error ? error.message : "Unknown error"}</details>
</error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml" },
      }
    );
  }
}
