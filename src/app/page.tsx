"use client";

import { useState } from "react";
import { ReportModal } from "@/components/ReportModal";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { LedgerFeed } from "@/components/LedgerFeed";
import { FaqSection } from "@/components/FaqSection";
import { SiteHeader } from "@/components/SiteHeader";
import { translations, type SupportedLanguage } from "@/lib/translations";

export default function Home() {
  const [language, setLanguage] = useState<SupportedLanguage>("ms");
  const t = translations[language];

  return (
    <>
      <SiteHeader language={language} setLanguage={setLanguage} />
      <main id="top" className="mx-auto max-w-6xl px-4 py-12 space-y-16">
        <section className="mx-auto max-w-3xl space-y-6 pt-10 text-center">
          <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900">
            {t.hero.headline}
            <br />
            <span className="mt-2 inline-block rounded-sm bg-yellow-100 px-2 text-yellow-700">
              {t.hero.accent}
            </span>
          </h1>
          <p className="text-lg text-slate-600">{t.hero.subtitle}</p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <ReportModal locale={language} />
            <a href="#ledger" className="text-sm font-medium text-slate-700 hover:underline">
              {t.hero.secondary}
            </a>
          </div>
        </section>

        <div id="metrics">
          <DashboardMetrics locale={language} />
        </div>

        <div id="ledger">
          <LedgerFeed locale={language} />
        </div>

        <div id="faq">
          <FaqSection locale={language} />
        </div>

        <footer className="mt-16 border-t border-slate-200 pb-8 pt-16 text-center text-sm text-slate-500">
          <p className="mb-2 font-semibold">{t.footer.legalDisclaimer}</p>
          <p className="mx-auto max-w-2xl">{t.footer.disclaimerBody}</p>
        </footer>
      </main>
    </>
  );
}
