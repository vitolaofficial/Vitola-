import { useCallback, useRef } from "react";

/**
 * Hook: spawns gold-tinted smoke particles at click position
 */
export function useSmokeClick() {
    const containerRef = useRef<HTMLDivElement>(null);

    const triggerSmoke = useCallback((e: React.MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const count = 6;
        for (let i = 0; i < count; i++) {
            const p = document.createElement("div");
            p.className = "smoke-particle";
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
            const dist = 20 + Math.random() * 30;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist - 20 - Math.random() * 25; // bias upward
            const size = 6 + Math.random() * 10;
            const dur = 600 + Math.random() * 400;

            p.style.cssText = `
        left: ${x}px; top: ${y}px; width: ${size}px; height: ${size}px;
        --dx: ${dx}px; --dy: ${dy}px;
        animation: smoke-rise ${dur}ms ease-out forwards;
      `;
            container.appendChild(p);
            setTimeout(() => p.remove(), dur + 50);
        }
    }, []);

    return { containerRef, triggerSmoke };
}
