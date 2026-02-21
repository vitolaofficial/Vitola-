import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CigarEntry } from "./Humidor";

interface HumidorBoxProps {
  cigars: CigarEntry[];
  onCigarClick: (cigar: CigarEntry) => void;
  onRemove: (id: string) => void;
}

function getCigarColor(wrapper: string) {
  const colors: Record<string, { body: string; band: string; foot: string }> = {
    "Connecticut Shade": { body: "#C4956A", band: "#D4A84B", foot: "#E8D5B5" },
    "Claro": { body: "#C9A06C", band: "#C8A24D", foot: "#E0CAA8" },
    "Colorado Claro": { body: "#A07040", band: "#D4A84B", foot: "#C8A070" },
    "Colorado": { body: "#8B5E3C", band: "#C8960A", foot: "#A87D50" },
    "Colorado Maduro": { body: "#6B4226", band: "#D4A84B", foot: "#8B6340" },
    "Maduro": { body: "#4A2C17", band: "#C8960A", foot: "#6B4830" },
    "Oscuro": { body: "#2E1A0E", band: "#D4A84B", foot: "#4A3020" },
    "Candela": { body: "#6B8B4A", band: "#C8A24D", foot: "#8BA06A" },
  };
  return colors[wrapper] || colors["Colorado"];
}

