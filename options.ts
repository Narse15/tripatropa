// Shared option lists — used by the questionnaire, server validation and emails.
export const TRAVELER_TYPES = ["Solo", "Couple", "Friends", "Family", "Other"] as const;
export const TRIP_LENGTHS = ["5–7 days", "8–10 days", "11–14 days", "15–21 days", "21+ days"] as const;
export const LANDSCAPES = ["BEACHES", "MOUNTAINS", "BIG CITIES", "SMALL TOWNS", "COUNTRYSIDE", "ISLANDS", "ROAD TRIPS", "SURPRISE ME"] as const;
export const VIBES = ["NIGHTLIFE", "RELAXATION", "FOOD", "HISTORY & CULTURE", "ADVENTURE", "ROMANCE", "FOOTBALL & SPORTS", "SHOPPING", "NATURE", "HIDDEN GEMS", "ICONIC EUROPE", "LOCAL LIFE", "PHOTOGRAPHY", "WELLNESS"] as const;
export const STRUCTURES = [
  { v: "ONE HOME BASE", d: "Unpack once. Explore from there." },
  { v: "A FEW STOPS", d: "See different places without living out of your suitcase." },
  { v: "FULL EUROTRIP", d: "Cities. Countries. Trains. Let's move." },
  { v: "YOU DECIDE", d: "We'll figure out what makes sense." },
] as const;
export const PACES = [
  { v: "TAKE IT SLOW", d: "Late breakfasts count as plans." },
  { v: "BALANCED", d: "See plenty. Still enjoy it." },
  { v: "MAX IT OUT", d: "I crossed an ocean. Let's go." },
] as const;
export const STAY_LEVELS = ["Budget", "Comfort", "Boutique", "Premium", "Luxury", "Surprise me"] as const;
export const PROPERTY_TYPES = ["Hotel", "Apartment", "Hostel", "Resort", "No preference"] as const;
export const TRANSPORT = ["TRAIN", "FLIGHTS", "RENTAL CAR", "PUBLIC TRANSPORT", "WALKING", "WHATEVER MAKES SENSE"] as const;
export const DRIVE = ["YES", "NO", "DEPENDS"] as const;
export const FLIGHTS_IN_BUDGET = [
  { v: "YES", l: "YES" }, { v: "NO", l: "NO" }, { v: "NOT_SURE", l: "NOT SURE" },
] as const;

export const EXCLUSIVE_OPTIONS = ["SURPRISE ME", "No preference", "WHATEVER MAKES SENSE"];

export const TRIP_STATUSES = [
  "PENDING_PAYMENT", "NEW", "RESEARCHING", "CONCEPTS_SENT", "REVISION_REQUESTED", "AWAITING_SELECTION",
  "AWAITING_FINAL_PAYMENT", "FINAL_RESEARCH", "FINAL_READY", "DELIVERED", "CANCELLED",
] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export function iconicLabel(score: number) {
  if (score <= 33) return { t: "Iconic Europe", d: "Bucket-list landmarks and famous destinations." };
  if (score >= 67) return { t: "Local Europe", d: "Neighborhoods, local restaurants, smaller destinations and less obvious experiences." };
  return { t: "A balanced mix", d: "Some bucket-list moments, plus the neighborhoods and tables locals love." };
}
