import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Cigar {
  name: string; brand: string; origin: string; wrapper: string;
  strength: "Mild" | "Medium" | "Full" | "Full+"; size: string;
  rating: number; price: string; notes: string; description: string;
  tags: string[]; pairings: string[];
}

const cigarsDatabase: Cigar[] = [
  { name: "Cohiba Behike 52", brand: "Cohiba", origin: "Cuba", wrapper: "Colorado Maduro", strength: "Full", size: "Robusto Extra", rating: 98, price: "$$$$$", notes: "Cedar, espresso, dark chocolate, leather", description: "The pinnacle of Cuban craftsmanship. Behike uses a unique medio tiempo leaf — the rarest tobacco in the world.", tags: ["Cuban", "Ultra-Premium", "Aged"], pairings: ["Aged Rum", "Espresso", "Port Wine"] },
  { name: "Padron 1964 Anniversary Natural", brand: "Padron", origin: "Nicaragua", wrapper: "Colorado Claro", strength: "Full", size: "Churchill", rating: 96, price: "$$$$", notes: "Cocoa, cream, leather, spice", description: "Celebrating over 50 years of Padron excellence. Sun-grown wrappers over aged Nicaraguan fillers.", tags: ["Nicaraguan", "Anniversary", "Classic"], pairings: ["Bourbon", "Dark Chocolate", "Turkish Coffee"] },
  { name: "Arturo Fuente Opus X", brand: "Arturo Fuente", origin: "Dominican Republic", wrapper: "Rosado", strength: "Full", size: "Fuente Fuente", rating: 97, price: "$$$$", notes: "Floral, cedar, pepper, cream", description: "The first Dominican puro with its own wrapper. A landmark achievement in cigar history.", tags: ["Dominican", "Landmark", "Premium"], pairings: ["Single Malt Scotch", "Cognac", "Espresso"] },
  { name: "My Father Le Bijou 1922", brand: "My Father", origin: "Nicaragua", wrapper: "Oscuro", strength: "Full+", size: "Torpedo", rating: 95, price: "$$$$", notes: "Dark earth, roasted coffee, fig, leather", description: "Inspired by pre-Castro Cuban cigar traditions. Deeply complex and incredibly satisfying.", tags: ["Nicaraguan", "Maduro", "Bold"], pairings: ["Rye Whiskey", "Cold Brew", "Madeira Wine"] },
  { name: "Davidoff Grand Cru No. 2", brand: "Davidoff", origin: "Dominican Republic", wrapper: "Colorado Claro", strength: "Mild", size: "Lonsdale", rating: 94, price: "$$$$", notes: "Creamy cedar, toasted oak, floral", description: "Davidoff's benchmark of elegance. The ultimate expression of mild, refined smoking.", tags: ["Dominican", "Mild", "Elegant", "Beginner-Friendly"], pairings: ["Champagne", "White Tea", "Latte"] },
  { name: "Montecristo No. 2", brand: "Montecristo", origin: "Cuba", wrapper: "Colorado", strength: "Medium", size: "Torpedo", rating: 95, price: "$$$", notes: "Cedar, coffee, almond, subtle spice", description: "Perhaps the world's most famous cigar. The No.2 torpedo is iconic — perfectly balanced.", tags: ["Cuban", "Iconic", "Balanced", "Beginner-Friendly"], pairings: ["Cuban Coffee", "Añejo Tequila", "Sherry"] },
  { name: "Rocky Patel Vintage 1990", brand: "Rocky Patel", origin: "Honduras", wrapper: "Connecticut Shade", strength: "Mild", size: "Robusto", rating: 91, price: "$$", notes: "Cream, mild wood, light pepper", description: "Buttery smooth with excellent construction. Perfect for those beginning their cigar journey.", tags: ["Honduran", "Mild", "Value", "Beginner-Friendly"], pairings: ["Light Beer", "Cappuccino", "Sparkling Water"] },
  { name: "Liga Privada No. 9", brand: "Drew Estate", origin: "Nicaragua", wrapper: "Brazilian Corojo", strength: "Full", size: "Robusto", rating: 96, price: "$$$", notes: "Dark chocolate, coffee, earth, barnyard", description: "Drew Estate's magnum opus. The Brazilian wrapper delivers extraordinary complexity.", tags: ["Nicaraguan", "Boutique", "Bold"], pairings: ["Stout Beer", "Mezcal", "French Press Coffee"] },
  { name: "Plasencia Alma Fuerte", brand: "Plasencia", origin: "Nicaragua", wrapper: "Nicaraguan Habano", strength: "Full", size: "Conquistador", rating: 97, price: "$$$", notes: "Dark cocoa, coffee bean, roasted nuts, pepper", description: "Made from the finest tobacco from 6 different Nicaraguan growing regions.", tags: ["Nicaraguan", "Premium", "Award-Winning"], pairings: ["Armagnac", "Double Espresso", "Dark Rum"] },
  { name: "Romeo y Julieta Reserva Real", brand: "Romeo y Julieta", origin: "Dominican Republic", wrapper: "Ecuador Connecticut", strength: "Medium", size: "Churchill", rating: 90, price: "$$", notes: "Creaminess, subtle spice, dried fruit", description: "A refined daily smoker. Excellent entry point into the premium Dominican tradition.", tags: ["Dominican", "Medium", "Daily Smoker", "Beginner-Friendly"], pairings: ["Pinot Noir", "Chai Latte", "Amaretto"] },
];

