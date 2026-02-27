import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { type TranslationKey } from "@/i18n/translations";
import { Particles } from "@/components/magicui/Particles";
import { HyperText } from "@/components/magicui/HyperText";

export const AgeGate = ({ onVerify }: { onVerify: () => void }) => {
    const [denied, setDenied] = useState(false);
    const { t } = useLanguage();

    const handleYes = () => {
        localStorage.setItem("age-verified", "true");
        onVerify();
    };

    const handleNo = () => {
        setDenied(true);
    };

    useEffect(() => {
        if (denied) {
            const timer = setTimeout(() => {
                window.location.href = "https://google.com";
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [denied]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 overflow-hidden"
            >
                {/* Abstract Background Smoke/Texture Effect */}
                <Particles
                    className="absolute inset-0 pointer-events-none"
                    quantity={50}
                    color="#C5A059"
                    staticity={40}
                    ease={60}
                />
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mahogany/20 rounded-full blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative w-full max-w-lg text-center"
                >
                    {/* Logo/Brand Mark Placeholder */}
                    <div className="w-16 h-16 mx-auto mb-8 border-2 border-gold/30 rounded-full flex items-center justify-center bg-gold/5 shadow-[0_0_30px_rgba(212,175,55,0.1)] animate-pulse-gold">
                        <span className="font-display text-gold text-2xl font-bold italic cigar-3d-rotate">V</span>
                    </div>

                    {!denied ? (
                        <>
                            <h1 className="font-display text-3xl md:text-4xl text-cream font-bold mb-10 tracking-widest uppercase text-gold-gradient">
                                {t("agegate.title" as TranslationKey)}
                            </h1>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                                <button
                                    onClick={handleYes}
                                    className="w-full sm:w-40 py-4 bg-gold text-mahogany font-ui font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-cream hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                                >
                                    {t("agegate.yes" as TranslationKey)}
                                </button>
                                <button
                                    onClick={handleNo}
                                    className="w-full sm:w-40 py-4 border border-gold/40 text-gold font-ui font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:border-gold hover:bg-gold/5"
                                >
                                    {t("agegate.no" as TranslationKey)}
                                </button>
                            </div>

                            {/* Surgeon General Warning Panel */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-card p-6 mb-8 border-l-8 border-mahogany shadow-2xl"
                            >
                                <p className="text-[10px] font-ui font-bold text-gold tracking-tight mb-1 uppercase text-left border-b border-gold/20 pb-1">
                                    {t("agegate.warning.title" as TranslationKey)}
                                </p>
                                <p className="text-sm md:text-base font-serif-body text-cream/90 font-bold leading-snug text-left italic">
                                    {t("agegate.warning.text" as TranslationKey)}
                                </p>
                            </motion.div>

                            <p className="text-[11px] font-ui text-muted-foreground/60 tracking-wider">
                                {t("agegate.terms" as TranslationKey)}
                            </p>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-12"
                        >
                            <p className="font-display text-xl text-gold mb-4 italic">
                                {t("agegate.denied" as TranslationKey)}
                            </p>
                            <div className="divider-gold mx-auto w-24 mb-6" />
                            <p className="text-muted-foreground text-sm font-serif-body italic">
                                You will be redirected shortly...
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
