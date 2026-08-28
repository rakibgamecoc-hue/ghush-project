"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { translations, type SupportedLanguage } from "@/lib/translations";

type DashboardMetricsProps = {
  locale?: SupportedLanguage;
};

type ReportRecord = {
  stateRegion?: string;
  amountDemanded?: number;
};

export function DashboardMetrics({ locale = "ms" }: DashboardMetricsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      if (!res.ok) {
        return { stats: { totalAmount: 0, totalReports: 0, rejectedCount: 0 }, reports: [] };
      }

      const json = await res.json();
      return {
        stats: json.stats ?? { totalAmount: 0, totalReports: 0, rejectedCount: 0 },
        reports: json.reports ?? [],
      };
    },
  });

  const t = translations[locale].metrics;

  const stateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const reports = (data?.reports ?? []) as ReportRecord[];

    for (const report of reports) {
      const state = report.stateRegion?.trim();
      if (!state) continue;
      counts.set(state, (counts.get(state) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  const maxStateCount = stateCounts.length > 0 ? Math.max(...stateCounts.map((item) => item.count)) : 1;

  if (isLoading) return <div className="h-32 animate-pulse rounded-md bg-slate-100" />;

  const stats = data?.stats ?? { totalAmount: 0, totalReports: 0, rejectedCount: 0 };
  const refusalRate = stats.totalReports > 0 ? Math.round((stats.rejectedCount / stats.totalReports) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">{t.totalDemand}</h3>
            <p className="text-4xl font-black">RM {stats.totalAmount?.toLocaleString() || "0"}</p>
            <p className="mt-2 text-xs font-medium text-slate-400">{t.totalDemandFootnote}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">{t.refusalRate}</h3>
            <p className="text-4xl font-black">{refusalRate}%</p>
            <p className="mt-2 text-xs font-medium text-slate-400">{t.refusalRateFootnote}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{t.topStates}</h3>
            <span className="rounded-full border-2 border-slate-900 bg-yellow-300 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
              {stateCounts.length}
            </span>
          </div>
          <p className="mb-4 text-xs font-medium text-slate-400">{t.topStatesFootnote}</p>

          <div className="space-y-4">
            {stateCounts.length > 0 ? (
              stateCounts.map((entry) => (
                <div key={entry.state} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                    <span>{entry.state}</span>
                    <span className="font-black text-slate-900">{entry.count}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden border-2 border-slate-900 bg-slate-100">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${(entry.count / maxStateCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-none border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                No state data yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
