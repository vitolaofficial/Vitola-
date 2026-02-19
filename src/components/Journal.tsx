import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Star, X, Calendar, Coffee, MapPin, Smile, Meh, Frown } from "lucide-react";
import type { CigarEntry } from "./Humidor";
import { useLanguage } from "@/i18n/LanguageContext";

export interface JournalEntry {
  id: string; cigarId?: string; cigarName: string; brand: string; date: string;
  location: string; mood: "great" | "good" | "neutral"; rating: number;
  pairing: string; notes: string; flavors: string[]; burnScore: number; drawScore: number;
}

interface JournalProps {
  entries: JournalEntry[];
  cigars: CigarEntry[];
  onAdd: (entry: JournalEntry) => void;
}

const flavorOptions = ["Cedar", "Chocolate", "Espresso", "Leather", "Pepper", "Cream", "Nuts", "Earth", "Floral", "Spice", "Honey", "Vanilla"];

const defaultJournalForm = {
  cigarName: "", brand: "", location: "", mood: "good" as "great" | "good" | "neutral",
  rating: 0, pairing: "", notes: "", flavors: [] as string[], burnScore: 3, drawScore: 3,
};

function MiniStars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={10} className={i < value ? "text-gold fill-gold" : "text-border"} />
      ))}
    </div>
  );
}

