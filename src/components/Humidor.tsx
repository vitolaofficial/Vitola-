import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Star, Trash2, X, ChevronDown, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export interface CigarEntry {
  id: string;
  name: string;
  brand: string;
  origin: string;
  wrapper: string;
  strength: "Mild" | "Medium" | "Full" | "Full+";
  size: string;
  quantity: number;
  rating: number;
  notes: string;
  addedDate: string;
  addedTimestamp: number;
}

const origins = ["Cuba", "Nicaragua", "Dominican Republic", "Honduras", "Ecuador", "Brazil", "Mexico", "Cameroon"];
const wrappers = ["Connecticut Shade", "Colorado Claro", "Colorado", "Colorado Maduro", "Maduro", "Oscuro", "Candela", "Claro"];
const strengths: CigarEntry["strength"][] = ["Mild", "Medium", "Full", "Full+"];

interface HumidorProps {
  cigars: CigarEntry[];
  onAdd: (cigar: CigarEntry) => void;
  onRemove: (id: string) => void;
}

const defaultForm: Omit<CigarEntry, "id" | "addedDate" | "addedTimestamp"> = {
  name: "", brand: "", origin: "Cuba", wrapper: "Colorado", strength: "Medium", size: "", quantity: 1, rating: 0, notes: "",
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star * 20)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-110">
          <Star size={18} className={`${(hover || value / 20) >= star ? "text-gold fill-gold" : "text-border"} transition-colors`} />
        </button>
      ))}
    </div>
  );
}

