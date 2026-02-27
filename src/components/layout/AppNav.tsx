import { useState } from "react";
import { Home, Archive, Compass, MessageCircle, BookOpen, X, Menu, Globe, LogOut, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { languageLabels, type Language, type TranslationKey } from "@/i18n/translations";
import { SmokeHoverWrap } from "@/components/effects/SmokeEffect";
import { useSmokeClick } from "@/hooks/useSmokeEffect";

type Page = "dashboard" | "humidor" | "discover" | "journal" | "pairing" | "concierge";

interface NavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSignOut?: () => void;
}

const navIcons = {
  dashboard: Home,
  humidor: Archive,
  discover: Compass,
  journal: BookOpen,
  pairing: Sparkles,
  concierge: MessageCircle
};

const navKeys: Record<Page, TranslationKey> = {
  dashboard: "nav.home",
  humidor: "nav.humidor",
  discover: "nav.discover",
  journal: "nav.journal",
  pairing: "nav.pairing",
  concierge: "nav.concierge",
};

const pages: Page[] = ["dashboard", "humidor", "discover", "journal", "pairing", "concierge"];
const langs: Language[] = ["en", "tr", "es"];

export function AppNav({ currentPage, onNavigate, onSignOut }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { containerRef: smokeRef, triggerSmoke } = useSmokeClick();

  const LanguageSwitcher = () => (
    <div>
      <p className="text-xs font-ui tracking-[0.2em] uppercase text-muted-foreground mb-2 flex items-center gap-2">
        <Globe size={12} /> {t("nav.language" as TranslationKey)}
      </p>
      <div className="flex gap-1.5">
        {langs.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`text-xs font-ui px-3 py-1.5 border transition-all duration-200 ${language === lang
              ? "border-gold text-gold bg-gold/10"
              : "border-border text-muted-foreground hover:border-gold/40 hover:text-cream"
              }`}
          >
            {languageLabels[lang]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside ref={smokeRef} className="hidden md:flex flex-col w-56 min-h-screen bg-sidebar border-r border-sidebar-border py-8 px-6 relative overflow-hidden">
        <div className="mb-10">
          <div className="divider-gold mb-6" />
          <p className="text-xs font-ui tracking-[0.25em] uppercase text-gold mb-1 animate-glow-breathe">{t("nav.premium" as TranslationKey)}</p>
          <h1 className="font-display text-2xl text-cream font-bold smoke-text">{t("nav.title" as TranslationKey)}</h1>
          <div className="divider-gold mt-4" />
        </div>

        <nav className="flex-1 space-y-1">
          {pages.map((id) => {
            const Icon = navIcons[id];
            const active = currentPage === id;
            return (
              <SmokeHoverWrap key={id}>
                <button
                  onClick={(e) => { triggerSmoke(e); onNavigate(id); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-ui tracking-wide transition-all duration-200 text-left ${active
                    ? "text-gold border-l-2 border-gold bg-gold/5 pl-[14px]"
                    : "text-sidebar-foreground hover:text-cream hover:bg-sidebar-accent border-l-2 border-transparent"
                    }`}
                >
                  <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                  <span className={active ? "font-medium" : ""}>{t(navKeys[id])}</span>
                </button>
              </SmokeHoverWrap>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="divider-gold mb-4" />
          <LanguageSwitcher />
          {onSignOut && (
            <button onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-ui text-cream/30 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-300 mt-3" title="Sign Out">
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          )}
          <p className="text-xs text-muted-foreground font-ui text-center tracking-wider mt-4">
            {t("nav.footer" as TranslationKey)}
          </p>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-sidebar/95 backdrop-blur border-b border-sidebar-border">
        <h1 className="font-display text-lg text-cream font-bold">{t("nav.title" as TranslationKey)}</h1>
        <button onClick={() => setMobileOpen(true)} className="text-gold p-1" title="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-mahogany/90 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-56 bg-sidebar border-l border-sidebar-border py-8 px-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-display text-xl text-cream font-bold">{t("nav.menu" as TranslationKey)}</h1>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-cream" title="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1 mb-8">
              {pages.map((id) => {
                const Icon = navIcons[id];
                const active = currentPage === id;
                return (
                  <button
                    key={id}
                    onClick={() => { onNavigate(id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-ui transition-all duration-200 text-left ${active ? "text-gold" : "text-sidebar-foreground hover:text-cream"
                      }`}
                  >
                    <Icon size={16} />
                    <span>{t(navKeys[id])}</span>
                  </button>
                );
              })}
            </nav>
            <LanguageSwitcher />
            {onSignOut && (
              <button onClick={onSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-ui text-cream/30 hover:text-red-400 transition-all mt-4" title="Sign Out">
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export type { Page };
