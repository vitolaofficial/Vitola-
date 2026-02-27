import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, ChevronDown, GlassWater, Wine, Coffee, Cookie, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { type TranslationKey } from "@/i18n/translations";
import { supabase } from "@/lib/supabase";
import { getSmartPairings } from "@/lib/PairingEngine";
import { searchCigars, type RapidCigar } from "@/lib/rapidapi";
import { type CigarEntry } from "@/types/cigar";
import famousSmokeCigars from "@/data/famous_smoke_cigars.json";
import localCigarImages from "@/data/cigar_images.json";


interface Cigar {
  id?: string;
  name: string; brand: string; origin: string; wrapper: string;
  strength: "Mild" | "Medium" | "Full" | "Full+"; size?: string;
  rating: number; price: string; notes: string; description: string;
  tags: string[]; pairings: string[]; image_url?: string;
  is_external?: boolean;
  length?: string;
  ring_gauge?: string;
}

interface DiscoverProps {
  onAddToHumidor: (cigar: CigarEntry) => void;
}

export function Discover({ onAddToHumidor }: DiscoverProps) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [data, setData] = useState<Cigar[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Cigar | null>(null);
  const [page, setPage] = useState(0);
  const [prev, setPrev] = useState<Cigar[]>([]);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("rating");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Advanced Filter State
  const [filters, setFilters] = useState({
    strength: "All",
    origin: "All",
    wrapper: "All",
    brand: "All"
  });

  const { t } = useLanguage();

  const strengths = ["All", "Mild", "Medium", "Full", "Full+"];
  const origins = ["All", "Nicaragua", "Dominican", "Honduras", "Cuba", "Ecuador", "Mexico"];
  const wrappers = ["All", "Habano", "Maduro", "Connecticut", "Sumatra", "Corojo"];

  const getCigarImage = useCallback((name: string, brand: string) => {
    const key = `${brand} ${name}`.toLowerCase();
    const match = (localCigarImages as Record<string, string>)[Object.keys(localCigarImages).find(k => key.includes(k.toLowerCase())) || ""];
    return match || `https://images.unsplash.com/photo-1541690494098-b6338e97491d?auto=format&fit=crop&q=80&w=800`;
  }, []);

  const processImageFallback = useCallback((c: Cigar) => ({
    ...c,
    image_url: c.image_url || getCigarImage(c.name, c.brand)
  }), [getCigarImage]);

  const fetchCigars = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      const start = isInitial ? 0 : page * 20;
      const end = start + 19;

      let query = supabase
        .from("cigars")
        .select("*")
        .range(start, end);

      if (search) query = query.ilike("name", `%${search}%`);

      if (filters.strength !== "All") {
        query = query.eq("strength", filters.strength);
      }

      if (filters.origin !== "All") {
        query = query.ilike("origin", `%${filters.origin}%`);
      }

      if (filters.wrapper !== "All") {
        query = query.ilike("wrapper", `%${filters.wrapper}%`);
      }

      if (filters.brand !== "All") {
        query = query.ilike("brand", `%${filters.brand}%`);
      }

      if (sortBy === "rating") query = query.order("rating", { ascending: false });
      else if (sortBy === "price") query = query.order("price", { ascending: true });
      else query = query.order("name", { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      let processedData: Cigar[] = data.map(processImageFallback);

      // If searching and page 0, attempt to fetch from RapidAPI as well
      if (search && isInitial) {
        try {
          const rapidResults: RapidCigar[] = await searchCigars(search);
          const mappedRapid: Cigar[] = rapidResults.map(rc => {
            // Safe strength mapping
            let strength: "Mild" | "Medium" | "Full" | "Full+" = "Medium";
            if (rc.strength) {
              const s = rc.strength.toLowerCase();
              if (s.includes("mild")) strength = "Mild";
              else if (s.includes("full")) strength = "Full";
              else if (s.includes("medium")) strength = "Medium";
            }

            return {
              id: `rapid-${rc.id}`,
              name: rc.name,
              brand: rc.brandName || "Unknown Brand",
              origin: rc.origin || "Unknown",
              wrapper: rc.wrapper || "Habano",
              strength,
              size: rc.length && rc.ringGauge ? `${rc.length} x ${rc.ringGauge}` : "Classic",
              rating: 0,
              price: "N/A",
              notes: "",
              description: "",
              tags: [],
              pairings: ["Coffee", "Bourbon"],
              is_external: true
            };
          }).map(processImageFallback);

          // Merge and avoid exact duplicates by name+brand
          const existingKeys = new Set(processedData.map(c => `${c.brand}|${c.name}`.toLowerCase()));
          const uniqueRapid = mappedRapid.filter(rc => !existingKeys.has(`${rc.brand}|${rc.name}`.toLowerCase()));
          processedData = [...processedData, ...uniqueRapid];
        } catch (rErr) {
          console.error("RapidAPI fetch error in component:", rErr);
        }
      }

      // Update states using functional updates to avoid dependency on 'prev'
      setData(oldData => {
        const newList = isInitial ? processedData : [...oldData, ...processedData];

        // This is a bit tricky since we need newList for Famous mapping below if we want to keep it simple,
        // but let's re-think the Famous mapping. 
        // Actually, the current logic is to merge everything into newList and THEN set it.
        return newList;
      });

      // Let's refine the logic to be cleaner
      setPrev(currentPrev => {
        let newList = isInitial ? processedData : [...currentPrev, ...processedData];

        const hasActiveFilters = filters.strength !== "All" || filters.origin !== "All" || filters.wrapper !== "All" || filters.brand !== "All";

        // Prepend famous smoke cigars if it's the initial load and no search/filter is active
        if (isInitial && !search && !hasActiveFilters) {
          interface FamousCigar {
            id: string;
            name: string;
            brand: string;
            origin?: string;
            wrapper?: string;
            strength?: string;
            size?: string;
            rating?: number;
            price?: string;
            notes?: string;
            description?: string;
            tags?: string[];
            pairings?: string[];
            image_url?: string;
            image?: string;
          }

          const famousMapped: Cigar[] = (famousSmokeCigars as unknown as FamousCigar[]).map(c => {
            const descStr = c.description || "";
            const sizeMatch = descStr.match(/Size\s+(\d+(?:\.\d+)?)\s*[Xx]\s*(\d+)/i);
            const pLen = sizeMatch ? sizeMatch[1] : (Math.floor(Math.random() * 3) + 5).toString();
            const pRing = sizeMatch ? sizeMatch[2] : (Math.floor(Math.random() * 10) + 48).toString();

            // Safe strength mapping
            let strength: "Mild" | "Medium" | "Full" | "Full+" = "Medium";
            if (c.strength) {
              const s = (c.strength as string).toLowerCase();
              if (s.includes("mild")) strength = "Mild";
              else if (s.includes("full")) strength = "Full";
              else if (s.includes("medium")) strength = "Medium";
            }

            return processImageFallback({
              id: c.id,
              name: c.name,
              brand: c.brand,
              origin: c.origin || "Dominican Republic",
              wrapper: c.wrapper || "Habano",
              length: pLen,
              ring_gauge: pRing,
              strength,
              rating: c.rating || 0,
              price: c.price || "$15.00",
              notes: c.notes || "",
              description: c.description || "",
              tags: c.tags || [],
              pairings: c.pairings || ["Coffee", "Bourbon"],
              image_url: c.image_url || c.image
            });
          });
          newList = [...famousMapped, ...newList];
        }

        setData(newList);
        return newList;
      });
    } catch (err) {
      console.error("Error fetching cigars:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filters, page, sortBy, processImageFallback]);

  useEffect(() => {
    fetchCigars(true);
  }, [fetchCigars]);

  const handleAddSession = useCallback((c: Cigar) => {
    const entry: CigarEntry = {
      id: Date.now().toString(),
      name: c.name,
      brand: c.brand,
      origin: c.origin,
      wrapper: c.wrapper,
      strength: c.strength,
      size: c.size || (c.length ? `${c.length} x ${c.ring_gauge}` : "Classic"),
      quantity: 1,
      rating: c.rating,
      notes: c.notes,
      addedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      addedTimestamp: Date.now()
    };
    onAddToHumidor(entry);
    toast.success(t("discover.addedToHumidor" as TranslationKey));
  }, [onAddToHumidor, t]);

  return (
    <div className="relative p-6 md:p-10 max-w-6xl ml-0 min-h-screen">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-px bg-gold/50" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-ui text-gold font-bold">{t("discover.explore" as TranslationKey)}</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-cream font-bold mb-3 text-gold-gradient">{t("discover.title" as TranslationKey)}</h1>
              <p className="font-serif-body text-cream/35 text-lg max-w-2xl">{t("discover.subtitle" as TranslationKey)}</p>
            </div>

            <div className="flex flex-col gap-4 min-w-[300px]">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40 group-focus-within:text-gold transition-colors" size={18} />
                <input
                  type="text"
                  placeholder={t("discover.searchLabel" as TranslationKey)}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-mahogany/20 border border-gold/10 hover:border-gold/30 focus:border-gold/50 rounded-none px-12 py-4 text-cream font-ui text-sm transition-all focus:outline-none placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "rating" | "price" | "name")}
                    title={t("discover.byRating" as TranslationKey)}
                    className="w-full bg-mahogany/20 border border-gold/10 px-4 py-2 text-gold font-ui text-[10px] uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:bg-gold/5 transition-colors"
                  >
                    <option value="rating">{t("discover.byRating" as TranslationKey)}</option>
                    <option value="price">{t("discover.byPrice" as TranslationKey)}</option>
                    <option value="name">{t("discover.byName" as TranslationKey)}</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/40 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Bar & Active Tags */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-gold/10 border border-gold/20 hover:border-gold/50 transition-all text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            <Plus size={14} className={isFilterOpen ? "rotate-45 transition-transform" : "transition-transform"} />
            {t("discover.filterPanel" as TranslationKey) || "Filters"}
          </button>

          <div className="flex flex-1 gap-2 overflow-x-auto no-scrollbar pb-2">
            {Object.entries(filters).map(([key, value]) => value !== "All" && (
              <button
                key={key}
                onClick={() => setFilters(prev => ({ ...prev, [key]: "All" }))}
                className="flex items-center gap-2 px-4 py-2 bg-gold text-mahogany text-[9px] font-ui font-bold uppercase tracking-widest whitespace-nowrap"
              >
                {value} <X size={10} />
              </button>
            ))}
          </div>
        </div>

        {/* Filter Panel Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-mahogany/20 border border-gold/10 mb-10 overflow-hidden"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Strength */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-ui text-gold/40 mb-4 font-bold">Strength</p>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map(s => (
                      <button
                        key={s}
                        onClick={() => setFilters(f => ({ ...f, strength: s }))}
                        className={`px-3 py-1.5 text-[9px] font-ui uppercase tracking-widest border transition-all ${filters.strength === s ? "bg-gold text-mahogany border-gold" : "border-gold/10 text-gold/60 hover:border-gold/30"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origin */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-ui text-gold/40 mb-4 font-bold">Origin</p>
                  <div className="flex flex-wrap gap-2">
                    {origins.map(o => (
                      <button
                        key={o}
                        onClick={() => setFilters(f => ({ ...f, origin: o }))}
                        className={`px-3 py-1.5 text-[9px] font-ui uppercase tracking-widest border transition-all ${filters.origin === o ? "bg-gold text-mahogany border-gold" : "border-gold/10 text-gold/60 hover:border-gold/30"}`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wrapper */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-ui text-gold/40 mb-4 font-bold">Wrapper</p>
                  <div className="flex flex-wrap gap-2">
                    {wrappers.map(w => (
                      <button
                        key={w}
                        onClick={() => setFilters(f => ({ ...f, wrapper: w }))}
                        className={`px-3 py-1.5 text-[9px] font-ui uppercase tracking-widest border transition-all ${filters.wrapper === w ? "bg-gold text-mahogany border-gold" : "border-gold/10 text-gold/60 hover:border-gold/30"}`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand / Clear */}
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-ui text-gold/40 mb-4 font-bold">Visual Selection</p>
                    <p className="text-[11px] text-cream/40 font-serif-body italic">Refine your collection browsing by combining these master attributes.</p>
                  </div>
                  <button
                    onClick={() => {
                      setFilters({ strength: "All", origin: "All", wrapper: "All", brand: "All" });
                      setSearch("");
                    }}
                    className="mt-4 text-[9px] font-ui uppercase tracking-[0.3em] text-gold/40 hover:text-gold transition-colors text-left"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Section */}
        {loading && data.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-[450px] bg-gold/5 border border-gold/10 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((cigar, idx) => (
              <motion.div
                key={cigar.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx % 20) * 0.05 }}
                className="group relative h-[500px] bg-black border border-white/5 hover:border-gold/30 transition-all duration-700 cursor-pointer overflow-hidden flex flex-col"
                onClick={() => setSelected(cigar)}
                title={`View details for ${cigar.name}`}
                role="button"
                tabIndex={0}
              >
                {/* Background Image with Parallax Effect */}
                <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                  <img
                    src={cigar.image_url}
                    alt={cigar.name}
                    className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mahogany via-mahogany/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                </div>

                {/* Content */}
                <div className="relative mt-auto p-8 z-20">
                  <div className="flex items-center gap-2 mb-3">
                    {cigar.is_external && (
                      <span className="text-[9px] font-ui text-emerald-400 font-bold uppercase tracking-[0.2em] bg-emerald-400/10 px-2 py-0.5 border border-emerald-400/20">
                        Global DB
                      </span>
                    )}
                    <span className="text-[9px] font-ui text-gold font-bold uppercase tracking-[0.3em] bg-gold/10 px-2 py-0.5 border border-gold/20">
                      {cigar.strength}
                    </span>
                    <span className="text-[9px] font-ui text-gold/60 uppercase tracking-[0.2em]">{cigar.origin}</span>
                  </div>

                  <h3 className="font-display text-2xl text-cream font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                    {cigar.name}
                  </h3>
                  <p className="text-xs font-ui text-gold/40 uppercase tracking-[0.1em] mb-4">{cigar.brand}</p>

                  {/* Flavor Profile Micro-tags */}
                  <div className="flex flex-wrap gap-1 mb-6 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                    {(cigar.notes || "").split(",").slice(0, 3).map(note => note.trim() && (
                      <span key={note} className="text-[8px] font-ui text-gold border border-gold/30 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
                        {note}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      <Star className="text-gold fill-gold" size={12} />
                      <span className="text-sm text-cream font-display font-medium">{cigar.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gold font-ui tracking-widest">{cigar.price}</span>
                  </div>
                </div>

                {/* Quick Action Overlays */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddSession(cigar); }}
                    className="p-3 bg-gold text-mahogany hover:bg-gold-light transition-colors shadow-2xl"
                    title={t("discover.addToHumidor" as TranslationKey)}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {data.length > 0 && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-12 py-4 border border-gold/20 text-gold font-ui text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gold hover:text-mahogany hover:border-gold transition-all duration-500 hover:shadow-[0_0_40px_rgba(197,160,89,0.15)]"
            >
              {t("discover.loadMore" as TranslationKey)}
            </button>
          </div>
        )}

        {/* Enhanced Detail Modal */}
        <AnimatePresence>
          {selected && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-mahogany/95 backdrop-blur-xl pointer-events-auto"
                onClick={() => setSelected(null)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-5xl bg-[#0d0a09] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-y-auto max-h-full pointer-events-auto"
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-6 right-6 z-50 p-2 text-gold/40 hover:text-gold transition-colors"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>

                {/* Modal Visual Side */}
                <div className="w-full md:w-[45%] h-[400px] md:h-auto relative bg-[#120e0d] border-r border-white/5 overflow-hidden">
                  <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    src={selected.image_url}
                    alt={selected.name}
                    onClick={() => setZoomedImage(selected.image_url || null)}
                    className="w-full h-full object-cover opacity-50 cursor-zoom-in hover:opacity-70 transition-opacity duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a09] via-transparent to-transparent" />

                  <div className="absolute bottom-12 left-12 right-12">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gold text-[#0a0604] text-[9px] font-ui font-bold uppercase tracking-[0.2em] mb-4">
                      {selected.strength}
                    </motion.div>
                    <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                      className="font-display text-4xl md:text-5xl text-cream font-bold leading-tight mb-2">
                      {selected.name}
                    </motion.h2>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                      className="text-gold uppercase tracking-[0.3em] font-ui text-xs font-bold opacity-60">
                      {selected.brand}
                    </motion.p>
                  </div>
                </div>

                {/* Modal Info Side */}
                <div className="w-full md:w-[55%] p-12 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    {[
                      { label: t("discover.origin" as TranslationKey), value: selected.origin },
                      { label: t("discover.rating" as TranslationKey), value: `${selected.rating}/100` },
                      { label: t("discover.price" as TranslationKey), value: selected.price },
                      { label: t("discover.wrapper" as TranslationKey), value: selected.wrapper }
                    ].map((item, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + (idx * 0.1) }}>
                        <p className="text-[10px] font-ui text-gold/40 uppercase tracking-[0.3em] mb-2">{item.label}</p>
                        <p className="text-xl text-cream font-display font-bold leading-none">{item.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="space-y-8">
                    <div className="divider-gold opacity-20" />

                    <div>
                      <p className="text-[10px] font-ui text-gold uppercase tracking-[0.3em] mb-4 font-bold">{t("discover.aboutBlend" as TranslationKey)}</p>
                      <p className="text-sm font-serif-body text-cream/70 leading-[1.8] italic">
                        {selected.description || t("discover.noDesc" as TranslationKey)}
                      </p>
                    </div>

                    <div className="bg-mahogany/20 border border-gold/10 p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-ui text-gold uppercase tracking-[0.3em] font-bold">Smart Pairing</p>
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-gold" />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {getSmartPairings(selected.strength, selected.notes || "").map((pair, idx) => {
                          const Icon = pair.category === 'wine' ? GlassWater :
                            pair.category === 'whiskey' ? Wine :
                              pair.category === 'coffee' ? Coffee : Cookie;
                          return (
                            <div key={idx} className="flex items-start gap-4 p-4 hover:bg-gold/5 transition-all group/pair border-b border-white/5 last:border-0">
                              <div className="p-2 text-gold bg-gold/5 group-hover/pair:bg-gold group-hover/pair:text-mahogany transition-colors">
                                <Icon size={18} />
                              </div>
                              <div>
                                <h4 className="text-xs font-ui font-bold text-cream uppercase tracking-wider mb-1">{pair.title}</h4>
                                <p className="text-[11px] text-muted-foreground mb-2">{pair.subtitle}</p>
                                <p className="text-[10px] font-serif-body text-cream/50 italic leading-relaxed">
                                  <span className="text-gold/80 not-italic font-ui font-bold mr-1">{t("discover.whyItWorks" as TranslationKey)}</span>
                                  {pair.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => handleAddSession(selected)}
                        title={t("discover.addSelection" as TranslationKey)}
                        className="flex-1 bg-gold hover:bg-[#c5a059] text-mahogany font-ui font-bold text-xs py-4 tracking-[0.3em] uppercase transition-all duration-300 transform active:scale-[0.98] shadow-[0_10px_30px_rgba(197,160,89,0.2)]"
                      >
                        {t("discover.addSelection" as TranslationKey)}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Zoom Image Overlay */}
        <AnimatePresence>
          {zoomedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={zoomedImage}
                alt="Zoomed Cigar"
                className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl"
              />
              <button
                className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/80 rounded-full text-gold transition-colors"
                onClick={() => setZoomedImage(null)}
                title="Close zoom view"
                aria-label="Close zoom view"
              >
                <X size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
