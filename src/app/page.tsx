import { ReportModal } from "@/components/ReportModal";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { LedgerFeed } from "@/components/LedgerFeed";
import { FaqSection } from "@/components/FaqSection";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-10">
        <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Seseorang minta wang tambahan...<br />
          <span className="text-yellow-600 bg-yellow-100 px-2 rounded-sm inline-block mt-2">
            catatkan di buku lejar.
          </span>
        </h1>
        <p className="text-lg text-slate-600">
          Name the department. Name the demand. Keep the person private. 
          A zero-knowledge, crowdsourced ledger to track public service corruption in Malaysia.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <ReportModal />
          <a href="#ledger" className="text-sm font-medium hover:underline text-slate-700">
            Lihat Lejar Langsung
          </a>
        </div>
      </section>

      {/* Metrics */}
      <DashboardMetrics />

      {/* Ledger Feed */}
      <div id="ledger">
        <LedgerFeed />
      </div>

      {/* FAQ */}
      <FaqSection />

      {/* Footer / Disclaimer */}
      <footer className="pt-16 pb-8 text-center text-sm text-slate-500 border-t border-slate-200 mt-16">
        <p className="font-semibold mb-2">Legal Disclaimer</p>
        <p className="max-w-2xl mx-auto">
          This platform is an unverified public awareness ledger and does not constitute formal legal complaints or evidence for statutory anti-corruption authorities. No IP addresses or personally identifiable information are logged.
        </p>
      </footer>
    </main>
  );
}
