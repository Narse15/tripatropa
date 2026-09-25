import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return ["", "/build-my-trip", "/pricing", "/faq", "/contact", "/terms", "/privacy", "/refund-policy"].map((p) => ({ url: base + p, changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));
}
