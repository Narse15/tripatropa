"use client";
import Link from "next/link";
import { track } from "@/lib/analytics";

export function BuildLink({ children = "BUILD MY TRIP →", className = "btn btn-primary", from = "unknown" }: { children?: React.ReactNode; className?: string; from?: string }) {
  return <Link href="/build-my-trip" className={className} onClick={() => track("build_trip_clicked", { from })}>{children}</Link>;
}
