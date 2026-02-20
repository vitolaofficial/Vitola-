import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, filter: "blur(6px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="relative"
      >
        {/* Smoke overlay on enter */}
        <motion.div
          className="pointer-events-none fixed inset-0 z-50"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: "radial-gradient(ellipse at center, hsl(43 72% 52% / 0.06) 0%, transparent 70%)",
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
