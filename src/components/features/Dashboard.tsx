import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Archive, Compass, MessageCircle, Star, Zap, ShieldCheck, BookOpen, ChevronRight, TrendingUp } from "lucide-react";
import type { UserLevel, UserProfile } from "@/components/auth/OnboardingQuiz";
import type { Page } from "@/components/layout/AppNav";
import heroCigars from "@/assets/hero-cigars.jpg";
import { useLanguage } from "@/i18n/LanguageContext";
import { type TranslationKey } from "@/i18n/translations";
import { Particles } from "@/components/magicui/Particles";

interface DashboardProps {
  level: UserLevel;
  profile: UserProfile;
  onNavigate: (page: Page) => void;
  humidorCount: number;
}

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-60px"
  });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Quick-action card ── */
function ActionCard({ icon: Icon, title, desc, cta, onClick, delay = 0, accent = false }: {
  icon: React.ElementType; title: string; desc: string; cta: string; onClick?: () => void; delay?: number; accent?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-60px"
  });

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`group relative text-left p-6 border transition-all duration-500 overflow-hidden ${accent
        ? "border-gold/20 bg-gold/[0.03] hover:border-gold/40 hover:bg-gold/[0.06]"
        : "border-white/[0.06] bg-black/20 hover:border-gold/15 hover:bg-black/30"
        }`}
    >
      {/* Background glow on hover */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gold/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        <div className={`w-10 h-10 flex items-center justify-center border mb-4 transition-all duration-500 ${accent
          ? "border-gold/30 bg-gold/10 group-hover:bg-gold/20"
          : "border-white/[0.08] bg-white/[0.03] group-hover:border-gold/20 group-hover:bg-gold/5"
          }`}>
          <Icon size={18} className={accent ? "text-gold" : "text-cream/40 group-hover:text-gold transition-colors duration-300"} />
        </div>
        <h3 className="font-display text-lg text-cream font-bold mb-1 group-hover:text-gold transition-colors duration-300">{title}</h3>
        <p className="text-xs text-cream/30 font-ui mb-4">{desc}</p>
        <div className="flex items-center gap-1 text-gold/50 group-hover:text-gold transition-colors duration-300">
          <span className="text-[10px] font-ui tracking-[0.2em] uppercase">{cta}</span>
          <ChevronRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Bottom line animation */}
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-gold to-gold/0 group-hover:w-full transition-all duration-700" />
    </motion.button>
  );
}

/* ── Stat pillar ── */
function StatPillar({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="font-display text-2xl md:text-3xl font-bold text-gold mb-1">{value}</div>
      <div className="text-[9px] font-ui tracking-[0.25em] uppercase text-cream/20">{label}</div>
    </motion.div>
  );
}

