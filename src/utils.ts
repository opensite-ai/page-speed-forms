import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes browser autofill colors so inputs keep theme colors.
 */
export const INPUT_AUTOFILL_RESET_CLASSES =
  "autofill:bg-transparent autofill:text-foreground " +
  "[&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] " +
  "[&:-webkit-autofill]:[caret-color:hsl(var(--foreground))] " +
  "[&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_hsl(var(--background))_inset] " +
  "[&:-webkit-autofill:hover]:[box-shadow:0_0_0px_1000px_hsl(var(--background))_inset] " +
  "[&:-webkit-autofill:focus]:[box-shadow:0_0_0px_1000px_hsl(var(--background))_inset] " +
  "[&:-webkit-autofill]:[transition:background-color_9999s_ease-out,color_9999s_ease-out]";
