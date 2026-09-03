import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rasuah.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rasuah — Public Bribe Reporting Platform | Malaysia",
    template: "%s | Rasuah",
  },
  description:
    "Report and track public service bribery demands in Malaysia. A privacy-first, crowdsourced public ledger. Name the department. Name the demand. Keep identities private.",
  keywords: [
    "bribery",
    "malaysia",
    "public service",
    "report",
    "anti-corruption",
    "transparency",
    "crowdsourced",
    "privacy",
    "ledger",
    "MACC",
    "SPRM",
    "ghusah",
    "rasuah",
  ],
  authors: [{ name: "Rasuah" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Rasuah",
    title: "Rasuah — Public Bribe Reporting Platform | Malaysia",
    description:
      "Report and track public service bribery demands in Malaysia. A privacy-first, crowdsourced public ledger.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rasuah - Public Bribe Reporting Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rasuah — Public Bribe Reporting Platform | Malaysia",
    description:
      "Report and track public service bribery demands in Malaysia. A privacy-first, crowdsourced public ledger.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-stone-50 text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
