"use client";

import { useState } from "react";
import { ReportModal } from "@/components/ReportModal";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { LedgerFeed } from "@/components/LedgerFeed";
import { FaqSection } from "@/components/FaqSection";
import { SiteHeader } from "@/components/SiteHeader";
import { useLanguagePreference } from "@/lib/language-preference";
import { translations } from "@/lib/translations";

export default function Home() {
  const [language, setLanguage] = useLanguagePreference();
  const [showTerms, setShowTerms] = useState(false);

  // Language persistence handled by `useLanguagePreference`

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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.16em] text-slate-400">
            <a href="mailto:rakibhassan215095@gmail.com" className="transition hover:text-slate-700">Contact developer</a>
            <span>•</span>
            <button type="button" onClick={() => setShowTerms((current) => !current)} className="transition hover:text-slate-700">
              {showTerms ? "Hide terms" : "Terms & Conditions"}
            </button>
          </div>
          {showTerms && (
            <div id="terms" className="mt-6 max-w-2xl text-left text-[10px] leading-relaxed text-slate-400">
              By using this platform, you agree that all submissions are public awareness records and not formal legal complaints. You must not post personally identifiable information, defamatory content, or false claims. The operator is not responsible for misuse, inaccuracies, or third-party actions arising from submitted reports.
            </div>
          )}
        </footer>
      </main>
    </>
  );
}
