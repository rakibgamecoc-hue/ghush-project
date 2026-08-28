"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { LANGUAGE_OPTIONS, type SupportedLanguage, translations } from "@/lib/translations";

const NAV_ITEMS = [
  { key: "home", href: "#top" },
  { key: "metrics", href: "#metrics" },
  { key: "ledger", href: "#ledger" },
  { key: "faq", href: "#faq" },
] as const;

type SiteHeaderProps = {
  language: SupportedLanguage;
  setLanguage: (value: SupportedLanguage) => void;
};

export function SiteHeader({ language, setLanguage }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  const t = translations[language];
  const currentLanguage = LANGUAGE_OPTIONS.find((option) => option.value === language) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!navRef.current || navRef.current.contains(target)) return;

      setIsMenuOpen(false);
      setIsLanguageMenuOpen(false);
      setIsQuickJumpOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsLanguageMenuOpen(false);
        setIsQuickJumpOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleJump = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMenuOpen(false);
    setIsQuickJumpOpen(false);
  };

  const showLanguageMenu = () => {
    setIsLanguageMenuOpen((open) => !open);
    setIsQuickJumpOpen(false);
  };

  const showQuickJump = () => {
    setIsQuickJumpOpen((open) => !open);
    setIsLanguageMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full py-4">
      <div className="mx-auto max-w-6xl px-4" ref={navRef}>
        <div className="rounded-full border-2 border-slate-900 bg-white/90 shadow-[0_6px_0_rgba(15,23,42,0.9)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <button
              type="button"
              onClick={() => handleJump("#top")}
              className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Go to top"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-yellow-400 text-sm font-black text-slate-900">
                R
              </span>
              <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Rasuah</span>
            </button>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleJump(item.href)}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {t.nav[item.key as keyof typeof t.nav]}
                </button>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <div className="relative">
                <button
                  type="button"
                  onClick={showQuickJump}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                  aria-label={t.nav.quickJump}
                >
                  <span>{t.nav.quickJump}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isQuickJumpOpen && (
                  <div className="menu-pop-in absolute right-0 mt-2 flex min-w-44 origin-top-right flex-col rounded-2xl border-2 border-slate-900 bg-white p-2 shadow-[6px_6px_0_rgba(15,23,42,0.9)]">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleJump(item.href)}
                        className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        {t.nav[item.key as keyof typeof t.nav]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={showLanguageMenu}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-yellow-400 px-3 py-2 text-sm font-bold text-slate-900 transition hover:bg-yellow-300"
                  aria-label={t.nav.language}
                >
                  <Globe className="h-4 w-4" />
                  <span>{currentLanguage.short}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isLanguageMenuOpen && (
                  <div className="menu-pop-in absolute right-0 mt-2 flex min-w-40 origin-top-right flex-col rounded-2xl border-2 border-slate-900 bg-white p-2 shadow-[6px_6px_0_rgba(15,23,42,0.9)]">
                    {LANGUAGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setLanguage(option.value);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
                          language === option.value ? "bg-yellow-100 text-slate-900" : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100 text-slate-900 md:hidden"
              aria-label="Open mobile menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="menu-pop-in space-y-3 border-t-2 border-slate-900 p-4 md:hidden">
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleJump(item.href)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100"
                  >
                    {t.nav[item.key as keyof typeof t.nav]}
                  </button>
                ))}
              </div>
 
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-[0_4px_0_rgba(15,23,42,0.08)]">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t.nav.language}</p>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setLanguage(option.value);
                        setIsMenuOpen(false);
                      }}
                      className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
                        language === option.value ? "bg-yellow-100 text-slate-900 ring-2 ring-yellow-300" : "bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
