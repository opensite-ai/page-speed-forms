import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a field name (snake_case or camelCase) to a human-readable label.
 *
 * @example
 * humanizeFieldName("first_name") // "First name"
 * humanizeFieldName("email") // "Email"
 * humanizeFieldName("accepts_sms_marketing") // "Accepts sms marketing"
 */
export function humanizeFieldName(name: string): string {
  if (!name) return "This field";

  // Replace underscores with spaces and split camelCase
  const words = name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();

  // Capitalize first letter only
  return words.charAt(0).toUpperCase() + words.slice(1);
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
