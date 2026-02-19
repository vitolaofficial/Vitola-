import { useState } from "react";
import { Home, Archive, Compass, MessageCircle, BookOpen, X, Menu, Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { languageLabels, type Language } from "@/i18n/translations";

type Page = "dashboard" | "humidor" | "discover" | "journal" | "concierge";

interface NavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navIcons = { dashboard: Home, humidor: Archive, discover: Compass, journal: BookOpen, concierge: MessageCircle };
const navKeys: Record<Page, string> = {
  dashboard: "nav.home",
  humidor: "nav.humidor",
  discover: "nav.discover",
  journal: "nav.journal",
  concierge: "nav.concierge",
};
const pages: Page[] = ["dashboard", "humidor", "discover", "journal", "concierge"];
const langs: Language[] = ["en", "tr", "es"];

export function AppNav({ currentPage, onNavigate }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const LanguageSwitcher = () => (
    <div>
      <p className="text-xs font-ui tracking-[0.2em] uppercase text-muted-foreground mb-2 flex items-center gap-2">
        <Globe size={12} /> {t("nav.language" as any)}
      </p>
      <div className="flex gap-1.5">
        {langs.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`text-xs font-ui px-3 py-1.5 border transition-all duration-200 ${
              language === lang
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
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border py-8 px-6">
        <div className="mb-10">
          <div className="divider-gold mb-6" />
          <p className="text-xs font-ui tracking-[0.25em] uppercase text-gold mb-1">{t("nav.premium" as any)}</p>
          <h1 className="font-display text-2xl text-cream font-bold">{t("nav.title" as any)}</h1>
          <div className="divider-gold mt-4" />
        </div>

        <nav className="flex-1 space-y-1">
          {pages.map((id) => {
            const Icon = navIcons[id];
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-ui tracking-wide transition-all duration-200 text-left ${
                  active
                    ? "text-gold border-l-2 border-gold bg-gold/5 pl-[14px]"
                    : "text-sidebar-foreground hover:text-cream hover:bg-sidebar-accent border-l-2 border-transparent"
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                <span className={active ? "font-medium" : ""}>{t(navKeys[id] as any)}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="divider-gold mb-4" />
          <LanguageSwitcher />
          <p className="text-xs text-muted-foreground font-ui text-center tracking-wider mt-4">
            {t("nav.footer" as any)}
          </p>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-sidebar/95 backdrop-blur border-b border-sidebar-border">
        <h1 className="font-display text-lg text-cream font-bold">{t("nav.title" as any)}</h1>
        <button onClick={() => setMobileOpen(true)} className="text-gold p-1">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-mahogany/80" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-sidebar border-l border-sidebar-border py-8 px-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-display text-xl text-cream font-bold">{t("nav.menu" as any)}</h1>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-cream">
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
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-ui transition-all duration-200 text-left ${
                      active ? "text-gold" : "text-sidebar-foreground hover:text-cream"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{t(navKeys[id] as any)}</span>
                  </button>
                );
              })}
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </>
  );
}

export type { Page };