const allTags = ["All", "Cuban", "Nicaraguan", "Dominican", "Beginner-Friendly", "Bold", "Mild", "Iconic", "Premium", "Award-Winning"];

export function Discover() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("rating");
  const [selected, setSelected] = useState<Cigar | null>(null);
  const { t } = useLanguage();

  const filtered = cigarsDatabase
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q) || c.origin.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q);
      const matchTag = activeTag === "All" || c.tags.includes(activeTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.price.length - b.price.length;
    });

  const strengthColor: Record<string, string> = { Mild: "text-emerald-400", Medium: "text-amber-400", Full: "text-orange-500", "Full+": "text-red-500" };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs font-ui tracking-[0.2em] uppercase text-gold mb-2">{t("discover.curated" as any)}</p>
        <h1 className="font-display text-4xl md:text-5xl text-cream font-bold mb-2">{t("discover.title" as any)}</h1>
        <p className="font-serif-body text-muted-foreground">{t("discover.subtitle" as any)}</p>
        <div className="divider-gold mt-6" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("discover.searchPlaceholder" as any)}
            className="w-full bg-input border border-border pl-10 pr-4 py-3 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 flex-wrap flex-1">
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className={`text-xs font-ui px-3 py-1.5 border transition-all duration-200 ${activeTag === tag ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground hover:border-gold/40 hover:text-cream"}`}>
                {tag}
              </button>
            ))}
          </div>
          <div className="relative flex-shrink-0">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "rating" | "price" | "name")}
              className="bg-input border border-border px-3 py-1.5 text-xs text-foreground font-ui focus:outline-none focus:border-gold/50 appearance-none cursor-pointer pr-7">
              <option value="rating">{t("discover.byRating" as any)}</option>
              <option value="price">{t("discover.byPrice" as any)}</option>
              <option value="name">{t("discover.byName" as any)}</option>
            </select>
            <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((cigar, i) => (
          <motion.button key={cigar.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => setSelected(cigar)} className="gradient-card border border-border hover:border-gold/40 p-5 text-left transition-all duration-300 hover:shadow-card group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-ui text-muted-foreground mb-1">{cigar.brand} · {cigar.origin}</p>
                <p className="font-display text-cream font-semibold text-base group-hover:text-gold transition-colors leading-tight">{cigar.name}</p>
              </div>
              <div className="flex flex-col items-end ml-3 flex-shrink-0">
                <div className="flex items-center gap-1 mb-1">
                  <Star size={10} className="text-gold fill-gold" />
                  <span className="text-xs font-ui font-bold text-gold">{cigar.rating}</span>
                </div>
                <span className="text-xs font-ui text-muted-foreground">{cigar.price}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3 text-xs font-ui">
              <span className={strengthColor[cigar.strength]}>{cigar.strength}</span>
              <span className="text-border">·</span>
              <span className="text-muted-foreground">{cigar.size}</span>
              <span className="text-border">·</span>
              <span className="text-muted-foreground">{cigar.wrapper}</span>
            </div>
            <p className="text-xs font-serif-body text-muted-foreground italic">{cigar.notes}</p>
            <div className="flex gap-1.5 flex-wrap mt-3">
              {cigar.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs font-ui px-2 py-0.5 bg-muted text-muted-foreground border border-border">{tag}</span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-display text-xl text-cream mb-2">{t("discover.noResults" as any)}</p>
          <p className="font-serif-body italic">{t("discover.noResultsHint" as any)}</p>
        </div>
      )}

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-mahogany/90 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-card border border-border shadow-deep w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-ui text-gold tracking-wider uppercase">{selected.brand}</p>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-cream text-xs font-ui tracking-wider">{t("discover.close" as any)}</button>
              </div>
              <h2 className="font-display text-3xl text-cream mb-1">{selected.name}</h2>
              <div className="flex items-center gap-2 mb-4">
                <Star size={12} className="text-gold fill-gold" />
                <span className="text-sm font-ui font-bold text-gold">{selected.rating}/100</span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className={`text-sm font-ui ${strengthColor[selected.strength]}`}>{selected.strength}</span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-sm font-ui text-muted-foreground">{selected.price}</span>
              </div>
              <div className="divider-gold mb-4" />
              <p className="font-serif-body text-foreground leading-relaxed mb-4">{selected.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                {[["Origin", selected.origin], ["Wrapper", selected.wrapper], ["Size", selected.size]].map(([l, v]) => (
                  <div key={l}><p className="text-xs font-ui text-muted-foreground uppercase tracking-wider mb-0.5">{l}</p><p className="font-ui text-foreground">{v}</p></div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2">{t("discover.flavorProfile" as any)}</p>
                <p className="font-serif-body text-foreground italic">{selected.notes}</p>
              </div>
              {selected.pairings.length > 0 && (
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs font-ui tracking-wider uppercase text-muted-foreground mb-2">{t("discover.pairsWellWith" as any)}</p>
                  <div className="flex gap-2 flex-wrap">
                    {selected.pairings.map((p) => (
                      <span key={p} className="text-xs font-ui px-3 py-1.5 border border-gold/30 text-gold bg-gold/5">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
