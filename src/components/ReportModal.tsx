"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translations, type SupportedLanguage } from "@/lib/translations";

const DEPARTMENTS = ["JPJ", "PDRM", "Imigresen", "Kastam", "LHDN", "Hospital Kerajaan", "PBT", "Lain-lain"];
const STATES = ["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"];

type ReportModalProps = {
  locale?: SupportedLanguage;
};

export function ReportModal({ locale = "ms" }: ReportModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const t = translations[locale].report;

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
        departmentCategory: "",
        serviceType: "",
        stateRegion: "",
        districtLocation: "",
        amountDemanded: "",
        outcome: "PENDING",
        narrativeText: "",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="rounded-none border-2 border-black bg-yellow-500 text-lg font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:bg-yellow-600 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            {translations[locale].hero.primary}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(formData);
          }}
          className="space-y-4 pt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.department}</label>
              <Select onValueChange={(v: string | null) => setFormData({ ...formData, departmentCategory: v ?? "" })} required>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectDepartment} />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.serviceType}</label>
              <Input
                placeholder={t.exampleService}
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.state}</label>
              <Select onValueChange={(v: string | null) => setFormData({ ...formData, stateRegion: v ?? "" })} required>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectState} />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.district}</label>
              <Input
                placeholder={t.exampleDistrict}
                value={formData.districtLocation}
                onChange={(e) => setFormData({ ...formData, districtLocation: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.amount}</label>
              <Input
                type="number"
                min="0"
                placeholder="0.00"
                value={formData.amountDemanded}
                onChange={(e) => setFormData({ ...formData, amountDemanded: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.outcome}</label>
              <Select onValueChange={(v: string | null) => setFormData({ ...formData, outcome: v ?? "PENDING" })} value={String(formData.outcome)} required>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">{locale === "en" ? "PAID" : locale === "zh" ? "已付款" : locale === "bn" ? "দেওয়া হয়েছে" : locale === "ta" ? "செலுத்தப்பட்டது" : "DIBAYAR"}</SelectItem>
                  <SelectItem value="REJECTED">{locale === "en" ? "REJECTED" : locale === "zh" ? "已拒绝" : locale === "bn" ? "প্রত্যাখ্যান করা হয়েছে" : locale === "ta" ? "நிராகரிக்கப்பட்டது" : "DITOLAK"}</SelectItem>
                  <SelectItem value="PENDING">{locale === "en" ? "PENDING" : locale === "zh" ? "待处理" : locale === "bn" ? "অপেক্ষমাণ" : locale === "ta" ? "நிலுவையில்" : "BELUM SELESAI"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.narrative}</label>
            <Textarea
              placeholder={t.placeholderNarrative}
              className="min-h-25"
              value={formData.narrativeText}
              onChange={(e) => setFormData({ ...formData, narrativeText: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-black text-white hover:bg-slate-800" disabled={mutation.isPending}>
            {mutation.isPending ? t.submitting : t.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
