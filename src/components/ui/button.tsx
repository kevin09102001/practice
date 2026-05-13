import { cn } from "@/lib/utils";
import * as React from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Botón estilo "wax seal stamped on paper" — sólido, decisivo.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]";

    const variants: Record<Variant, string> = {
      primary:
        "bg-[var(--color-ink)] text-[var(--color-bg)] hover:bg-[var(--color-accent)] shadow-[0_2px_0_0_var(--color-ink-faded)] hover:shadow-[0_2px_0_0_var(--color-accent-hover)] active:shadow-[0_1px_0_0_var(--color-ink-faded)]",
      secondary:
        "bg-transparent text-[var(--color-ink)] border border-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dark)] hover:border-[var(--color-ink)]",
      ghost:
        "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-dark)]",
    };

    const sizes: Record<Size, string> = {
      sm: "h-8 px-3.5 text-[0.68rem] uppercase tracking-[0.16em] font-semibold rounded-[var(--radius-sm)]",
      md: "h-10 px-5 text-[0.7rem] uppercase tracking-[0.16em] font-semibold rounded-[var(--radius-sm)]",
      lg: "h-14 px-8 text-xs uppercase tracking-[0.18em] font-semibold rounded-[var(--radius-sm)]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
