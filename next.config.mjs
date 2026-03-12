/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds and CI lint/type-check steps.
 */
if (!process.env.SKIP_ENV_VALIDATION) {
  await import("./src/env.mjs");
}

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  // Production optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagsapi.com",
      },
      {
        protocol: "https",
        hostname: "feastqr.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      // Only allow localhost in development
      ...(process.env.NODE_ENV === "development"
        ? [
            {
              protocol: /** @type {"http"} */ ("http"),
              hostname: "localhost",
            },
          ]
        : []),
    ],
  },
  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  eslint: { ignoreDuringBuilds: true },
  // i18n config is NOT compatible with App Router - commented out
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "https://tryhards.space/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms-of-service",
        destination: "https://tryhards.space/terms-of-service",
        permanent: true,
      },
      {
        source: "/return-policy",
        destination: "https://tryhards.space/return-policy",
        permanent: true,
      },
    ];
  },
};

export default config;