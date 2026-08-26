"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const DEPARTMENTS = ["JPJ", "PDRM", "Imigresen", "Kastam", "LHDN", "Hospital Kerajaan", "PBT", "Lain-lain"];
const STATES = ["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"];

export function ReportModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    departmentCategory: "",
    serviceType: "",
    stateRegion: "",
    districtLocation: "",
    amountDemanded: "",
    outcome: "PENDING",
    narrativeText: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setOpen(false);
      setFormData({
        departmentCategory: "", serviceType: "", stateRegion: "", districtLocation: "", amountDemanded: "", outcome: "PENDING", narrativeText: ""
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none">
          Lapor Rasuah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Laporkan Permintaan Rasuah</DialogTitle>
          <DialogDescription>
            Tolong JANGAN masukkan nama orang, nombor telefon, atau nombor rujukan fail. Maklumat anda dirahsiakan.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jabatan / Agensi</label>
              <Select onValueChange={(v: string | null) => setFormData({...formData, departmentCategory: v ?? ""})} required>
                <SelectTrigger><SelectValue placeholder="Pilih Agensi" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jenis Urusan</label>
              <Input placeholder="Cth: Renew Lesen" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Negeri</label>
              <Select onValueChange={(v: string | null) => setFormData({...formData, stateRegion: v ?? ""})} required>
                <SelectTrigger><SelectValue placeholder="Pilih Negeri" /></SelectTrigger>
                <SelectContent>
                  {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Daerah / Cawangan</label>
              <Input placeholder="Cth: JPJ Wangsa Maju" value={formData.districtLocation} onChange={e => setFormData({...formData, districtLocation: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jumlah Diminta (RM)</label>
              <Input type="number" min="0" placeholder="0.00" value={formData.amountDemanded} onChange={e => setFormData({...formData, amountDemanded: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status / Keputusan</label>
              <Select onValueChange={(v: string | null) => setFormData({...formData, outcome: v ?? "PENDING"})} value={String(formData.outcome)} required>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">DIBAYAR (Paid)</SelectItem>
                  <SelectItem value="REJECTED">DITOLAK (Rejected)</SelectItem>
                  <SelectItem value="PENDING">BELUM SELESAI (Pending)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cerita (Naratif)</label>
            <Textarea 
              placeholder="Ceritakan apa yang berlaku tanpa mendedahkan identiti peribadi..." 
              className="min-h-25"
              value={formData.narrativeText}
              onChange={e => setFormData({...formData, narrativeText: e.target.value})}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-black text-white hover:bg-slate-800" disabled={mutation.isPending}>
            {mutation.isPending ? "Sedang Menghantar..." : "Hantar Laporan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