export function Humidor({ cigars, onAdd, onRemove }: HumidorProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedCigar, setSelectedCigar] = useState<CigarEntry | null>(null);
  const { t } = useLanguage();

  const getAgingText = (timestamp: number): string => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days === 0) return t("humidor.addedToday" as any);
    if (days < 30) return t("humidor.dAging" as any, { d: days });
    if (days < 365) return t("humidor.moAging" as any, { m: Math.floor(days / 30) });
    return t("humidor.yrAging" as any, { y: (days / 365).toFixed(1) });
  };

  const getAgingColor = (timestamp: number): string => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days < 30) return "text-muted-foreground";
    if (days < 90) return "text-amber-400";
    if (days < 365) return "text-emerald-400";
    return "text-gold";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.brand) return;
    const now = Date.now();
    const entry: CigarEntry = {
      ...form, id: now.toString(),
      addedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      addedTimestamp: now,
    };
    onAdd(entry);
    setForm(defaultForm);
    setShowForm(false);
  };

  const strengthColor = { Mild: "text-emerald-400", Medium: "text-amber-400", Full: "text-orange-500", "Full+": "text-red-500" };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-ui tracking-[0.2em] uppercase text-gold mb-2">{t("humidor.myCollection" as any)}</p>
            <h1 className="font-display text-4xl md:text-5xl text-cream font-bold mb-2">{t("humidor.title" as any)}</h1>
            <p className="font-serif-body text-muted-foreground">
              {cigars.length === 0
                ? t("humidor.emptyDesc" as any)
                : t("humidor.count" as any, { count: cigars.length, s: cigars.length === 1 ? "" : "s" })}
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-mahogany font-ui font-medium text-sm tracking-wider uppercase hover:shadow-gold transition-all duration-300 hover:scale-[1.02]">
            <Plus size={14} />
            {t("humidor.addCigar" as any)}
          </button>
        </div>
        <div className="divider-gold mt-6" />
      </motion.div>

      {/* Empty State */}
      {cigars.length === 0 && !showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="text-6xl mb-6 animate-float">🍂</div>
          <p className="font-display text-2xl text-cream mb-3">{t("humidor.emptyTitle" as any)}</p>
          <p className="font-serif-body text-muted-foreground mb-8 max-w-sm mx-auto">{t("humidor.emptyText" as any)}</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-8 py-3 border border-gold text-gold font-ui text-sm tracking-wider uppercase hover:bg-gold hover:text-mahogany transition-all duration-300">
            <Plus size={14} />
            {t("humidor.addFirst" as any)}
          </button>
        </motion.div>
      )}

      {/* Cigar Grid */}
      {cigars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {cigars.map((cigar, i) => (
            <motion.div key={cigar.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedCigar(cigar)} className="gradient-card border border-border hover:border-gold/40 p-5 cursor-pointer group transition-all duration-300 hover:shadow-card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-cream font-semibold text-sm truncate group-hover:text-gold transition-colors">{cigar.name}</p>
                  <p className="text-xs font-ui text-muted-foreground mt-0.5">{cigar.brand}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onRemove(cigar.id); }} className="text-muted-foreground hover:text-red-400 transition-colors ml-2 opacity-0 group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-ui">{t("humidor.origin" as any)}</span>
                  <span className="text-foreground font-ui">{cigar.origin}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-ui">{t("humidor.wrapper" as any)}</span>
                  <span className="text-foreground font-ui truncate ml-2 text-right">{cigar.wrapper}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-ui">{t("humidor.strength" as any)}</span>
                  <span className={`font-ui font-medium ${strengthColor[cigar.strength]}`}>{cigar.strength}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-ui">{t("humidor.qty" as any)}</span>
                  <span className="text-foreground font-ui">{cigar.quantity}</span>
                </div>
                {cigar.addedTimestamp && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-ui">{t("humidor.aging" as any)}</span>
                    <span className={`font-ui font-medium flex items-center gap-1 ${getAgingColor(cigar.addedTimestamp)}`}>
                      <Clock size={10} />
                      {getAgingText(cigar.addedTimestamp)}
                    </span>
                  </div>
                )}
              </div>
              {cigar.rating > 0 && (
                <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={10} className={`${cigar.rating / 20 >= s ? "text-gold fill-gold" : "text-border"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground font-ui ml-1">{cigar.rating}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-mahogany/90 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-card border border-border shadow-deep w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-2xl text-cream">{t("humidor.addToHumidor" as any)}</h2>
                  <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-cream"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("humidor.cigarName" as any)} *</label>
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Behike 52"
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("humidor.brand" as any)} *</label>
                      <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Cohiba"
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("humidor.origin" as any)}</label>
                      <div className="relative">
                        <select value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}
                          className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 appearance-none cursor-pointer">
                          {origins.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("humidor.strength" as any)}</label>
                      <div className="relative">
                        <select value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value as CigarEntry["strength"] })}
                          className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 appearance-none cursor-pointer">
                          {strengths.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("humidor.wrapper" as any)}</label>
                    <div className="relative">
                      <select value={form.wrapper} onChange={(e) => setForm({ ...form, wrapper: e.target.value })}
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 appearance-none cursor-pointer">
                        {wrappers.map((w) => <option key={w} value={w}>{w}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("humidor.size" as any)}</label>
                      <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. Robusto, 5×52"
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("humidor.quantity" as any)}</label>
                      <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2 block">{t("humidor.yourRating" as any)}</label>
                    <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                  </div>
                  <div>
                    <label className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-1.5 block">{t("humidor.tastingNotes" as any)}</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Cedar, dark chocolate, pepper..." rows={3}
                      className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors resize-none font-serif-body" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 border border-border text-muted-foreground font-ui text-sm tracking-wider uppercase hover:text-cream hover:border-foreground/30 transition-all">
                      {t("humidor.cancel" as any)}
                    </button>
                    <button type="submit"
                      className="flex-1 px-4 py-3 bg-gold text-mahogany font-ui font-medium text-sm tracking-wider uppercase hover:shadow-gold transition-all duration-300">
                      {t("humidor.addToHumidor" as any)}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCigar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-mahogany/90 backdrop-blur-sm" onClick={() => setSelectedCigar(null)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="relative bg-card border border-border shadow-deep w-full max-w-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-ui text-gold tracking-wider uppercase mb-1">{selectedCigar.brand}</p>
                    <h3 className="font-display text-2xl text-cream">{selectedCigar.name}</h3>
                  </div>
                  <button onClick={() => setSelectedCigar(null)} className="text-muted-foreground hover:text-cream"><X size={18} /></button>
                </div>
                <div className="divider-gold mb-4" />
                <div className="space-y-2 mb-4">
                  {[
                    [t("humidor.origin" as any), selectedCigar.origin],
                    [t("humidor.wrapper" as any), selectedCigar.wrapper],
                    [t("humidor.strength" as any), selectedCigar.strength],
                    [t("humidor.size" as any), selectedCigar.size || t("humidor.notSpecified" as any)],
                    [t("humidor.quantity" as any), selectedCigar.quantity.toString()],
                    [t("humidor.added" as any), selectedCigar.addedDate],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-ui">{label}</span>
                      <span className="text-foreground font-ui">{value}</span>
                    </div>
                  ))}
                </div>
                {selectedCigar.rating > 0 && (
                  <div className="flex items-center gap-1.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={`${selectedCigar.rating / 20 >= s ? "text-gold fill-gold" : "text-border"}`} />
                    ))}
                    <span className="text-sm text-muted-foreground font-ui ml-1">{selectedCigar.rating}/100</span>
                  </div>
                )}
                {selectedCigar.notes && (
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2">{t("humidor.tastingNotes" as any)}</p>
                    <p className="font-serif-body text-foreground italic text-sm leading-relaxed">{selectedCigar.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
