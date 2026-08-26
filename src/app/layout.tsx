import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rasuah - Public Bribe Ledger",
  description: "A privacy-first, crowdsourced public ledger for tracking public service bribe demands in Malaysia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-stone-50 text-slate-900 min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
