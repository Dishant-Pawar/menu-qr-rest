export const getBaseUrl = () => {
  // Browser context - use current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // For production deployment on Vercel
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // For server-side rendering on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Production fallback (custom domain)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // For local development
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  // Final fallback - should not reach here in production
  console.warn("[getBaseUrl] Using fallback URL - configure NEXT_PUBLIC_SITE_URL");

  return "https://feastqr.com";
};