function CigarStick({ cigar, index, onClick }: { cigar: CigarEntry; index: number; onClick: () => void }) {
  const colors = getCigarColor(cigar.wrapper);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
      className="cursor-pointer group"
      onClick={onClick}
      title={`${cigar.brand} ${cigar.name}`}
    >
      <div className="relative flex items-center" style={{ height: "22px" }}>
        <div className="rounded-l-sm" style={{ width: "8px", height: "18px", background: colors.foot }} />
        <div
          className="relative group-hover:brightness-110 transition-all duration-200"
          style={{
            width: "100px", height: "18px",
            background: `linear-gradient(180deg, ${colors.body}ee 0%, ${colors.body} 40%, ${colors.body}cc 100%)`,
            boxShadow: `0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)` }}
          />
        </div>
        <div
          className="relative z-10 flex items-center justify-center"
          style={{
            width: "24px", height: "20px",
            background: `linear-gradient(180deg, ${colors.band}, ${colors.band}cc)`,
            boxShadow: `0 0 4px rgba(200,150,10,0.4)`,
            borderLeft: "1px solid rgba(255,255,255,0.2)",
            borderRight: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div className="w-3 h-3 rounded-full border border-white/30" style={{ background: `radial-gradient(circle, ${colors.band}, ${colors.band}88)` }} />
        </div>
        <div className="rounded-r-full" style={{
          width: "12px", height: "16px",
          background: `linear-gradient(180deg, ${colors.body}ee 0%, ${colors.body} 50%, ${colors.body}cc 100%)`,
          boxShadow: `inset -2px 0 3px rgba(0,0,0,0.2)`,
        }} />
        <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 12px rgba(200,168,75,0.3)` }}
        />
      </div>
    </motion.div>
  );
}

export function HumidorBox({ cigars, onCigarClick, onRemove }: HumidorBoxProps) {
  const [lidOpen, setLidOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLidOpen(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative mx-auto" style={{ maxWidth: "640px", perspective: "1200px" }}>
      {/* Humidor outer frame — wood */}
      <div
        className="relative rounded-lg overflow-visible"
        style={{
          background: "linear-gradient(180deg, #5C3A1E 0%, #3E2210 40%, #2E1A0E 100%)",
          padding: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Wood grain texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(95deg, transparent, transparent 20px, rgba(139,94,60,0.3) 20px, rgba(139,94,60,0.3) 21px)`,
          }}
        />

        {/* Top metal hinges */}
        <div className="flex justify-center gap-32 mb-1 relative z-10">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-full" style={{
              width: "28px", height: "6px",
              background: "linear-gradient(180deg, #C8A84D, #8B7530, #C8A84D)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }} />
          ))}
        </div>

        {/* Glass lid with opening animation */}
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: lidOpen ? -75 : 0 }}
          transition={{
            duration: 1.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 0,
          }}
          style={{
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            zIndex: 20,
            position: "relative",
          }}
        >
          <div
            className="relative rounded-t-md overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(200,168,75,0.06) 0%, rgba(255,255,255,0.03) 50%, rgba(200,168,75,0.04) 100%)",
              border: "1px solid rgba(200,168,75,0.15)",
              borderBottom: "none",
              padding: "4px",
              minHeight: "20px",
            }}
          >
            {/* Glass reflection streak */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.04) 100%)",
              }}
            />
            {/* Hygrometer indicator */}
            <div className="flex items-center justify-end gap-2 px-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500/70 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                <span className="text-[9px] font-ui text-gold/50 tracking-wider">70% RH</span>
              </div>
              <span className="text-[9px] font-ui text-gold/40">|</span>
              <span className="text-[9px] font-ui text-gold/50 tracking-wider">68°F</span>
            </div>
          </div>

          {/* Lid bottom edge (thickness of lid visible when open) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: lidOpen ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              height: "6px",
              background: "linear-gradient(180deg, #5C3A1E, #3E2210)",
              borderLeft: "1px solid rgba(200,168,75,0.1)",
              borderRight: "1px solid rgba(200,168,75,0.1)",
              transform: "rotateX(90deg)",
              transformOrigin: "top center",
            }}
          />
        </motion.div>

        {/* Interior — cedar-lined */}
        <div
          className="relative rounded-b-md"
          style={{
            background: "linear-gradient(180deg, #6B4226 0%, #5C3A1E 30%, #4A2C17 100%)",
            border: "1px solid rgba(200,168,75,0.1)",
            borderTop: "2px solid rgba(200,168,75,0.2)",
            minHeight: "180px",
            padding: "16px",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.4), inset 0 -2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {/* Cedar aroma mist — appears when lid opens */}
          <motion.div
            className="absolute inset-0 rounded-b-md pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: lidOpen ? [0, 0.6, 0] : 0 }}
            transition={{ duration: 3, delay: 0.8, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(ellipse at center top, rgba(200,168,75,0.15) 0%, rgba(200,168,75,0.05) 40%, transparent 70%)",
            }}
          />

          {/* Cedar texture */}
          <div className="absolute inset-0 rounded-b-md opacity-15 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(85deg, transparent, transparent 30px, rgba(200,140,60,0.2) 30px, rgba(200,140,60,0.2) 31px),
                repeating-linear-gradient(175deg, transparent, transparent 50px, rgba(160,100,40,0.15) 50px, rgba(160,100,40,0.15) 51px)
              `,
            }}
          />

          {/* Divider ridges */}
          <div className="absolute left-4 right-4 top-0 bottom-0 pointer-events-none flex flex-col justify-around opacity-30">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                height: "2px",
                background: "linear-gradient(90deg, transparent 5%, rgba(90,55,25,0.6) 20%, rgba(90,55,25,0.8) 50%, rgba(90,55,25,0.6) 80%, transparent 95%)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.05)",
              }} />
            ))}
          </div>

          {/* Cigars — fade in after lid opens */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: lidOpen ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {cigars.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-[11px] font-ui text-gold/40 tracking-[0.2em] uppercase">
                  Empty — Add your first cigar
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <AnimatePresence>
                  {cigars.map((cigar, i) => (
                    <CigarStick key={cigar.id} cigar={cigar} index={i} onClick={() => onCigarClick(cigar)} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom metal clasp */}
        <div className="flex justify-center mt-1 relative z-10">
          <div style={{
            width: "40px", height: "8px",
            background: "linear-gradient(180deg, #C8A84D, #8B7530, #6B5520, #C8A84D)",
            borderRadius: "0 0 4px 4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }} />
        </div>
      </div>

      {/* Shadow under humidor */}
      <div className="mx-8 h-4 -mt-1 rounded-b-full opacity-40"
        style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)" }}
      />
    </div>
  );
}
