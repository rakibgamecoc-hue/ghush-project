"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { translations, type SupportedLanguage } from "@/lib/translations";

type ApiReport = {
  id: string;
  departmentCategory: string;
  serviceType: string;
  stateRegion: string;
  districtLocation: string;
  amountDemanded: number;
  outcome: string;
  narrativeText: string;
  createdAt: string;
};

type LedgerFeedProps = {
  locale?: SupportedLanguage;
};

export function LedgerFeed({ locale = "ms" }: LedgerFeedProps) {
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("latest");

  const { data, isLoading } = useQuery({
    queryKey: ["reports", filter, sort],
    queryFn: async () => {
      const res = await fetch(`/api/reports?outcome=${filter}&sort=${sort}`);
      if (!res.ok) {
        return [];
      }

      const json = await res.json();
      return json.reports || [];
    },
  });

  const t = translations[locale].ledger;
  const dateLocaleMap: Record<SupportedLanguage, string> = {
    ms: "ms-MY",
    en: "en-US",
    zh: "zh-CN",
    bn: "bn-BD",
    ta: "ta-IN",
  };

  const TabLabels: Record<string, string> = {
    ALL: t.all,
    PAID: t.paid,
    REJECTED: t.rejected,
    PENDING: t.pending,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-black">{t.title}</h2>

        <Tabs defaultValue="ALL" onValueChange={setFilter}>
          <TabsList className="bg-slate-200">
            <TabsTrigger value="ALL">{TabLabels.ALL}</TabsTrigger>
            <TabsTrigger value="PAID">{TabLabels.PAID}</TabsTrigger>
            <TabsTrigger value="REJECTED">{TabLabels.REJECTED}</TabsTrigger>
            <TabsTrigger value="PENDING">{TabLabels.PENDING}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium">{t.order}</span>
        <select className="border-b border-black bg-transparent text-sm font-medium focus:outline-none" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="latest">{t.latest}</option>
          <option value="highest">{t.highest}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 animate-pulse border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((report: ApiReport) => (
            <Card key={report.id} className="rounded-none border-2 border-slate-900 bg-white shadow-[4px_4px_0_rgba(15,23,42,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(15,23,42,0.9)]">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <Badge variant="outline" className="mb-2 border-yellow-300 bg-yellow-100 text-yellow-800">
                    {t.unverified}
                  </Badge>
                  <CardTitle className="text-lg font-bold">
                    {report.departmentCategory} - {report.serviceType}
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.districtLocation}, {report.stateRegion}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xl font-black text-slate-900">RM {report.amountDemanded}</span>
                  <Badge
                    className={
                      report.outcome === "PAID"
                        ? "bg-red-500"
                        : report.outcome === "REJECTED"
                          ? "bg-green-500"
                          : "bg-slate-500"
                    }
                  >
                    {report.outcome}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{report.narrativeText}</p>
                <p className="mt-4 text-xs text-slate-400">
                  {t.reportedOn} {new Date(report.createdAt).toLocaleDateString(dateLocaleMap[locale])}
                </p>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t.votePrompt}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      size="lg"
                      className="h-12 rounded-none border-2 border-slate-900 bg-emerald-100 text-sm font-bold text-slate-900 hover:bg-emerald-200"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {t.agree}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      className="h-12 rounded-none border-2 border-slate-900 bg-rose-100 text-sm font-bold text-slate-900 hover:bg-rose-200"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      {t.disagree}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.length === 0 && <div className="col-span-full py-12 text-center text-slate-500">{t.noReports}</div>}
        </div>
      )}
    </div>
  );
}
