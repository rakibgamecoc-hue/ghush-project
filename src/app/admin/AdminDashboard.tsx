"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminReport = {
  id: string;
  departmentCategory: string;
  serviceType: string;
  stateRegion: string;
  districtLocation: string;
  amountDemanded: number;
  outcome: string;
  narrativeText: string;
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

type AdminDashboardProps = {
  pending: AdminReport[];
  recent: AdminReport[];
};

export function AdminDashboard({ pending, recent }: AdminDashboardProps) {
  const router = useRouter();
  const [items, setItems] = useState(pending);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const updateStatus = useCallback(
    async (id: string, reviewStatus: "APPROVED" | "REJECTED") => {
      setUpdatingId(id);
      setError(null);
      try {
        const res = await fetch(`/api/admin/reports/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewStatus }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Update failed");
          return;
        }
        setItems((current) => current.filter((item) => item.id !== id));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setUpdatingId(null);
      }
    },
    [router],
  );

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }, [router]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Admin Review</h1>
          <p className="text-sm text-slate-500">
            {items.length} pending &middot; {recent.length} recent decisions
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="border-2 border-slate-900 bg-white px-3 py-2 text-sm font-bold shadow-[3px_3px_0_rgba(15,23,42,0.9)] hover:bg-slate-100 disabled:opacity-60"
        >
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </header>

      {error && (
        <p role="alert" className="mb-4 border-2 border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <section aria-labelledby="pending-heading" className="mb-10 space-y-4">
        <h2 id="pending-heading" className="text-xl font-bold">
          Pending Review
        </h2>
        {items.length === 0 ? (
          <p className="rounded border-2 border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No reports waiting for review.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((report) => (
              <li
                key={report.id}
                className="border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0_rgba(15,23,42,0.9)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">
                      {report.departmentCategory} &mdash; {report.serviceType}
                    </p>
                    <p className="text-xs text-slate-500">
                      {report.districtLocation}, {report.stateRegion} &middot; Outcome: {report.outcome}
                    </p>
                    <p className="text-xs text-slate-400">Submitted {report.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-slate-900">
                      RM {report.amountDemanded.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap border-l-4 border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                  {report.narrativeText}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={updatingId === report.id}
                    onClick={() => updateStatus(report.id, "APPROVED")}
                    className="border-2 border-slate-900 bg-emerald-300 px-3 py-2 text-sm font-bold shadow-[3px_3px_0_rgba(15,23,42,0.9)] transition hover:bg-emerald-200 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === report.id}
                    onClick={() => updateStatus(report.id, "REJECTED")}
                    className="border-2 border-slate-900 bg-rose-300 px-3 py-2 text-sm font-bold shadow-[3px_3px_0_rgba(15,23,42,0.9)] transition hover:bg-rose-200 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="recent-heading" className="space-y-3">
        <h2 id="recent-heading" className="text-xl font-bold">
          Recent Decisions
        </h2>
        {recent.length === 0 ? (
          <p className="rounded border-2 border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No recent decisions.
          </p>
        ) : (
          <div className="overflow-x-auto border-2 border-slate-900 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-slate-200">
                    <td className="px-3 py-2 font-medium">{r.departmentCategory}</td>
                    <td className="px-3 py-2">{r.serviceType}</td>
                    <td className="px-3 py-2">
                      {r.districtLocation}, {r.stateRegion}
                    </td>
                    <td className="px-3 py-2">RM {r.amountDemanded.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          r.reviewStatus === "APPROVED"
                            ? "rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"
                            : "rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700"
                        }
                      >
                        {r.reviewStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