export function Journal({ entries, cigars, onAdd }: JournalProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultJournalForm);
  const { t } = useLanguage();

  const moodIcons = {
    great: { icon: Smile, label: t("journal.moodExcellent" as any), color: "text-emerald-400" },
    good: { icon: Meh, label: t("journal.moodGood" as any), color: "text-amber-400" },
    neutral: { icon: Frown, label: t("journal.moodMeh" as any), color: "text-muted-foreground" },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cigarName) return;
    const entry: JournalEntry = {
      ...form, id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    onAdd(entry);
    setForm(defaultJournalForm);
    setShowForm(false);
  };

  const toggleFlavor = (f: string) => {
    setForm((prev) => ({
      ...prev, flavors: prev.flavors.includes(f) ? prev.flavors.filter((x) => x !== f) : [...prev.flavors, f],
    }));
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-ui tracking-[0.2em] uppercase text-gold mb-2">{t("journal.tastingNotes" as any)}</p>
            <h1 className="font-display text-4xl md:text-5xl text-cream font-bold mb-2">{t("journal.title" as any)}</h1>
            <p className="font-serif-body text-muted-foreground">
              {entries.length === 0 ? t("journal.emptyDesc" as any) : t("journal.count" as any, { count: entries.length, s: entries.length === 1 ? "" : "s" })}
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-mahogany font-ui font-medium text-sm tracking-wider uppercase hover:shadow-gold transition-all duration-300 hover:scale-[1.02]">
            <Plus size={14} />
            {t("journal.newEntry" as any)}
          </button>
        </div>
        <div className="divider-gold mt-6" />
      </motion.div>

      {entries.length === 0 && !showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="text-6xl mb-6 animate-float">📓</div>
          <p className="font-display text-2xl text-cream mb-3">{t("journal.emptyTitle" as any)}</p>
          <p className="font-serif-body text-muted-foreground mb-8 max-w-sm mx-auto">{t("journal.emptyText" as any)}</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-8 py-3 border border-gold text-gold font-ui text-sm tracking-wider uppercase hover:bg-gold hover:text-mahogany transition-all duration-300">
            <Plus size={14} />
            {t("journal.logFirst" as any)}
          </button>
        </motion.div>
      )}

      {entries.length > 0 && (
        <div className="space-y-4">
          {entries.map((entry, i) => {
            const MoodIcon = moodIcons[entry.mood].icon;
            return (
              <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="gradient-card border border-border hover:border-gold/30 p-5 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-display text-cream font-semibold text-base">{entry.cigarName}</p>
                    <p className="text-xs font-ui text-muted-foreground mt-0.5">{entry.brand}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoodIcon size={16} className={moodIcons[entry.mood].color} />
                    <span className="text-xs font-ui text-muted-foreground">{entry.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3 text-xs font-ui">
                  {entry.rating > 0 && <MiniStars value={Math.round(entry.rating / 20)} />}
                  {entry.location && <span className="flex items-center gap-1 text-muted-foreground"><MapPin size={10} /> {entry.location}</span>}
                  {entry.pairing && <span className="flex items-center gap-1 text-muted-foreground"><Coffee size={10} /> {entry.pairing}</span>}
                </div>
                {entry.flavors.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {entry.flavors.map((f) => (<span key={f} className="text-xs font-ui px-2 py-0.5 bg-muted text-muted-foreground border border-border">{f}</span>))}
                  </div>
                )}
                <div className="flex gap-4 mb-3 text-xs font-ui">
                  <span className="text-muted-foreground">{t("journal.burn" as any)} <span className="text-foreground ml-1">{entry.burnScore}/5</span></span>
                  <span className="text-muted-foreground">{t("journal.draw" as any)} <span className="text-foreground ml-1">{entry.drawScore}/5</span></span>
                </div>
                {entry.notes && (
                  <p className="font-serif-body text-foreground italic text-sm leading-relaxed border-t border-border pt-3">"{entry.notes}"</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-mahogany/90 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-card border border-border shadow-deep w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-2xl text-cream">{t("journal.logSession" as any)}</h2>
                  <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-cream"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("journal.cigarName" as any)} *</label>
                      <input required list="cigar-suggestions" value={form.cigarName} onChange={(e) => setForm({ ...form, cigarName: e.target.value })} placeholder="e.g. Behike 52"
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
                      <datalist id="cigar-suggestions">{cigars.map((c) => <option key={c.id} value={c.name} />)}</datalist>
                    </div>
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("journal.brand" as any)}</label>
                      <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Cohiba"
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("journal.location" as any)}</label>
                      <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Terrace, lounge"
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("journal.pairedWith" as any)}</label>
                      <input value={form.pairing} onChange={(e) => setForm({ ...form, pairing: e.target.value })} placeholder="e.g. Scotch, espresso"
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2 block">{t("journal.mood" as any)}</label>
                    <div className="flex gap-3">
                      {(Object.keys(moodIcons) as Array<"great" | "good" | "neutral">).map((m) => {
                        const { icon: Icon, label, color } = moodIcons[m];
                        return (
                          <button key={m} type="button" onClick={() => setForm({ ...form, mood: m })}
                            className={`flex items-center gap-2 px-4 py-2 border text-sm font-ui transition-all ${form.mood === m ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground hover:border-gold/40"}`}>
                            <Icon size={14} className={form.mood === m ? color : ""} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2 block">{t("journal.flavorsDetected" as any)}</label>
                    <div className="flex gap-2 flex-wrap">
                      {flavorOptions.map((f) => (
                        <button key={f} type="button" onClick={() => toggleFlavor(f)}
                          className={`text-xs font-ui px-3 py-1.5 border transition-all ${form.flavors.includes(f) ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground hover:border-gold/40"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2 block">{t("journal.burnQuality" as any)} ({form.burnScore}/5)</label>
                      <input type="range" min={1} max={5} value={form.burnScore} onChange={(e) => setForm({ ...form, burnScore: parseInt(e.target.value) })} className="w-full accent-gold" />
                    </div>
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2 block">{t("journal.drawQuality" as any)} ({form.drawScore}/5)</label>
                      <input type="range" min={1} max={5} value={form.drawScore} onChange={(e) => setForm({ ...form, drawScore: parseInt(e.target.value) })} className="w-full accent-gold" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2 block">{t("journal.overallRating" as any)}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setForm({ ...form, rating: s * 20 })} className="transition-transform hover:scale-110">
                          <Star size={18} className={`${form.rating / 20 >= s ? "text-gold fill-gold" : "text-border"} transition-colors`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("journal.notes" as any)}</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Describe the experience..." rows={3}
                      className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors resize-none font-serif-body" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 border border-border text-muted-foreground font-ui text-sm tracking-wider uppercase hover:text-cream hover:border-foreground/30 transition-all">
                      {t("journal.cancel" as any)}
                    </button>
                    <button type="submit"
                      className="flex-1 px-4 py-3 bg-gold text-mahogany font-ui font-medium text-sm tracking-wider uppercase hover:shadow-gold transition-all duration-300">
                      {t("journal.save" as any)}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
