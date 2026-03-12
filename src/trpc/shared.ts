import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { type AppRouter } from "~/server/api/root";

export const transformer = superjson;

function getBaseUrl() {
  // Browser context - use relative URLs
  if (typeof window !== "undefined") return "";
  
  // Vercel deployment
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  
  // Custom production domain
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  // Development fallback
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  // Production fallback
  console.warn("[tRPC] Using fallback URL - configure NEXT_PUBLIC_SITE_URL");

  return "https://feastqr.com";
}

export function getUrl() {
  return getBaseUrl() + "/api/trpc";
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
