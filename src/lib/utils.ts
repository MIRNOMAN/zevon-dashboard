import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format price safely regardless of number, string, Decimal, or null/undefined
 */
export function formatPrice(price: unknown, currency = "$"): string {
  if (price === null || price === undefined || price === "") {
    return `${currency}0.00`;
  }
  const numeric = typeof price === "number" ? price : parseFloat(String(price));
  if (isNaN(numeric)) {
    return `${currency}0.00`;
  }
  return `${currency}${numeric.toFixed(2)}`;
}

/**
 * Format a date to a human-readable string.
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  },
): string {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
}

/**
 * Safely truncate a string to a max length, appending an ellipsis if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract clean error message from RTK Query / NestJS backend error response
 */
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred"): string {
  if (!err) return fallback;

  if (typeof err === "string") return err;

  // RTK Query FetchBaseQueryError
  if (typeof err === "object" && err !== null) {
    const errorObj = err as Record<string, unknown>;

    // Handle nested data property
    if (errorObj.data && typeof errorObj.data === "object") {
      const data = errorObj.data as Record<string, unknown>;

      if (Array.isArray(data.message)) {
        return data.message.join(", ");
      }
      if (typeof data.message === "string") {
        return data.message;
      }
      if (typeof data.error === "string") {
        return data.error;
      }
    }

    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }

  return fallback;
}
