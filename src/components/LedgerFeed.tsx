"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function LedgerFeed() {
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("latest");

  const { data, isLoading } = useQuery({
    queryKey: ["reports", filter, sort],
    queryFn: async () => {
      const res = await fetch(`/api/reports?outcome=${filter}&sort=${sort}`);
      const json = await res.json();
      return json.reports || [];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black">Lejar Awam Langsung</h2>
        
        <Tabs defaultValue="ALL" onValueChange={setFilter}>
          <TabsList className="bg-slate-200">
            <TabsTrigger value="ALL">Semua</TabsTrigger>
            <TabsTrigger value="PAID">Dibayar</TabsTrigger>
            <TabsTrigger value="REJECTED">Ditolak</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium">Susunan:</span>
        <select className="text-sm bg-transparent border-b border-black font-medium focus:outline-none" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="latest">Terbaru</option>
          <option value="highest">Jumlah Tertinggi</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse border border-slate-200" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((report: ApiReport) => (
            <Card key={report.id} className="border border-slate-200 rounded-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <Badge variant="outline" className="mb-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                    Tidak Disahkan (Unverified)
                  </Badge>
                  <CardTitle className="text-lg font-bold">
                    {report.departmentCategory} - {report.serviceType}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    {report.districtLocation}, {report.stateRegion}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xl font-black text-slate-900">RM {report.amountDemanded}</span>
                  <Badge className={
                    report.outcome === "PAID" ? "bg-red-500" :
                    report.outcome === "REJECTED" ? "bg-green-500" :
                    "bg-slate-500"
                  }>
                    {report.outcome}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap">
                  {report.narrativeText}
                </p>
                <p className="text-xs text-slate-400 mt-4">
                  Dilaporkan pada {new Date(report.createdAt).toLocaleDateString("ms-MY")}
                </p>
              </CardContent>
            </Card>
          ))}
          {data?.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              Tiada laporan dijumpai.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
