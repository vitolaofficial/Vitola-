import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type CigarEntry } from "@/types/cigar";
import "@/styles/HumidorBox.css";

interface HumidorBoxProps {
  cigars: CigarEntry[];
  onCigarClick: (cigar: CigarEntry) => void;
  onRemove: (id: string) => void;
}

// getCigarColor removed - styles moved to HumidorBox.css

function CigarStick({ cigar, index, onClick }: { cigar: CigarEntry; index: number; onClick: () => void }) {
  const wrapperClass = `wrapper-${cigar.wrapper.toLowerCase().split(" ")[0]}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.8 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
      className={`cursor-pointer group relative flex justify-start pl-8 ${wrapperClass}`}
      onClick={onClick}
      title={`${cigar.brand} ${cigar.name}`}
    >
      {/* Drop shadow underneath the cigar casting on the cedar floor */}
      <div className="cigar-stick-shadow group-hover:bg-black/70" />

      <div className="cigar-stick-inner">

        {/* Foot (ash/exposed end) - left side */}
        <div className="cigar-foot">
          <div className="cigar-foot-overlay" />
        </div>

        {/* Main Body (Wrapper) */}
        <div className="cigar-body -ml-[1px]">
          {/* Vein / Leaf Texture */}
          <div className="cigar-veins" />
        </div>

        {/* Cigar Band - Metallic foil look */}
        <div className="cigar-band group-hover:scale-[1.05]">
          {/* Inner circle of the band */}
          <div className="cigar-band-inner">
            <span className="text-[6px] text-white/90 font-display font-bold">V</span>
          </div>
        </div>

        {/* Cap (Rounded head) - right side */}
        <div className="cigar-cap" />

        {/* Hover Target Area / Glow */}
        <div className="cigar-glow-effect absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}

export function HumidorBox({ cigars, onCigarClick, onRemove }: HumidorBoxProps) {
  const [lidOpen, setLidOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLidOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="humidor-wrapper-outer">
      {/* Box shadow cast on the "table" underneath */}
      <div className="humidor-shadow-bottom" />
      <div className="humidor-shadow-front" />

      {/* Humidor outer base frame — highly polished dark mahogany */}
      <div
        className="humidor-main-base"
      >
        {/* Premium Wood Burl Texture overlay */}
        <div className="humidor-wood-overlay" />

        <div className="flex justify-center gap-56 mb-2 relative z-10 drop-shadow-md">
          {[0, 1].map((i) => (
            <div key={i} className="humidor-hinge-block">
              <div className="humidor-hinge-cover" />
              {/* Screws on hinges */}
              <div className="humidor-hinge-rivet top-[3px] left-[3px]" />
              <div className="humidor-hinge-rivet top-[3px] right-[3px]" />
            </div>
          ))}
        </div>

        {/* The Glass Lid - Opens precisely */}
        <motion.div
          className="humidor-lid-motion"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: lidOpen ? -68 : 0 }}
          transition={{
            duration: 2.2,
            ease: [0.16, 1, 0.3, 1], // cinematic super-smooth easing
            delay: 0.2,
          }}
        >
          {/* Glass Frame Top Face */}
          <div
            className="humidor-lid-glass"
          >
            {/* Dynamic Glare passing across glass as it opens */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: lidOpen
                  ? "linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.01) 20%, transparent 25%)"
                  : "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.18) 50%, transparent 55%)"
              }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            />

            {/* Analog Hygrometer / Dial built into the glass lid */}
            <div className="humidor-hygrometer-frame">
              <div className="humidor-hygrometer-face">
                <div className="absolute inset-[3px] rounded-full border border-white/15" />

                {/* Measurement ticks */}
                <div className="humidor-hygrometer-ticks" />

                <div className="flex flex-col items-center justify-center h-full pt-1">
                  <span className="text-[10px] text-white/90 font-display font-medium tracking-wide">70</span>
                  <span className="text-[5px] text-gold/70 font-ui uppercase mt-[1px]">Humidity</span>
                </div>

                {/* Golden Needle */}
                <div className="hygrometer-needle">
                  <div className="hygrometer-needle-inner" />
                </div>
                <div className="hygrometer-pin" />

                {/* Dial Glass Dome Glow */}
                <div className="hygrometer-glass-shine" />
              </div>
            </div>

            {/* Glass Logo Etching (Subtle) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
              <span className="font-display text-white text-lg tracking-[0.3em] uppercase">Vitola</span>
            </div>
          </div>

          {/* Lid internal thickness (visible when open) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: lidOpen ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lid-open-thickness"
          />
        </motion.div>

        {/* Interior — Genuine Spanish Cedar look */}
        <div
          className="humidor-interior-void"
        >
          {/* Base Cedar Floor / Tray */}
          <div className="cedar-main-tray">

            {/* Authentic Cedar Wood Grain */}
            <div className="cedar-texture-grain-1" />
            <div className="cedar-texture-grain-2" />

            {/* Divider ridges - creates individual cigar slots */}
            <div className="absolute left-8 right-8 top-0 bottom-0 pointer-events-none flex flex-col justify-around py-2 opacity-50">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="cedar-divider-slot" />
              ))}
            </div>
          </div>

          {/* Warm internal showcase lighting reflecting off cedar */}
          <motion.div
            className="humidor-light-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: lidOpen ? 0.25 : 0 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          />

          {/* Cigars - placed into the tray */}
          <motion.div
            className="relative z-10 flex flex-col gap-[18px] mt-4 ml-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: lidOpen ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {cigars.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-[12px] font-ui text-[#ffe8a1] opacity-40 tracking-[0.3em] uppercase drop-shadow-lg mix-blend-plus-lighter">
                  Empty — Add your first cigar
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {cigars.map((cigar, i) => (
                  <CigarStick key={cigar.id} cigar={cigar} index={i} onClick={() => onCigarClick(cigar)} />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </div>

        {/* Front Lock / Keyhole / Clasp assembly */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[1px] z-30">
          <div className="humidor-closure-lock">
            {/* Keyhole Plate */}
            <div className="lock-assembly-plate">
              {/* Actual Keyhole */}
              <div className="lock-key-void">
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1.5 h-3 bg-[#1a1a1a]" />
              </div>
            </div>
            {/* Decorative rivets */}
            <div className="lock-rivet left-2" />
            <div className="lock-rivet right-2" />
          </div>
        </div>

      </div>
    </div>
  );
}
