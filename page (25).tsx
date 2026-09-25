import type { Metadata } from "next";
import { Quiz } from "./Quiz";

export const metadata: Metadata = {
  title: "Build My Trip",
  description: "Tell us your dates, budget and travel style in about five minutes. We'll personally design your Europe trip around you.",
  robots: { index: true, follow: true },
};

export default function BuildMyTrip() {
  return <Quiz depositLabel={`$${(parseInt(process.env.TRIPATROP_DEPOSIT_CENTS || "4900", 10) / 100).toFixed(0)}`} finalLabel={`$${(parseInt(process.env.TRIPATROP_FINAL_CENTS || "15000", 10) / 100).toFixed(0)}`} />;
}
