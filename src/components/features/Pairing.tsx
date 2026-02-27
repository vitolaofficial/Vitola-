import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wine,
    GlassWater,
    Coffee,
    Cookie,
    Sparkles,
    ChevronRight,
    ArrowLeft,
    Lightbulb,
    Search,
    Check,
    Filter,
    X,
    Star,
    Info
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import {
    getSmartPairings,
    getReversePairing,
    type PairingCategory,
    type PairingSuggestion,
    type ReversePairing,
    type Occasion
} from "@/lib/PairingEngine";
import famousSmokeCigarsRaw from "@/data/famous_smoke_cigars.json";

import { type CatalogCigar as Cigar } from "@/types/cigar";

const famousSmokeCigars = famousSmokeCigarsRaw as Cigar[];

type Step = "journey" | "select-drink" | "select-occasion" | "select-cigar" | "result";
type StartingPoint = "drink" | "cigar";

interface PairingProps {
    humidorCigars?: Cigar[];
}

export function Pairing({ humidorCigars = [] }: PairingProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState<Step>("journey");
    const [startingPoint, setStartingPoint] = useState<StartingPoint | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<PairingCategory | null>(null);
    const [selectedDrinkPref, setSelectedDrinkPref] = useState<string>("");
    const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
    const [selectedCigar, setSelectedCigar] = useState<Cigar | null>(null);
    const [results, setResults] = useState<PairingSuggestion[]>([]);
    const [reverseResult, setReverseResult] = useState<ReversePairing | null>(null);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [strengthFilter, setStrengthFilter] = useState<string>("All");
    const [originFilter, setOriginFilter] = useState<string>("All");

    const drinks: { id: PairingCategory; icon: React.ElementType; label: string; prefs: string[] }[] = [
        { id: "whiskey", icon: GlassWater, label: "pairing.whiskey", prefs: ["Peated & Smoky", "Sweet Bourbon", "Smooth Speyside"] },
        { id: "wine", icon: Wine, label: "pairing.wine", prefs: ["Bold Red", "Crisp White", "Sweet Port"] },
        { id: "coffee", icon: Coffee, label: "pairing.coffee", prefs: ["Black Espresso", "Creamy Latte", "Medium Roast"] },
        { id: "rum", icon: GlassWater, label: "pairing.rum", prefs: ["Dark & Aged", "Spiced", "Rhum Agricole"] },
        { id: "tea", icon: Coffee, label: "Tea", prefs: ["Black Tea", "Green Tea", "Herbal"] },
        { id: "spirits", icon: GlassWater, label: "Spirits", prefs: ["Gin/Tequila", "Brandy", "Cognac"] },
        { id: "chocolate", icon: Cookie, label: "pairing.chocolate", prefs: ["Extra Dark 85%", "Sea Salt", "Milk Chocolate"] },
    ];

    const handleStartWithDrink = () => {
        setStartingPoint("drink");
        setStep("select-drink");
    };

    const handleStartWithCigar = () => {
        setStartingPoint("cigar");
        setStep("select-cigar");
    };

    const handleDrinkSelect = (category: PairingCategory, pref: string) => {
        setSelectedCategory(category);
        setSelectedDrinkPref(pref);
        setStep("select-occasion");
    };

    const handleOccasionSelect = (occasion: Occasion) => {
        setSelectedOccasion(occasion);
        if (selectedCategory) {
            setReverseResult(getReversePairing(selectedCategory, selectedDrinkPref, occasion));
        }
        setStep("result");
    };

    const handleCigarSelect = (cigar: Cigar) => {
        setSelectedCigar(cigar);
        setResults(getSmartPairings(cigar.strength, cigar.notes || ""));
        setStep("result");
    };

    const allDisplayCigars = [
        ...humidorCigars.map(c => ({ ...c, isUserCigar: true })),
        ...famousSmokeCigars
    ];

    const origins = ["All", ...new Set(allDisplayCigars.map(c => c.origin).filter(Boolean))].sort();
    const strengths = ["All", "Mild", "Medium", "Full"];

    const filteredCigars = allDisplayCigars.filter(cigar => {
        const matchesSearch = (cigar.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cigar.brand || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStrength = strengthFilter === "All" || cigar.strength === strengthFilter;
        const matchesOrigin = originFilter === "All" || cigar.origin === originFilter;
        return matchesSearch && matchesStrength && matchesOrigin;
    });

    const reset = () => {
        setStep("journey");
        setStartingPoint(null);
        setSelectedCategory(null);
        setSelectedCigar(null);
        setResults([]);
        setReverseResult(null);
    };

    return (
        <div className="min-h-screen pt-12 md:pt-8 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center md:text-left">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center md:justify-start gap-3 mb-3"
                >
                    <div className="p-2 bg-gold/10 rounded-lg border border-gold/20">
                        <Sparkles className="text-gold" size={20} />
                    </div>
                    <span className="text-xs font-ui tracking-[0.3em] uppercase text-gold/80">{t("pairing.master.title" as TranslationKey)}</span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-display font-bold text-cream mb-4 smoke-text"
                >
                    {t("pairing.master.subtitle" as TranslationKey)}
                </motion.h2>
                <div className="divider-gold opacity-30 h-[1px] w-full" />
            </div>

            <AnimatePresence mode="wait">
                {step === "journey" && (
                    <motion.div
                        key="journey"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid md:grid-cols-2 gap-6"
                    >
                        <button
                            onClick={handleStartWithCigar}
                            className="group relative h-80 overflow-hidden rounded-2xl border border-gold/10 bg-sidebar/40 hover:bg-gold/5 transition-all duration-500 text-left p-8 flex flex-col justify-end"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-mahogany to-transparent opacity-60" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-gold/20 transition-all duration-500">
                                    <div className="w-6 h-1 bg-gold rounded-full" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-cream mb-2">{t("pairing.startWithCigar" as TranslationKey)}</h3>
                                <p className="text-muted-foreground text-sm font-ui mb-6 line-clamp-2">{t("pairing.startWithCigarDesc" as TranslationKey)}</p>
                                <div className="flex items-center gap-2 text-gold text-xs font-ui tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                    {t("pairing.chooseJourney" as TranslationKey)} <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleStartWithDrink}
                            className="group relative h-80 overflow-hidden rounded-2xl border border-gold/10 bg-sidebar/40 hover:bg-gold/5 transition-all duration-500 text-left p-8 flex flex-col justify-end"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-mahogany to-transparent opacity-60" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-gold/20 transition-all duration-500">
                                    <GlassWater className="text-gold" size={24} />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-cream mb-2">{t("pairing.startWithDrink" as TranslationKey)}</h3>
                                <p className="text-muted-foreground text-sm font-ui mb-6 line-clamp-2">{t("pairing.startWithDrinkDesc" as TranslationKey)}</p>
                                <div className="flex items-center gap-2 text-gold text-xs font-ui tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                    {t("pairing.chooseJourney" as TranslationKey)} <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>
                    </motion.div>
                )}

                {step === "select-drink" && (
                    <motion.div
                        key="select-drink"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <button onClick={reset} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-xs font-ui tracking-widest uppercase mb-8">
                            <ArrowLeft size={14} /> {t("pairing.backToJourney" as TranslationKey)}
                        </button>
                        <h3 className="text-2xl font-display font-bold text-cream mb-8">{t("pairing.selectDrink" as TranslationKey)}</h3>

                        <div className="space-y-6">
                            {drinks.map((drink) => (
                                <div key={drink.id} className="p-6 rounded-2xl border border-gold/5 bg-sidebar/20">
                                    <div className="flex items-center gap-4 mb-4">
                                        <drink.icon className="text-gold" size={20} />
                                        <span className="text-lg font-display text-cream">{t(drink.label as TranslationKey)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {drink.prefs.map((pref) => (
                                            <button
                                                key={pref}
                                                onClick={() => handleDrinkSelect(drink.id, pref)}
                                                className="px-4 py-2 rounded-full border border-gold/10 text-xs font-ui text-muted-foreground hover:border-gold hover:text-gold transition-all"
                                            >
                                                {pref}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === "select-occasion" && (
                    <motion.div
                        key="select-occasion"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-2xl mx-auto"
                    >
                        <button onClick={() => setStep("select-drink")} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-xs font-ui tracking-widest uppercase mb-8" title="Back to drink selection">
                            <ArrowLeft size={14} /> {t("pairing.backToDrinks" as TranslationKey) || "Back to Drinks"}
                        </button>
                        <h3 className="text-3xl font-display font-bold text-cream mb-4">What is the occasion?</h3>
                        <p className="text-muted-foreground font-ui mb-10 italic">Our digital sommelier uses your setting to refine the ideal vitola.</p>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: "Morning", title: "Morning Ritual", desc: "A fresh start. Looking for clarity and nuance.", icon: Coffee },
                                { id: "Relaxing", title: "Afternoon/Relaxing", desc: "Mid-day pause. Balanced and steady.", icon: Sparkles },
                                { id: "Evening", title: "Evening Reflection", desc: "Unwinding after a long day. Deep and complex.", icon: GlassWater },
                                { id: "Celebration", title: "Special Celebration", desc: "The best of the best. Time for the top shelf.", icon: Star }
                            ].map((occ) => (
                                <button
                                    key={occ.id}
                                    onClick={() => handleOccasionSelect(occ.id as Occasion)}
                                    className="p-6 rounded-2xl border border-gold/10 bg-sidebar/20 hover:bg-gold/5 flex items-center gap-6 text-left transition-all group relative border-l-4 border-l-transparent hover:border-l-gold"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-all">
                                        <occ.icon className="text-gold" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-display font-bold text-cream group-hover:text-gold transition-colors">{occ.title}</h4>
                                        <p className="text-sm text-muted-foreground">{occ.desc}</p>
                                    </div>
                                    <ChevronRight className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === "select-cigar" && (
                    <motion.div
                        key="select-cigar"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <button onClick={reset} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-xs font-ui tracking-widest uppercase mb-8">
                            <ArrowLeft size={14} /> {t("pairing.backToJourney" as TranslationKey)}
                        </button>
                        <h3 className="text-2xl font-display font-bold text-cream mb-6">{t("pairing.selectCigar" as TranslationKey)}</h3>

                        <div className="space-y-6 mb-8">
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search brands or cigars..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-sidebar/20 border border-gold/10 pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-gold/30 transition-all font-ui"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold"
                                        title="Clear search"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-ui uppercase tracking-widest text-gold/60 ml-1">Strength</span>
                                    <div className="flex gap-2">
                                        {strengths.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setStrengthFilter(s)}
                                                className={`px-4 py-2 rounded-lg text-xs font-ui border transition-all ${strengthFilter === s ? "bg-gold/10 border-gold/40 text-gold" : "border-gold/5 text-muted-foreground hover:border-gold/20"}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-ui uppercase tracking-widest text-gold/60 ml-1">Origin</span>
                                    <select
                                        value={originFilter}
                                        onChange={(e) => setOriginFilter(e.target.value)}
                                        className="bg-sidebar/20 border border-gold/10 px-4 py-2 rounded-lg text-xs font-ui text-muted-foreground focus:outline-none focus:border-gold/30 cursor-pointer min-w-[120px]"
                                        title="Filter by origin"
                                    >
                                        {origins.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {filteredCigars.length > 0 ? (
                                filteredCigars.map((cigar: Cigar) => (
                                    <button
                                        key={cigar.id}
                                        onClick={() => handleCigarSelect(cigar)}
                                        className={`group p-4 rounded-xl border bg-sidebar/20 hover:bg-gold/5 transition-all text-left flex flex-col h-full ${cigar.isUserCigar ? "border-gold/30 shadow-[0_0_15px_rgba(197,160,89,0.1)]" : "border-gold/10 hover:border-gold/30"}`}
                                    >
                                        {cigar.isUserCigar && (
                                            <div className="absolute top-2 right-2 z-10">
                                                <span className="bg-gold text-mahogany text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">My Humidor</span>
                                            </div>
                                        )}
                                        <div className="aspect-[3/4] bg-mahogany/40 rounded-lg mb-3 overflow-hidden flex items-center justify-center p-4 relative border border-gold/5 group-hover:border-gold/10 shadow-inner">
                                            <img
                                                src={cigar.image_url || cigar.image}
                                                alt={cigar.name}
                                                className="max-h-full max-w-full object-contain filter drop-shadow-xl group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="mt-auto">
                                            <p className="text-[10px] font-ui tracking-widest uppercase text-gold/60 mb-1">{cigar.brand}</p>
                                            <h4 className="text-xs font-bold text-cream line-clamp-2 leading-snug mb-2">{cigar.name}</h4>
                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gold/5">
                                                <span className="text-[9px] font-ui text-muted-foreground uppercase">{cigar.strength}</span>
                                                <div className="flex items-center gap-1">
                                                    <Star size={8} className="text-gold fill-gold" />
                                                    <span className="text-[9px] font-bold text-gold">{cigar.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center">
                                    <p className="font-display text-xl text-muted-foreground">No cigars found matching your filters.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {step === "result" && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <button onClick={reset} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-xs font-ui tracking-widest uppercase" title="Reset journey">
                            <ArrowLeft size={14} /> {t("pairing.reset" as TranslationKey)}
                        </button>

                        {/* Selection Summary */}
                        <div className="p-6 rounded-2xl border border-gold/20 bg-gold/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                {startingPoint === "cigar" && selectedCigar ? (
                                    <>
                                        <img src={selectedCigar.image || selectedCigar.image_url} className="h-16 w-16 object-contain" alt="" />
                                        <div>
                                            <p className="text-[10px] font-ui tracking-widest uppercase text-gold/60 mb-1">{selectedCigar.brand}</p>
                                            <h4 className="text-xl font-display font-bold text-cream">{selectedCigar.name}</h4>
                                        </div>
                                    </>
                                ) : startingPoint === "drink" && selectedCategory ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                                            {selectedCategory === 'wine' && <Wine className="text-gold" size={24} />}
                                            {(selectedCategory === 'whiskey' || selectedCategory === 'rum' || selectedCategory === 'spirits') && <GlassWater className="text-gold" size={24} />}
                                            {(selectedCategory === 'coffee' || selectedCategory === 'tea') && <Coffee className="text-gold" size={24} />}
                                            {selectedCategory === 'chocolate' && <Cookie className="text-gold" size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-ui tracking-widest uppercase text-gold/60 mb-1">{t(`pairing.${selectedCategory}` as TranslationKey)}</p>
                                            <h4 className="text-xl font-display font-bold text-cream">{selectedDrinkPref}</h4>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            <div className="h-10 w-[1px] bg-gold/20 hidden md:block" />
                            {selectedOccasion && (
                                <div className="flex flex-col items-center md:items-start">
                                    <p className="text-[10px] font-ui tracking-widest uppercase text-gold/60 mb-1">{t("pairing.occasion" as TranslationKey)}</p>
                                    <h4 className="text-sm font-ui font-bold text-cream tracking-wide">{t(`pairing.${selectedOccasion.toLowerCase()}` as TranslationKey)}</h4>
                                </div>
                            )}
                            <div className="h-10 w-[1px] bg-gold/20 hidden md:block" />
                            <div className="flex items-center gap-2 text-gold font-ui text-xs tracking-[0.2em] uppercase">
                                <Check size={16} /> {t("pairing.discoverMatches" as TranslationKey)}
                            </div>
                        </div>

                        {/* Main Result Card */}
                        {startingPoint === "drink" && reverseResult && (
                            <div className="grid gap-6">
                                <div className="p-8 rounded-3xl border border-gold/20 bg-sidebar/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                        <Sparkles size={120} className="text-gold" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-gold text-[10px] font-ui tracking-[0.3em] uppercase mb-4">
                                            <ArrowLeft className="rotate-180" size={14} /> {t("pairing.idealCigar" as TranslationKey)}
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-display font-bold text-cream mb-6">{reverseResult.title}</h3>
                                        <p className="text-lg text-cream/80 font-ui mb-8 max-w-2xl leading-relaxed">
                                            {reverseResult.idealProfile}
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-gold">
                                                    <Info size={18} />
                                                    <span className="text-xs font-ui tracking-widest uppercase font-bold">{t("pairing.whyItWorks" as TranslationKey)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed italic">{reverseResult.whyItWorks}</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-gold">
                                                    <Lightbulb size={18} />
                                                    <span className="text-xs font-ui tracking-widest uppercase font-bold">{t("pairing.sommelierTip" as TranslationKey)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{reverseResult.sommelierTip}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {reverseResult.suggestedTags.map(tag => (
                                                <span key={tag} className="px-5 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-ui tracking-widest uppercase font-bold">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Target Flavor Axis */}
                                        {reverseResult.profile && (
                                            <div className="pt-8 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-gold mb-6">
                                                    <Sparkles size={16} />
                                                    <span className="text-[10px] font-ui tracking-widest uppercase font-bold">Target Flavor Architecture</span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                                    {Object.entries(reverseResult.profile).map(([key, val]) => (
                                                        <div key={key} className="p-3 bg-black/20 rounded-xl border border-white/5 space-y-2">
                                                            <p className="text-[8px] uppercase tracking-widest text-gold/40 text-center">{key}</p>
                                                            <div className="flex justify-center gap-1">
                                                                {[1, 2, 3, 4, 5].map(step => (
                                                                    <div
                                                                        key={step}
                                                                        className={`w-1.5 h-1.5 rounded-full ${step <= (val as number / 2) ? "bg-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]" : "bg-white/5"}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {startingPoint === "cigar" && selectedCigar && (
                            <div className="space-y-6">
                                {/* Cigar Detailed Data */}
                                <div className="p-8 rounded-3xl border border-gold/20 bg-sidebar/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                        <Sparkles size={120} className="text-gold" />
                                    </div>

                                    <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                        <div className="w-full md:w-1/3 aspect-[3/4] bg-mahogany/40 rounded-2xl border border-gold/10 p-6 flex items-center justify-center shadow-2xl">
                                            <img
                                                src={selectedCigar.image_url || selectedCigar.image}
                                                className="max-h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                                                alt={selectedCigar.name}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-gold text-[10px] font-ui tracking-[0.3em] uppercase mb-4">
                                                <ArrowLeft className="rotate-180" size={14} /> Master Collection Details
                                            </div>
                                            <h3 className="text-4xl md:text-5xl font-display font-bold text-cream mb-2">{selectedCigar.name}</h3>
                                            <p className="text-xl text-gold/80 font-ui tracking-widest uppercase font-bold mb-6">{selectedCigar.brand}</p>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                                                {[
                                                    { label: "Origin", value: selectedCigar.origin },
                                                    { label: "Wrapper", value: selectedCigar.wrapper },
                                                    { label: "Strength", value: selectedCigar.strength },
                                                    { label: "Size", value: selectedCigar.size },
                                                    { label: "Rating", value: `${selectedCigar.rating}/100` },
                                                    { label: "Est. Price", value: selectedCigar.price }
                                                ].map(item => (
                                                    <div key={item.label} className="p-3 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[10px] font-ui text-gold/60 uppercase tracking-widest mb-1">{item.label}</p>
                                                        <p className="text-sm font-ui text-cream font-bold">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center gap-2 text-gold">
                                                    <Info size={16} />
                                                    <span className="text-[10px] font-ui tracking-widest uppercase font-bold">Flavor Profile</span>
                                                </div>
                                                <p className="text-lg text-cream/80 font-serif-body italic leading-relaxed">
                                                    "{selectedCigar.notes}"
                                                </p>
                                            </div>

                                            <p className="text-sm text-muted-foreground leading-relaxed font-ui border-l-2 border-gold/20 pl-4 py-1">
                                                {selectedCigar.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Smart Pairings (Still available for value-add) */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {results.map((suggestion, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + (idx * 0.1) }}
                                            key={suggestion.title}
                                            className="p-8 rounded-3xl border border-gold/10 bg-sidebar/20 hover:bg-gold/5 transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-all">
                                                    {suggestion.category === 'wine' && <Wine className="text-gold" size={20} />}
                                                    {(suggestion.category === 'whiskey' || suggestion.category === 'rum' || suggestion.category === 'spirits') && <GlassWater className="text-gold" size={20} />}
                                                    {(suggestion.category === 'coffee' || suggestion.category === 'tea') && <Coffee className="text-gold" size={20} />}
                                                    {suggestion.category === 'chocolate' && <Cookie className="text-gold" size={20} />}
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-ui tracking-[0.3em] uppercase text-gold/40 mb-1">{t(`pairing.${suggestion.category}` as TranslationKey) || suggestion.category}</span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${suggestion.synergyScore}%` }}
                                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                                className="h-full bg-gold"
                                                            />
                                                        </div>
                                                        <span className="text-[8px] font-bold text-gold">{suggestion.synergyScore}% SYNERGY</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className="text-xl font-display font-bold text-cream mb-1">{suggestion.title}</h4>
                                            <p className="text-xs text-gold/60 font-ui mb-4">{suggestion.subtitle}</p>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-2">{suggestion.description}</p>

                                            {/* Synergy Axis */}
                                            <div className="grid grid-cols-3 gap-2 mb-6">
                                                {Object.entries(suggestion.profileMatch).map(([key, val]) => (
                                                    <div key={key} className="p-2 bg-black/20 rounded-lg border border-white/5">
                                                        <p className="text-[7px] uppercase tracking-widest text-gold/40 mb-1">{key}</p>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(step => (
                                                                <div
                                                                    key={step}
                                                                    className={`w-full h-0.5 rounded-full ${step <= (val as number / 2) ? "bg-gold" : "bg-white/5"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="flex items-start gap-3">
                                                    <Info size={14} className="text-gold mt-0.5 shrink-0" />
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed italic">"{suggestion.whyItWorks}"</p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Lightbulb size={14} className="text-gold mt-0.5 shrink-0" />
                                                    <p className="text-[11px] text-cream/70 leading-relaxed font-bold">{suggestion.sommelierTip}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
