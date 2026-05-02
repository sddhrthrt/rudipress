import type { ImageMetadata } from "astro:assets";

/**
 * Zine type representing a zine publication
 */
export interface Zine {
  title: string;
  author?: string;
  description?: string;
  uploadDate?: string;
  image?: ImageMetadata | string;
}