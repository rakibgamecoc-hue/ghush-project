"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { translations, type SupportedLanguage } from "@/lib/translations";

type FaqSectionProps = {
  locale?: SupportedLanguage;
};

export function FaqSection({ locale = "ms" }: FaqSectionProps) {
  const t = translations[locale].faq;

  return (
    <section className="mx-auto max-w-3xl space-y-6 pt-10">
      <h2 className="text-center text-2xl font-black">{t.title}</h2>

      <Accordion className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-left font-bold">{t.q1}</AccordionTrigger>
          <AccordionContent className="leading-relaxed text-slate-600">{t.a1}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-left font-bold">{t.q2}</AccordionTrigger>
          <AccordionContent className="leading-relaxed text-slate-600">{t.a2}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-left font-bold">{t.q3}</AccordionTrigger>
          <AccordionContent className="leading-relaxed text-slate-600">{t.a3}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
