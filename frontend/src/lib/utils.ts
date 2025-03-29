import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, handling conditional classes
 * and merging Tailwind CSS classes properly.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

