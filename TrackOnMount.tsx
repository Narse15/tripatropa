"use client";
import { useEffect } from "react";
import { track, AnalyticsEvent } from "@/lib/analytics";
export function TrackOnMount({ event, props }: { event: AnalyticsEvent; props?: Record<string, string | number | boolean> }) {
  useEffect(() => { track(event, props); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
