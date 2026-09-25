import { z } from "zod";
import {
  TRAVELER_TYPES, TRIP_LENGTHS, LANDSCAPES, VIBES, STRUCTURES, PACES, STAY_LEVELS,
  PROPERTY_TYPES, TRANSPORT, DRIVE,
} from "./options";

// Strip control characters and trim. React escapes on render; emails escape HTML separately.
const clean = (max: number) =>
  z.string().transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()).pipe(z.string().max(max));
const optText = (max: number) => clean(max).optional().transform((v) => (v ? v : undefined));
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const tripSchema = z
  .object({
    departureCity: clean(120).pipe(z.string().min(2, "Tell us where you're traveling from.")),
    departureAirport: optText(80),
    dateType: z.enum(["EXACT", "FLEXIBLE"]),
    departureDate: isoDate.optional(),
    returnDate: isoDate.optional(),
    flexibleMonth: optText(40),
    flexibleDates: optText(200),
    travelerType: z.enum(TRAVELER_TYPES),
    travelerCount: z.coerce.number().int().min(1).max(40),
    childAges: optText(120),
    tripLength: clean(40).pipe(z.string().min(1)),
    budgetAmount: z.coerce.number().int().min(1).max(10_000_000),
    budgetType: z.enum(["PER_PERSON", "TOTAL"]),
    flightsInBudget: z.enum(["YES", "NO", "NOT_SURE"]),
    landscapes: z.array(z.enum(LANDSCAPES)).min(1).max(LANDSCAPES.length),
    vibes: z.array(z.enum(VIBES)).min(1).max(VIBES.length),
    tripStructure: z.enum(STRUCTURES.map((s) => s.v) as [string, ...string[]]),
    pace: z.enum(PACES.map((s) => s.v) as [string, ...string[]]),
    iconicLocalScore: z.coerce.number().int().min(0).max(100),
    accommodationLevel: z.enum(STAY_LEVELS),
    propertyTypes: z.array(z.enum(PROPERTY_TYPES)).max(PROPERTY_TYPES.length).default([]),
    transportPreferences: z.array(z.enum(TRANSPORT)).min(1).max(TRANSPORT.length),
    driveEurope: z.enum(DRIVE),
    mustVisit: optText(3000),
    dreamExperience: optText(3000),
    avoid: optText(3000),
    additionalNotes: optText(5000),
    firstName: clean(80).pipe(z.string().min(1, "First name is required.")),
    lastName: clean(80).pipe(z.string().min(1, "Last name is required.")),
    email: clean(200).pipe(z.string().email("Enter a valid email address.")),
    phone: optText(40),
    termsAccepted: z.literal(true),
    serviceAcknowledged: z.literal(true),
    marketingConsent: z.boolean().default(false),
    website: z.string().max(0).optional(), // honeypot — must stay empty
  })
  .superRefine((v, ctx) => {
    if (v.dateType === "EXACT") {
      if (!v.departureDate || !v.returnDate) ctx.addIssue({ code: "custom", message: "Add your departure and return dates.", path: ["departureDate"] });
      else if (v.returnDate < v.departureDate) ctx.addIssue({ code: "custom", message: "Return date must be after departure.", path: ["returnDate"] });
    } else if (!v.flexibleMonth) {
      ctx.addIssue({ code: "custom", message: "Choose an approximate month.", path: ["flexibleMonth"] });
    }
    if (!TRIP_LENGTHS.includes(v.tripLength as never) && !/^\d{1,3} days$/.test(v.tripLength)) {
      ctx.addIssue({ code: "custom", message: "Choose a trip length.", path: ["tripLength"] });
    }
  });
export type TripInput = z.infer<typeof tripSchema>;

export const contactSchema = z.object({
  name: clean(120).pipe(z.string().min(1, "Add your name.")),
  email: clean(200).pipe(z.string().email("Enter a valid email address.")),
  tripId: optText(40),
  subject: clean(160).pipe(z.string().min(1, "Add a subject.")),
  message: clean(5000).pipe(z.string().min(5, "Add a message.")),
  website: z.string().max(0).optional(),
});
