import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class merger used by every shadcn / React Bits Pro component. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
