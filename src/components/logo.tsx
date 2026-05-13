import Link from "next/link";
import { cn } from "@/lib/utils";

// Logo: "P." en serif + wordmark en caps tracked.
// El punto en oxblood = el "beat" del actor.
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-baseline gap-2.5 group", className)}
    >
      <span className="font-display text-3xl leading-none tracking-[-0.02em]">
        P
        <span className="text-[var(--color-accent)]">.</span>
      </span>
      <span className="label-speaker text-[var(--color-ink-soft)] group-hover:text-[var(--color-ink)] transition-colors">
        Practice
      </span>
    </Link>
  );
}
