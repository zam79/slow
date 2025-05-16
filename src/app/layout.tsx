import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookiesConsent from "./components/layout/CookiesConsent";

const inter = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
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
          href={
            process.env.NEXT_PUBLIC_API_URL || "https://drug-6.onrender.com"
          }
        />
      </head>
      <body className={inter.variable}>
        {children}
        <CookiesConsent />
      </body>
    </html>
  );
}
