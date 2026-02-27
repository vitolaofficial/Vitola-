import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Particles } from "@/components/magicui/Particles";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Flame, BookOpen, Star, ChevronDown, Sparkles, Shield } from "lucide-react";

interface AuthLandingProps {
    onAuth: () => void;
}

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);

    return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Feature card with hover tilt ── */
function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
            className="group relative p-8 border border-white/[0.06] bg-black/30 backdrop-blur-md transition-all duration-500 hover:border-gold/20 hover:bg-black/40 feature-card-shadow"
        >
            <div className="w-12 h-12 flex items-center justify-center border border-gold/20 bg-gold/5 mb-6 group-hover:bg-gold/10 group-hover:border-gold/40 transition-all duration-500">
                {icon}
            </div>
            <h3 className="font-display text-xl text-cream font-bold mb-3 group-hover:text-gold transition-colors duration-300">{title}</h3>
            <p className="font-serif-body text-cream/40 text-sm leading-relaxed">{desc}</p>
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-gold to-gold/0 group-hover:w-full transition-all duration-700" />
        </motion.div>
    );
}

export function AuthLanding({ onAuth }: AuthLandingProps) {
    const [mode, setMode] = useState<"signin" | "signup">("signup");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showContent, setShowContent] = useState(false);

    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    // Cinematic entrance
    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (mode === "signup" && password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccess("Account created! You can now sign in.");
                setMode("signin");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onAuth();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const scrollToAuth = () => {
        document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="bg-[#0a0604]">

            {/* ═══════════════════════════════════════════
          SECTION 1: CINEMATIC HERO — Fully Immersive
          ═══════════════════════════════════════════ */}
            <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Parallax background with vignette */}
                <motion.div className="absolute inset-0" style={{ y: bgY }}>
                    <div className="absolute inset-0 bg-cover bg-center scale-[1.2] bg-hero-premium" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#0a0604]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
                    {/* Extra vignette corners */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
                </motion.div>

                {/* Particles — more for richness */}
                <Particles className="absolute inset-0 z-[1]" quantity={65} staticity={35} color="#c5a059" />

                {/* Hero content */}
                <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <AnimatePresence>
                        {showContent && (
                            <>
                                {/* ── Subtitle with flanking lines ── */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                    className="flex items-center justify-center gap-4 mb-8"
                                >
                                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent to-gold/40 origin-right" />
                                    <span className="text-[10px] md:text-xs font-ui tracking-[0.5em] uppercase text-gold/50 whitespace-nowrap">
                                        Experience the Art of
                                    </span>
                                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent to-gold/40 origin-left" />
                                </motion.div>

                                {/* ── VITOLA — massive display ── */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 60 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                    className="font-display text-7xl md:text-[10rem] lg:text-[13rem] font-bold leading-[0.8] mb-2 tracking-[-0.02em]"
                                >
                                    <span className="text-gold-gradient drop-shadow-[0_0_80px_rgba(197,160,89,0.15)]">VITOLA</span>
                                </motion.h1>

                                {/* ── Companion — display italic ── */}
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 1.3 }}
                                    className="font-display text-3xl md:text-5xl text-cream/40 italic mb-2 tracking-wide"
                                >
                                    Companion
                                </motion.p>

                                {/* ── Thin decorative separator ── */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-12 h-px bg-gold/25 mx-auto my-8"
                                />

                                {/* ── Description ── */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 1.7 }}
                                    className="font-serif-body text-sm md:text-base text-cream/30 max-w-md mx-auto leading-relaxed mb-12"
                                >
                                    Elevate your passion for the finest tobacco. A bespoke experience designed for those who appreciate the soul of every leaf.
                                </motion.p>

                                {/* ── CTA Button ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 2 }}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <button
                                        onClick={scrollToAuth}
                                        className="group relative inline-flex items-center gap-3 px-14 py-5 border border-gold/50 text-gold font-ui font-bold text-xs tracking-[0.3em] uppercase transition-all duration-700 hover:bg-gold hover:text-[#0a0604] hover:border-gold hover:shadow-[0_0_80px_rgba(197,160,89,0.25)] hover:tracking-[0.4em]"
                                    >
                                        <span>Start Your Legacy</span>
                                        <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-2" />
                                        {/* Glow pulse */}
                                        <div className="absolute inset-0 border border-gold/20 animate-ping opacity-10 pointer-events-none" />
                                    </button>
                                    <span className="text-[9px] font-ui text-cream/15 tracking-[0.2em]">3 questions · 2 minutes</span>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer group"
                    onClick={scrollToAuth}
                >
                    <span className="text-[8px] font-ui tracking-[0.4em] uppercase text-cream/15 group-hover:text-cream/30 transition-colors">Scroll to explore</span>
                    <ChevronDown size={14} className="text-cream/15 animate-bounce group-hover:text-cream/30 transition-colors" />
                </motion.div>
            </section>


            {/* ═══════════════════════════════════════════
          SECTION 2: SOCIAL PROOF + STATS
          ═══════════════════════════════════════════ */}
            <section className="relative py-20 border-y border-white/[0.04]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 500, suffix: "+", label: "Cigars Catalogued" },
                            { value: 50, suffix: "+", label: "Premium Brands" },
                            { value: 12, suffix: "", label: "Countries" },
                            { value: 4.9, suffix: "★", label: "User Rating" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                className="group"
                            >
                                <div className="font-display text-3xl md:text-4xl font-bold text-gold mb-2">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-[10px] font-ui tracking-[0.2em] uppercase text-cream/25 group-hover:text-cream/40 transition-colors">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
          SECTION 3: FEATURES SHOWCASE
          ═══════════════════════════════════════════ */}
            <section className="relative py-24 md:py-32">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Section header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-16 md:mb-20"
                    >
                        <p className="text-xs font-ui tracking-[0.4em] uppercase text-gold/50 mb-4">What Awaits You</p>
                        <h2 className="font-display text-3xl md:text-5xl font-bold text-cream mb-4">
                            Everything for the <span className="text-gold-gradient">Modern Aficionado</span>
                        </h2>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />
                    </motion.div>

                    {/* Feature cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Flame size={22} className="text-gold" />}
                            title="Smart Humidor"
                            desc="Track your collection with precision. Monitor quantity, ratings, origins, and tasting notes — all in one elegant interface."
                            delay={0}
                        />
                        <FeatureCard
                            icon={<BookOpen size={22} className="text-gold" />}
                            title="Tasting Journal"
                            desc="Record every smoking experience. Capture the moment with detailed notes on flavor profiles, pairings, and personal ratings."
                            delay={0.15}
                        />
                        <FeatureCard
                            icon={<Sparkles size={22} className="text-gold" />}
                            title="AI Concierge"
                            desc="Personalized recommendations powered by AI. Discover your next favorite cigar based on your taste profile and history."
                            delay={0.3}
                        />
                    </div>

                    {/* Extra features row */}
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <FeatureCard
                            icon={<Star size={22} className="text-gold" />}
                            title="Discover & Explore"
                            desc="Browse an extensive encyclopedia of cigars, brands, and regions. Learn about vitolas, wrappers, and the art of blending."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Shield size={22} className="text-gold" />}
                            title="Level-Based Experience"
                            desc="Whether you're a novice or a seasoned collector, the app adapts. Take our quiz and unlock personalized content for your journey."
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
          SECTION 4: AUTH / JOIN
          ═══════════════════════════════════════════ */}
            <section id="auth-section" className="relative py-24 md:py-32">
                {/* Background accent */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />

                <div className="relative max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">

                    {/* Left: invitation text */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 text-center lg:text-left"
                    >
                        <p className="text-xs font-ui tracking-[0.35em] uppercase text-gold/50 mb-4">Join the Club</p>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6 leading-tight">
                            Begin Your <br /><span className="text-gold-gradient">Journey Today</span>
                        </h2>
                        <p className="font-serif-body text-cream/35 leading-relaxed max-w-md mb-8">
                            Create your free account and unlock the full Vitola experience. Your personal cigar legacy starts with a single step.
                        </p>
                        <div className="flex items-center gap-8 justify-center lg:justify-start">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
                                <span className="text-[11px] font-ui text-cream/30">Free forever</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
                                <span className="text-[11px] font-ui text-cream/30">No credit card</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Auth form */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-sm"
                    >
                        <div className="p-8 bg-black/50 backdrop-blur-xl border border-white/[0.06] auth-form-card">
                            {/* Tabs */}
                            <div className="flex mb-7">
                                <button
                                    onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                                    className={`flex-1 pb-3 text-[11px] font-ui tracking-[0.25em] uppercase transition-all border-b-2 ${mode === "signup" ? "text-gold border-gold" : "text-cream/25 border-transparent hover:text-cream/40"}`}
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
                                    className={`flex-1 pb-3 text-[11px] font-ui tracking-[0.25em] uppercase transition-all border-b-2 ${mode === "signin" ? "text-gold border-gold" : "text-cream/25 border-transparent hover:text-cream/40"}`}
                                >
                                    Sign In
                                </button>
                            </div>

                            {/* Messages */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 p-3 mb-4 border border-red-500/20 bg-red-500/5 text-red-400 text-[11px] font-ui">
                                        <AlertCircle size={13} />{error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="p-3 mb-4 border border-gold/20 bg-gold/5 text-gold text-[11px] font-ui">
                                        {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-ui tracking-[0.2em] uppercase text-cream/25 mb-1.5 block">Email</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/15" />
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full bg-white/[0.03] border border-white/[0.06] pl-10 pr-4 py-3 text-sm text-cream font-ui placeholder:text-cream/12 focus:outline-none focus:border-gold/25 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-ui tracking-[0.2em] uppercase text-cream/25 mb-1.5 block">Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/15" />
                                        <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/[0.03] border border-white/[0.06] pl-10 pr-10 py-3 text-sm text-cream font-ui placeholder:text-cream/12 focus:outline-none focus:border-gold/25 transition-all" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/15 hover:text-cream/40 transition-colors">
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {mode === "signup" && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                            <label className="text-[10px] font-ui tracking-[0.2em] uppercase text-cream/25 mb-1.5 block">Confirm</label>
                                            <div className="relative">
                                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/15" />
                                                <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-white/[0.03] border border-white/[0.06] pl-10 pr-4 py-3 text-sm text-cream font-ui placeholder:text-cream/12 focus:outline-none focus:border-gold/25 transition-all" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button type="submit" disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gold text-[#0a0604] font-ui font-bold text-[11px] tracking-[0.2em] uppercase transition-all duration-500 hover:shadow-[0_0_50px_rgba(197,160,89,0.25)] disabled:opacity-50 disabled:cursor-not-allowed mt-6">
                                    {loading ? (
                                        <div className="typing-dots"><span /><span /><span /></div>
                                    ) : (
                                        <>
                                            <span>{mode === "signup" ? "Begin Your Journey" : "Welcome Back"}</span>
                                            <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-5 text-center text-[11px] text-cream/20 font-ui">
                                {mode === "signup" ? "Already a member? " : "New here? "}
                                <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); }}
                                    className="text-gold/50 hover:text-gold transition-colors">
                                    {mode === "signup" ? "Sign In" : "Create Account"}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
            <footer className="py-8 px-8 border-t border-white/[0.03]">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <span className="text-[9px] font-ui text-cream/10 tracking-[0.3em] uppercase">Premium Cigar Experience</span>
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-1 rounded-full bg-gold/20" />
                        <span className="text-[9px] font-ui text-cream/10 tracking-[0.3em] uppercase">Vitola © 2026</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