/* ── Membership Card ── */
function MembershipCard({ profile, level }: { profile: UserProfile; level: UserLevel }) {
  const { t } = useLanguage();
  const honorific = t(`onboarding.registry.title.${profile.honorific}` as TranslationKey);
  const levelBadge = t(`level.${level}` as TranslationKey);
  const memberSince = new Date().getFullYear();

  // ── Perspective Tilt Logic ──
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  // Shine follows mouse - Silver/Cold White for Black Card feel
  const shineBg = useTransform(
    [x, y],
    ([lx, ly]) => `radial-gradient(circle at ${(Number(lx) + 0.5) * 100}% ${(Number(ly) + 0.5) * 100}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set((mouseX / width) - 0.5);
    y.set((mouseY / height) - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="perspective-[1000px] mb-12 flex justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
        }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[240px] md:w-[280px] aspect-[1.58/1] bg-[#050505] border border-white/10 p-4 md:p-5 flex flex-col justify-between overflow-hidden group shadow-2xl shadow-black/80 cursor-pointer rounded-[4px] perspective-3d"
      >
        {/* Dynamic Shine Layer (Cold) */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: shineBg }}
        />

        {/* Minimal Matte Texture Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-dots" />

        <div className="relative z-10 flex justify-between items-start depth-mid">
          <div>
            <p className="text-[7px] font-ui tracking-[0.5em] uppercase text-white/30 mb-0.5">Centurion</p>
            <div className="h-[0.5px] w-4 bg-white/20" />
          </div>
          <div className="text-right">
            <p className="text-[7px] font-ui tracking-[0.4em] uppercase text-white/20 mb-0.5">Status</p>
            <p className="text-[8px] font-display text-gold/80 font-bold tracking-[0.2em] uppercase">{levelBadge}</p>
          </div>
        </div>

        <div className="relative z-10 py-1 depth-hi">
          <p className="text-[7px] font-ui tracking-[0.5em] uppercase text-white/15 mb-1.5">Private Card</p>
          <h2 className="font-display text-base md:text-lg text-white/90 font-bold tracking-tight">
            <span className="block text-[8px] tracking-[0.3em] mb-0.5 font-ui text-white/40">{honorific}</span>
            <span className="drop-shadow-sm">{profile.name}</span>
          </h2>
        </div>

        <div className="relative z-10 flex justify-between items-end border-t border-white/[0.04] pt-2 depth-lo">
          <div>
            <p className="text-[6px] font-ui tracking-[0.4em] uppercase text-white/15">Member Since</p>
            <p className="text-[9px] font-serif text-white/20 tracking-widest">{memberSince}</p>
          </div>
          <div className="flex gap-1 pb-0.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-0.5 h-0.5 rounded-full ${i === 1 ? 'bg-gold/40' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        {/* Refined Edge Reflection */}
        <div className="absolute inset-0 border border-white/[0.03] pointer-events-none" />
        <div className="absolute inset-[0.5px] border border-black pointer-events-none" />
        <div className="absolute inset-[1px] border border-white/[0.01] pointer-events-none" />
      </motion.div>
    </div>
  );
}

export function Dashboard({ level, profile, onNavigate, humidorCount }: DashboardProps) {
  const { t } = useLanguage();
  const honorific = t(`onboarding.registry.title.${profile.honorific}` as TranslationKey);
  const greeting = t(`dashboard.greeting.${level}` as TranslationKey, {
    title: honorific,
    name: profile.name
  });
  const sub = t(`dashboard.sub.${level}` as TranslationKey);
  const tip = t(`dashboard.tip.${level}` as TranslationKey);
  const tipLabel = t(`dashboard.tipLabel.${level}` as TranslationKey);
  const levelBadge = t(`level.${level}` as TranslationKey);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Ambient effects ── */}
      <Particles className="absolute inset-0 pointer-events-none z-0" quantity={35} color="#C5A059" staticity={60} ease={80} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-gold/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-6xl ml-0">

        {/* ═══════════════════════════════════════════
            HERO: Cinematic Welcome
            ═══════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative text-center py-10 md:py-14 mb-8"
        >
          {/* Top decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
          />

          {/* Level badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center mb-10"
          >
            <MembershipCard profile={profile} level={level} />
          </motion.div>

          {/* Greeting */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-cream font-bold mb-4 tracking-tight text-gold-gradient"
          >
            {greeting}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="font-serif-body text-base md:text-lg text-cream/35 max-w-xl mx-auto leading-relaxed"
          >
            {sub}
          </motion.p>

          {/* Bottom decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
          />
        </motion.section>


        {/* ═══════════════════════════════════════════
            STATS BAR
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-6 mb-12 py-6 border-y border-white/[0.04]">
          <StatPillar value={`${humidorCount}`} label="In Humidor" delay={0.1} />
          <StatPillar value="94.5" label="Avg Rating" delay={0.2} />
          <StatPillar value={levelBadge} label="Your Level" delay={0.3} />
        </div>


        {/* ═══════════════════════════════════════════
            QUICK ACTIONS GRID
            ═══════════════════════════════════════════ */}
        <Reveal className="mb-4">
          <p className="text-[10px] font-ui tracking-[0.4em] uppercase text-gold/30 mb-4">Quick Actions</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-3 mb-8">
          <ActionCard
            icon={Archive}
            title={t("dashboard.openHumidor" as TranslationKey)}
            desc={t("dashboard.manageCollection" as TranslationKey)}
            cta={t("dashboard.exploreAll" as TranslationKey)}
            onClick={() => onNavigate("humidor")}
            delay={0}
            accent
          />
          <ActionCard
            icon={Compass}
            title={t("dashboard.discover" as TranslationKey)}
            desc={t("dashboard.exploreBlends" as TranslationKey)}
            cta="Explore Blends"
            onClick={() => onNavigate("discover")}
            delay={0.1}
          />
          <ActionCard
            icon={MessageCircle}
            title={t("dashboard.askConcierge" as TranslationKey)}
            desc={t("dashboard.aiExpert" as TranslationKey)}
            cta="Enter Consultation"
            onClick={() => onNavigate("concierge")}
            delay={0.2}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-10">
          <ActionCard
            icon={BookOpen}
            title="Tasting Journal"
            desc="Record your smoking experiences with detailed notes"
            cta="Open Journal"
            onClick={() => onNavigate("journal")}
            delay={0.1}
          />
          <ActionCard
            icon={ShieldCheck}
            title="Collector Status"
            desc="Premium Membership Active"
            cta="View Profile"
            delay={0.2}
          />
        </div>


        {/* ═══════════════════════════════════════════
            DAILY TIP: Immersive Cinematic Banner
            ═══════════════════════════════════════════ */}
        <Reveal className="mb-14">
          <div className="relative overflow-hidden border border-gold/10 group">
            {/* Background image with parallax-like zoom on hover */}
            <img
              src={heroCigars}
              alt="Hero Cigars"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[12s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0604] via-[#0a0604]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0604]/50 to-transparent" />

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center border border-gold/15 bg-gold/[0.03] backdrop-blur-sm transition-all duration-500 group-hover:bg-gold/10 group-hover:border-gold/30">
                <Zap size={28} className="text-gold animate-subtle-float" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-gold/30" />
                  <p className="text-[10px] font-ui tracking-[0.4em] uppercase text-gold/60">{tipLabel}</p>
                </div>
                <p className="font-serif-body text-cream/80 text-xl md:text-2xl leading-relaxed max-w-3xl italic group-hover:text-cream transition-colors duration-500">
                  &ldquo;{tip}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </Reveal>


        {/* ═══════════════════════════════════════════
            TRENDING SECTION
            ═══════════════════════════════════════════ */}
        <Reveal className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={14} className="text-gold/30" />
            <p className="text-[10px] font-ui tracking-[0.4em] uppercase text-gold/30">Trending This Week</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Padrón 1964 Anniversary", origin: "Nicaragua", rating: "96" },
              { name: "Arturo Fuente Opus X", origin: "Dominican Republic", rating: "95" },
              { name: "Cohiba Behike 56", origin: "Cuba", rating: "97" },
            ].map((cigar, i) => (
              <motion.div
                key={cigar.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-5 border border-white/[0.04] bg-black/20 hover:border-gold/15 transition-all duration-500 cursor-pointer"
                onClick={() => onNavigate("discover")}
              >
                <div className="flex items-center justify-between mb-3">
                  <Star size={14} className="text-gold/50" />
                  <span className="text-xs font-display font-bold text-gold">{cigar.rating}</span>
                </div>
                <h4 className="font-display text-sm text-cream font-bold mb-1 group-hover:text-gold transition-colors duration-300">{cigar.name}</h4>
                <p className="text-[10px] font-ui text-cream/25 tracking-wider uppercase">{cigar.origin}</p>
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold/30 group-hover:w-full transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </Reveal>

      </div>
    </div>
  );
}
