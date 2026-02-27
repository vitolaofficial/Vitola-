import React, { useState, useCallback } from "react";
import { Search, Plus, Trash2, Calendar, Star, Info, ChevronRight, ChevronDown, GlassWater, Wine, Coffee, Cookie, Eye, LayoutGrid, X, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { type TranslationKey } from "@/i18n/translations";
import { getSmartPairings } from "@/lib/PairingEngine";
import { motion, AnimatePresence } from "framer-motion";
import { HumidorBox } from "@/components/features/HumidorBox";
import { MagicCard } from "@/components/magicui/MagicCard";

import { type CigarEntry } from "@/types/cigar";

const origins = ["Cuba", "Nicaragua", "Dominican Republic", "Honduras", "Ecuador", "Brazil", "Mexico", "Cameroon"];
const wrappers = ["Connecticut Shade", "Colorado Claro", "Colorado", "Colorado Maduro", "Maduro", "Oscuro", "Candela", "Claro"];
const strengths: CigarEntry["strength"][] = ["Mild", "Medium", "Full", "Full+"];
const sizes = ["Robusto (5×50)", "Toro (6×50)", "Corona (5.5×42)", "Churchill (7×47)", "Gordo (6×60)", "Lancero (7.5×38)", "Petit Corona (4.5×42)", "Belicoso (5.5×52)", "Torpedo (6.5×52)", "Perfecto (6×48)", "Panetela (6×34)", "Lonsdale (6.5×42)"];

interface HumidorProps {
  cigars: CigarEntry[];
  onAdd: (cigar: CigarEntry) => void;
  onRemove: (id: string) => void;
}

const defaultForm: Omit<CigarEntry, "id" | "addedDate" | "addedTimestamp"> = {
  name: "", brand: "", origin: "Cuba", wrapper: "Colorado", strength: "Medium", size: "Robusto (5×50)", quantity: 1, rating: 0, notes: "",
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star * 20)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          title={`Rate ${star} stars`}
        >
          <Star
            size={18}
            className={`${(hover || value / 20) >= star ? "text-gold fill-gold" : "text-border"} transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

export function Humidor({ cigars, onAdd, onRemove }: HumidorProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedCigar, setSelectedCigar] = useState<CigarEntry | null>(null);
  const [viewMode, setViewMode] = useState<"humidor" | "grid">("humidor");
  const { t } = useLanguage();

  const getAgingText = (timestamp: number): string => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days === 0) return t("humidor.addedToday" as TranslationKey);
    if (days < 30) return t("humidor.dAging" as TranslationKey, { d: days });
    if (days < 365) return t("humidor.moAging" as TranslationKey, { m: Math.floor(days / 30) });
    return t("humidor.yrAging" as TranslationKey, { y: (days / 365).toFixed(1) });
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
      ...form,
      id: now.toString(),
      addedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      addedTimestamp: now,
    };
    onAdd(entry);
    setForm(defaultForm);
    setShowForm(false);
  };

  const strengthColor = {
    Mild: "text-emerald-400",
    Medium: "text-amber-400",
    Full: "text-orange-500",
    "Full+": "text-red-500"
  };

  return (
    <div className="relative p-6 md:p-10 max-w-6xl ml-0 min-h-screen overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-gold/[0.03] rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[300px] h-[300px] bg-gold/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-16 h-px bg-gradient-to-r from-gold/40 to-transparent mb-4"
              />
              <p className="text-xs font-ui tracking-[0.4em] uppercase text-gold/50 mb-2">Collection</p>
              <p className="text-xs font-ui tracking-[0.2em] uppercase text-gold mb-2">{t("humidor.myCollection" as TranslationKey)}</p>
              <h1 className="font-display text-4xl md:text-5xl text-cream font-bold mb-2">{t("humidor.title" as TranslationKey)}</h1>
              <p className="font-serif-body text-muted-foreground">
                {cigars.length === 0
                  ? t("humidor.emptyDesc" as TranslationKey)
                  : t("humidor.count" as TranslationKey, { count: cigars.length, s: cigars.length === 1 ? "" : "s" })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-border overflow-hidden mr-2">
                <button
                  onClick={() => setViewMode("humidor")}
                  className={`p-2 transition-colors ${viewMode === "humidor" ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-cream"}`}
                  title="Humidor View"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-cream"}`}
                  title="Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold text-primary-foreground font-ui font-medium text-sm tracking-wider uppercase hover:shadow-gold transition-all duration-300 hover:scale-[1.02]"
              >
                <Plus size={14} />
                {t("humidor.addCigar" as TranslationKey)}
              </button>
            </div>
          </div>
          <div className="divider-gold mt-6" />
        </motion.div>

        {/* Empty State */}
        {cigars.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-7xl mb-8 animate-subtle-float">🍂</div>
            <p className="font-display text-3xl text-cream mb-4 text-gold-gradient">{t("humidor.emptyTitle" as TranslationKey)}</p>
            <p className="font-serif-body text-cream/35 mb-10 max-w-md mx-auto">{t("humidor.emptyText" as TranslationKey)}</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 px-10 py-4 border-2 border-gold text-gold font-ui font-bold text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:bg-gold hover:text-[#0a0604] hover:shadow-[0_0_60px_rgba(197,160,89,0.3)]"
            >
              <Plus size={16} />
              {t("humidor.addFirst" as TranslationKey)}
            </button>
          </motion.div>
        )}

        {/* Humidor Box View */}
        {cigars.length > 0 && viewMode === "humidor" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-xs font-ui tracking-[0.2em] uppercase text-muted-foreground mb-5 text-center">
              {t("humidor.myCollection" as TranslationKey)} — {cigars.length} {cigars.length === 1 ? "cigar" : "cigars"}
            </p>
            <HumidorBox cigars={cigars} onCigarClick={setSelectedCigar} onRemove={onRemove} />
            <p className="text-[10px] font-ui text-muted-foreground/50 text-center mt-4 tracking-wider">
              Click a cigar to view details
            </p>
          </motion.div>
        )}

        {/* Cigar Grid View */}
        {cigars.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {cigars.map((cigar, i) => (
              <motion.div
                key={cigar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedCigar(cigar)}
                className="cursor-pointer group"
              >
                <MagicCard
                  className="p-5 border-border hover:border-gold/40 transition-all duration-300 bg-card/40 backdrop-blur-sm"
                  gradientColor="rgba(197, 160, 89, 0.2)"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-cream font-semibold text-sm truncate group-hover:text-gold transition-colors">{cigar.name}</p>
                      <p className="text-xs font-ui text-muted-foreground mt-0.5">{cigar.brand}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(cigar.id); }}
                      className="text-muted-foreground hover:text-red-400 transition-colors ml-2 opacity-0 group-hover:opacity-100"
                      title="Remove cigar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-ui">{t("humidor.origin" as TranslationKey)}</span>
                      <span className="text-foreground font-ui">{cigar.origin}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-ui">{t("humidor.wrapper" as TranslationKey)}</span>
                      <span className="text-foreground font-ui truncate ml-2 text-right">{cigar.wrapper}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-ui">{t("humidor.strength" as TranslationKey)}</span>
                      <span className={`font-ui font-medium ${strengthColor[cigar.strength]}`}>{cigar.strength}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-ui">{t("humidor.qty" as TranslationKey)}</span>
                      <span className="text-foreground font-ui">{cigar.quantity}</span>
                    </div>
                    {cigar.addedTimestamp && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-ui">{t("humidor.aging" as TranslationKey)}</span>
                        <span className={`font-ui font-medium flex items-center gap-1 ${getAgingColor(cigar.addedTimestamp)}`}>
                          <Clock size={10} />
                          {getAgingText(cigar.addedTimestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                  {cigar.rating > 0 && (
                    <div className="flex items-center gap-1.5 pt-3 border-t border-border/50">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={`${cigar.rating / 20 >= s ? "text-gold fill-gold" : "text-border"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground font-ui ml-1">{cigar.rating}</span>
                    </div>
                  )}
                </MagicCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="add-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              {/* Backdrop */}
              <div className="fixed inset-0 bg-mahogany/95 backdrop-blur-md" onClick={() => setShowForm(false)} />
              {/* Scrollable centered content */}
              <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-card border border-border w-full max-w-xl my-4 modal-box-shadow"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="font-display text-3xl text-cream">{t("humidor.addToHumidor" as TranslationKey)}</h2>
                      <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-cream transition-colors" aria-label="Close">
                        <X size={22} />
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.cigarName" as TranslationKey)} *</label>
                          <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Behike 52"
                            className="w-full bg-mahogany/20 border border-border px-4 py-3 text-sm text-foreground font-ui placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.brand" as TranslationKey)} *</label>
                          <input
                            required
                            value={form.brand}
                            onChange={(e) => setForm({ ...form, brand: e.target.value })}
                            placeholder="e.g. Cohiba"
                            className="w-full bg-mahogany/20 border border-border px-4 py-3 text-sm text-foreground font-ui placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/50 transition-all"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.origin" as TranslationKey)}</label>
                          <div className="relative">
                            <select
                              value={form.origin}
                              onChange={(e) => setForm({ ...form, origin: e.target.value })}
                              title="Origin"
                              className="w-full bg-mahogany/20 border border-border px-4 py-3 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
                            >
                              {origins.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.strength" as TranslationKey)}</label>
                          <div className="relative">
                            <select
                              value={form.strength}
                              onChange={(e) => setForm({ ...form, strength: e.target.value as CigarEntry["strength"] })}
                              title="Strength"
                              className="w-full bg-mahogany/20 border border-border px-4 py-3 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
                            >
                              {strengths.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.wrapper" as TranslationKey)}</label>
                        <div className="relative">
                          <select
                            value={form.wrapper}
                            onChange={(e) => setForm({ ...form, wrapper: e.target.value })}
                            title="Wrapper"
                            className="w-full bg-mahogany/20 border border-border px-4 py-3 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
                          >
                            {wrappers.map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.size" as TranslationKey)}</label>
                          <div className="relative">
                            <select
                              value={form.size}
                              onChange={(e) => setForm({ ...form, size: e.target.value })}
                              title="Size"
                              className="w-full bg-mahogany/20 border border-border px-4 py-3 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
                            >
                              {sizes.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.quantity" as TranslationKey)}</label>
                          <input
                            type="number"
                            min={1}
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                            placeholder="1"
                            className="w-full bg-mahogany/20 border border-border px-4 py-3 text-sm text-foreground font-ui focus:outline-none focus:border-gold/50 transition-all font-ui"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.yourRating" as TranslationKey)}</label>
                        <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                      </div>
                      <div>
                        <label className="text-xs font-ui tracking-[0.15em] uppercase text-gold/60 mb-2 block">{t("humidor.tastingNotes" as TranslationKey)}</label>
                        <textarea
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          placeholder="Cedar, dark chocolate, pepper..."
                          rows={3}
                          className="w-full bg-mahogany/20 border border-border px-4 py-3 text-sm text-foreground font-ui placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/50 transition-all resize-none font-serif-body"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="flex-1 px-4 py-3.5 border border-border text-muted-foreground font-ui text-xs tracking-[0.2em] uppercase hover:text-cream hover:border-foreground/30 transition-all"
                        >
                          {t("humidor.cancel" as TranslationKey)}
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-3.5 bg-gold text-mahogany font-ui font-bold text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-all duration-300"
                        >
                          {t("humidor.addToHumidor" as TranslationKey)}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedCigar && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-mahogany/90 backdrop-blur-sm" onClick={() => setSelectedCigar(null)} />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative bg-card border border-border shadow-deep w-full max-w-md my-auto overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs font-ui text-gold tracking-[0.2em] uppercase mb-2">{selectedCigar.brand}</p>
                      <h3 className="font-display text-3xl text-cream">{selectedCigar.name}</h3>
                    </div>
                    <button onClick={() => setSelectedCigar(null)} className="text-muted-foreground hover:text-cream transition-colors" title="Close">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="divider-gold mb-8 opacity-50" />
                  <div className="space-y-4 mb-8">
                    {[
                      [t("humidor.origin" as TranslationKey), selectedCigar.origin],
                      [t("humidor.wrapper" as TranslationKey), selectedCigar.wrapper],
                      [t("humidor.strength" as TranslationKey), selectedCigar.strength],
                      [t("humidor.size" as TranslationKey), selectedCigar.size || t("humidor.notSpecified" as TranslationKey)],
                      [t("humidor.quantity" as TranslationKey), selectedCigar.quantity.toString()],
                      [t("humidor.added" as TranslationKey), selectedCigar.addedDate],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm items-center py-1 border-b border-border/20 last:border-0">
                        <span className="text-muted-foreground font-ui tracking-wide">{label}</span>
                        <span className="text-cream font-ui font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  {selectedCigar.rating > 0 && (
                    <div className="bg-mahogany/30 p-4 rounded-sm border border-border/30 mb-8">
                      <p className="text-[10px] font-ui text-gold/60 uppercase tracking-[0.2em] mb-2 text-center">{t("humidor.yourRating" as TranslationKey)}</p>
                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={18} className={`${selectedCigar.rating / 20 >= s ? "text-gold fill-gold" : "text-border/40"}`} />
                        ))}
                        <span className="text-lg text-cream font-display ml-2">{selectedCigar.rating}</span>
                      </div>
                    </div>
                  )}

                  {selectedCigar.notes && (
                    <div className="bg-mahogany/10 p-5 border-l-2 border-gold/40">
                      <p className="text-[10px] font-ui text-gold/60 uppercase tracking-[0.2em] mb-2">{t("humidor.tastingNotes" as TranslationKey)}</p>
                      <p className="text-sm font-serif-body text-cream/90 italic leading-relaxed">"{selectedCigar.notes}"</p>
                    </div>
                  )}

                  <div className="mt-8 pt-4">
                    <button
                      onClick={() => onRemove(selectedCigar.id)}
                      className="w-full py-3 border border-red-900/30 text-red-500/70 hover:bg-red-900/20 hover:text-red-400 transition-all font-ui text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2"
                    >
                      <Trash2 size={12} />
                      Permanent Remove
                    </button>
                  </div>

                  {/* Smart Pairing Section in Humidor */}
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-[10px] font-ui text-gold uppercase tracking-[0.2em] font-bold mb-3">{t("discover.perfectPartners" as TranslationKey)}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {getSmartPairings(selectedCigar.strength, selectedCigar.notes || "").map((pair, idx) => {
                        const Icon = pair.category === 'wine' ? GlassWater :
                          pair.category === 'whiskey' ? Wine :
                            pair.category === 'coffee' ? Coffee : Cookie;
                        return (
                          <div key={idx} className="bg-mahogany/20 border border-gold/10 p-2.5">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 text-gold bg-gold/5 border border-gold/10">
                                <Icon size={14} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                  <h4 className="text-[11px] font-ui font-bold text-cream uppercase">{pair.title}</h4>
                                  <span className="text-[9px] text-gold/60 font-ui uppercase">{pair.category}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mb-1.5">{pair.subtitle}</p>
                                <div className="bg-black/20 p-2 border-l border-gold/30">
                                  <p className="text-[9px] font-serif-body text-cream/70 italic leading-snug">
                                    <span className="text-gold/80 not-italic font-ui font-bold mr-1">{t("discover.whyItWorks" as TranslationKey)}</span>
                                    {pair.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
