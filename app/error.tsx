"use client";
import Link from "next/link";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (<main className="status-page"><div className="wrap narrow"><h1 className="d2">Something went sideways.</h1><p className="lede" style={{ marginTop: 20 }}>That one&apos;s on us. Your saved answers are still in this browser tab.</p><div className="row"><button className="btn btn-primary btn-lg" onClick={reset}>TRY AGAIN</button><Link className="btn btn-ghost btn-lg" href="/contact">CONTACT US</Link></div></div></main>);
}
