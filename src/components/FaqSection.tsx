"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FaqSection() {
  return (
    <section className="max-w-3xl mx-auto space-y-6 pt-10">
      <h2 className="text-2xl font-black text-center">Soalan Lazim (FAQ)</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-bold text-left">Adakah identiti saya selamat?</AccordionTrigger>
          <AccordionContent className="text-slate-600 leading-relaxed">
            Ya. Platform ini dibina berasaskan privasi mutlak (&quot;zero-knowledge&quot;). Kami tidak meminta nama, emel, atau nombor telefon anda. Sistem kami juga dibina untuk menolak dan tidak menyimpan alamat IP atau ejen pengguna (User-Agent) anda.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger className="font-bold text-left">Apa yang berlaku jika saya masukkan maklumat peribadi dalam cerita?</AccordionTrigger>
          <AccordionContent className="text-slate-600 leading-relaxed">
            Sistem kami mempunyai penapis kecerdasan buatan (AI) yang akan mengimbas dan memadam sebarang nombor telefon, nombor kad pengenalan (MyKad), nombor plat kenderaan, dan nama manusia yang dikesan sebelum ia disimpan ke dalam pangkalan data.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="font-bold text-left">Adakah ini laporan rasmi kepada SPRM?</AccordionTrigger>
          <AccordionContent className="text-slate-600 leading-relaxed">
            Tidak. Ini hanyalah lejar kesedaran awam yang mengumpul data secara awanomi (crowdsourced). Platform ini tidak menggantikan laporan rasmi undang-undang. Ia direka untuk memberi gambaran ketelusan terhadap tuntutan rasuah dalam perkhidmatan awam.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
