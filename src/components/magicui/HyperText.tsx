"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface HyperTextProps {
    text: string;
    duration?: number;
    framerProps?: Variants;
    className?: string;
    animateOnLoad?: boolean;
}

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const getRandomChar = () => alphabets[Math.floor(Math.random() * alphabets.length)];

export function HyperText({
    text,
    duration = 800,
    framerProps = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 3 },
    },
    className,
    animateOnLoad = true,
}: HyperTextProps) {
    const [displayText, setDisplayText] = useState(text.split(""));
    const [trigger, setTrigger] = useState(false);
    const interalRef = useRef<NodeJS.Timeout | null>(null);
    const iterations = useRef(0);

    const startAnimation = () => {
        setTrigger(true);
        iterations.current = 0;
    };

    useEffect(() => {
        if (animateOnLoad) {
            startAnimation();
        }
    }, [animateOnLoad]);

    useEffect(() => {
        if (!trigger) return;

        interalRef.current = setInterval(() => {
            if (iterations.current < text.length) {
                setDisplayText((t) =>
                    t.map((l, i) =>
                        l === " "
                            ? l
                            : i <= iterations.current
                                ? text[i]
                                : getRandomChar(),
                    ),
                );
                iterations.current = iterations.current + 0.1;
            } else {
                setTrigger(false);
                if (interalRef.current) clearInterval(interalRef.current);
            }
        }, duration / (text.length * 10));

        return () => {
            if (interalRef.current) clearInterval(interalRef.current);
        };
    }, [trigger, duration, text]);

    return (
        <div
            className="flex scale-100 cursor-default overflow-hidden py-2"
            onMouseEnter={startAnimation}
        >
            <AnimatePresence mode="wait">
                {displayText.map((letter, i) => (
                    <motion.h1
                        key={i}
                        className={cn("font-mono", className)}
                        {...framerProps}
                    >
                        {letter.toUpperCase()}
                    </motion.h1>
                ))}
            </AnimatePresence>
        </div>
    );
}
