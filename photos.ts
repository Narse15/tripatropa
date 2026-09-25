import type { SceneKey } from "@/components/Scene";

/**
 * PHOTOGRAPHY
 * Drop licensed photos into /public/photos/ and set `src` below (e.g. "/photos/beach.jpg").
 * Until a src is set, an illustrated postcard is shown. next/image optimizes and lazy-loads them.
 */
export const PHOTOS: Record<string, { scene: SceneKey; alt: string; src?: string }> = {
  heroAlgarve:  { scene: "sea", alt: "Golden cliffs and turquoise water on Portugal's Algarve coast" },
  heroFlorence: { scene: "city", alt: "Terracotta rooftops and the cathedral dome in Florence" },
  heroAlps:     { scene: "alps", alt: "Jagged peaks of the Dolomites above green meadows" },
  heroFootball: { scene: "football", alt: "A floodlit European football stadium on match night" },
  heroTrain:    { scene: "train", alt: "A train crossing rolling countryside in Europe" },
  beaches:      { scene: "sea", alt: "Mediterranean beach with umbrellas" },
  mountains:    { scene: "alps", alt: "Alpine mountain landscape" },
  cities:       { scene: "city", alt: "Historic European city skyline" },
  towns:        { scene: "town", alt: "Small hilltop town with a bell tower" },
  countryside:  { scene: "country", alt: "Vineyards and cypress trees in the countryside" },
  islands:      { scene: "island", alt: "Whitewashed houses on a Greek island" },
  roadtrips:    { scene: "road", alt: "Winding mountain road on a European road trip" },
  surprise:     { scene: "surprise", alt: "A dotted route across a map" },
  medNights:    { scene: "night", alt: "Mediterranean city at night" },
  dolceVita:    { scene: "cafe", alt: "Italian café table under a striped awning" },
  alpine:       { scene: "alps", alt: "Alpine lake and peaks" },
  iberian:      { scene: "sea", alt: "Sunset over the Atlantic in southern Portugal" },
};
