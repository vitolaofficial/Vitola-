import { useSmokeClick } from "@/hooks/useSmokeEffect";

/**
 * Wrapper: adds click-smoke to any element
 */
export function SmokeButton({
  children,
  className = "",
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { containerRef, triggerSmoke } = useSmokeClick();

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        className={className}
        onClick={(e) => {
          triggerSmoke(e);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}

/**
 * CSS-only hover smoke wisp for cards and nav links
 */
export function SmokeHoverWrap({
  children,
  className = "",
  intensity = "light",
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium";
}) {
  return (
    <div className={`smoke-hover-wrap ${intensity === "medium" ? "smoke-hover-medium" : ""} ${className}`}>
      {children}
    </div>
  );
}
