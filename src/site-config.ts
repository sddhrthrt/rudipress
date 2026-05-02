/**
 * Site configuration - single source of truth for site metadata
 * Used across the site for meta tags, Open Graph, etc.
 */

export const siteConfig = {
  /** Site name */
  name: "Rudi Press",

  /** Site description for meta tags and OG */
  description: "Independent zine publication based out of unceded territories of the xʷməθkʷəy̓əm (Musqueam), Sḵwx̱wú7mesh (Squamish), and səlilwətaɬ (Tsleil-Waututh) Nations.",

  /** Full site URL (used for canonical URL, OG URL) */
  url: "https://rudipress.com",

  /** Site author */
  author: "Rudi Press",

  /** Keywords for meta */
  keywords: ["zines", "publishing", "creative", "independent", "Vancouver"],

  /** Twitter handle (without @) */
  twitter: "rudipress",

  /** Default OG image URL (absolute URL) */
  ogImage: "/og-image.png",
} as const;

export type SiteConfig = typeof siteConfig;