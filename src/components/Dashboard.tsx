import { motion } from "framer-motion";
import { Archive, Compass, MessageCircle, Star, Clock, TrendingUp } from "lucide-react";
import type { UserLevel } from "./OnboardingQuiz";
import type { Page } from "./AppNav";
import heroCigars from "@/assets/hero-cigars.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

interface DashboardProps {
  level: UserLevel;
  onNavigate: (page: Page) => void;
  humidorCount: number;
}

const featuredCigars = [
  { name: "Cohiba Behike 52", origin: "Cuba", strength: "Full", rating: 98, notes: "Cedar, dark chocolate, espresso" },
  { name: "Padron 1964 Anniversary", origin: "Nicaragua", strength: "Full", rating: 96, notes: "Cocoa, leather, black pepper" },
  { name: "Arturo Fuente Opus X", origin: "Dominican Republic", strength: "Full", rating: 97, notes: "Floral, cedar, spice" },
  { name: "My Father Le Bijou 1922", origin: "Nicaragua", strength: "Full+", rating: 95, notes: "Dark earth, coffee, fig" },
];

export function Dashboard({ level, onNavigate, humidorCount }: DashboardProps) {
  const { t } = useLanguage();
  const greeting = t(`dashboard.greeting.${level}` as any);
  const sub = t(`dashboard.sub.${level}` as any);
  const tip = t(`dashboard.tip.${level}` as any);
  const tipLabel = t(`dashboard.tipLabel.${level}` as any);
  const levelBadge = t(`level.${level}` as any);

  const quickActions = [
    { icon: Archive, label: t("dashboard.openHumidor" as any), page: "humidor" as Page, description: t("dashboard.manageCollection" as any) },
    { icon: Compass, label: t("dashboard.discover" as any), page: "discover" as Page, description: t("dashboard.exploreBlends" as any) },
    { icon: MessageCircle, label: t("dashboard.askConcierge" as any), page: "concierge" as Page, description: t("dashboard.aiExpert" as any) },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-ui tracking-[0.2em] uppercase text-gold border border-gold/40 px-3 py-1">{levelBadge}</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-cream font-bold mb-3">{greeting}</h1>
        <p className="font-serif-body text-lg text-muted-foreground">{sub}</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Archive, label: t("dashboard.inHumidor" as any), value: humidorCount, suffix: t("dashboard.cigars" as any) },
          { icon: Star, label: t("dashboard.avgRating" as any), value: humidorCount > 0 ? "94.5" : "—", suffix: "" },
          { icon: TrendingUp, label: t("dashboard.collection" as any), value: humidorCount > 0 ? t("dashboard.growing" as any) : t("dashboard.startNow" as any), suffix: "" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="gradient-card border border-border p-4 shadow-card">
              <Icon size={14} className="text-gold mb-2" />
              <p className="font-display text-2xl text-cream font-bold">{stat.value}</p>
              <p className="text-xs font-ui text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Daily Tip */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url(${heroCigars})` }} />
        <div className="relative border border-gold/30 p-6 bg-card/80">
          <div className="flex items-start gap-4">
            <Clock size={16} className="text-gold mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs font-ui tracking-[0.2em] uppercase text-gold mb-2">{tipLabel}</p>
              <p className="font-serif-body text-cream text-base leading-relaxed">{tip}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-10">
        <p className="text-xs font-ui tracking-[0.2em] uppercase text-muted-foreground mb-4">{t("dashboard.quickAccess" as any)}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.page} onClick={() => onNavigate(action.page)} className="group gradient-card border border-border hover:border-gold/40 p-5 text-left transition-all duration-300 hover:shadow-gold">
                <Icon size={20} className="text-gold mb-3 group-hover:scale-110 transition-transform duration-200" />
                <p className="font-ui font-medium text-cream text-sm">{action.label}</p>
                <p className="font-serif-body text-muted-foreground text-sm mt-1">{action.description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Featured Cigars */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-ui tracking-[0.2em] uppercase text-muted-foreground">{t("dashboard.worldsFinest" as any)}</p>
          <button onClick={() => onNavigate("discover")} className="text-xs font-ui text-gold hover:text-gold-light tracking-wider transition-colors">
            {t("dashboard.exploreAll" as any)}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featuredCigars.map((cigar, i) => (
            <div key={i} className="gradient-card border border-border hover:border-gold/30 p-4 transition-all duration-300 cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-display text-cream font-semibold text-sm group-hover:text-gold transition-colors">{cigar.name}</p>
                  <p className="text-xs font-ui text-muted-foreground mt-0.5">{cigar.origin} · {cigar.strength}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-gold fill-gold" />
                  <span className="text-xs font-ui font-bold text-gold">{cigar.rating}</span>
                </div>
              </div>
              <p className="text-xs font-serif-body text-muted-foreground italic">{cigar.notes}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
