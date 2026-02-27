import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const BentoGrid = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
                className,
            )}
        >
            {children}
        </div>
    );
};

const BentoCard = ({
    name,
    className,
    background,
    Icon,
    description,
    href,
    cta,
    onClick,
}: {
    name: string;
    className?: string;
    background: ReactNode;
    Icon: any;
    description: string;
    href: string;
    cta: string;
    onClick?: () => void;
}) => (
    <div
        key={name}
        onClick={onClick}
        className={cn(
            "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 transition-all duration-500",
            onClick ? "cursor-pointer" : "",
            "bg-card/40 backdrop-blur-md shadow-2xl hover:border-gold/30 hover:shadow-gold/5",
            className,
        )}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-mahogany/40 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div>{background}</div>

        <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-500 group-hover:-translate-y-8">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gold/5 border border-gold/10 text-gold transition-all duration-500 group-hover:scale-110 group-hover:bg-gold/10">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-cream tracking-tight transition-colors duration-500 group-hover:text-gold">
                {name}
            </h3>
            <p className="max-w-lg font-ui text-sm text-muted-foreground/80 leading-relaxed">
                {description}
            </p>
        </div>

        <div
            className={cn(
                "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100",
            )}
        >
            <button className="pointer-events-auto text-xs font-ui font-bold tracking-[0.1em] uppercase text-gold flex items-center gap-2 px-4 py-2 rounded-full bg-gold/5 border border-gold/10 hover:bg-gold hover:text-mahogany transition-all duration-300">
                {cta}
                <ArrowRightIcon className="h-3 w-3" />
            </button>
        </div>

        <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-500 group-hover:bg-gold/[0.02]" />
    </div>
);

export { BentoCard, BentoGrid };
