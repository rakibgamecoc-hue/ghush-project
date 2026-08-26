"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      const data = await res.json();
      return data.stats;
    }
  });

  if (isLoading) return <div className="h-32 bg-slate-100 animate-pulse rounded-md" />;

  const refusalRate = data?.totalReports > 0 ? Math.round((data.rejectedCount / data.totalReports) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Jumlah Permintaan Dilapor (RM)</h3>
          <p className="text-4xl font-black">RM {data?.totalAmount?.toLocaleString() || "0"}</p>
        </CardContent>
      </Card>
      
      <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Kadar Penolakan Awam (%)</h3>
          <p className="text-4xl font-black">{refusalRate}%</p>
          <p className="text-xs font-medium text-slate-400 mt-1">Laporan yang ditolak bayaran rasuah.</p>
        </CardContent>
      </Card>
    </div>
  );
}
