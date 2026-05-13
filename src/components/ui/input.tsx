import { cn } from "@/lib/utils";
import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Input estilo "ruled paper" — minimal, sin fondo, línea inferior.
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="label-speaker text-[var(--color-ink-soft)] block"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "block w-full bg-transparent border-0 border-b-2 border-[var(--color-border-strong)] px-0 py-2.5 text-[var(--color-ink)] text-base",
            "placeholder:text-[var(--color-ink-faded)] placeholder:italic",
            "focus:border-[var(--color-accent)] focus:outline-none focus:ring-0",
            "transition-colors duration-150",
            error && "border-[var(--color-error)] focus:border-[var(--color-error)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs italic text-[var(--color-error)]">— {error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
