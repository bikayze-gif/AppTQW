import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDecimal(value: any) {
  if (value === null || value === undefined) return "";
  const str = value.toString();
  // Check if it's a number (including negative and decimal)
  // We only replace if there's exactly one dot and it's surrounded by digits or at end
  if (/^-?\d+\.\d*$/.test(str)) {
    return str.replace(".", ",");
  }
  return str;
}
