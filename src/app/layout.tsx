import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import CookiesConsent from "./components/CookiesConsent";
import AnalyticsTracker from "./components/AnalyticsTracker";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Drugbit.info",
    default: "Drugbit.info - Anesthesia & ICU Drug Search",
  },
  description:
    "Search for detailed drug information for anesthesia and critical care.",
  keywords: ["anesthesia", "ICU", "drugs", "medical", "critical care"],
  openGraph: {
    type: "website",
    url: "https://www.drugbit.info",
    siteName: "Drugbit.info",
    title: "Drugbit.info",
    description:
      "Search for detailed drug information for anesthesia and critical care.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drugbit.info",
    description:
      "Search for detailed drug information for anesthesia and critical care.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL || "https://data.drugbit.info"}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Render children */}
        {children}

        {/* Cookies consent banner */}
        <CookiesConsent />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
