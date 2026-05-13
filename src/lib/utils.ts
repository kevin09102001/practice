import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina clases de Tailwind sin conflictos.
// Ej: cn("px-2", isActive && "bg-accent", className)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
