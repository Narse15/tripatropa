"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BuildLink } from "./BuildLink";

const LINKS = [
  { href: "/#how-it-works", label: "HOW IT WORKS" },
  { href: "/#what-you-get", label: "WHAT YOU GET" },
  { href: "/#explore", label: "EXPLORE" },
  { href: "/pricing", label: "PRICING" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.body.classList.add("has-mobile-cta");
    return () => document.body.classList.remove("has-mobile-cta");
  }, []);
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="header">
        <div className="wrap">
          <Link href="/" className="brand" aria-label="TRIPATROP home">
            <Image src="/logo-wordmark.png" alt="tripatrop" width={900} height={198} priority style={{ height: 30, width: "auto" }} />
          </Link>
          <nav aria-label="Main"><ul className="navlinks">{LINKS.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul></nav>
          <BuildLink className="btn btn-primary header-cta" from="header" />
          <button className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">{open ? <path d="M5 5l16 16M21 5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M3 8h20M3 18h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}</svg>
          </button>
        </div>
      </header>
      <nav id="mobile-menu" className="mobile-menu" data-open={open} aria-label="Mobile">
        {LINKS.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label.charAt(0) + l.label.slice(1).toLowerCase()}</Link>)}
        <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
      </nav>
      <div className="mobile-cta"><BuildLink className="btn btn-primary btn-block" from="mobile_bar" /></div>
    </>
  );
}
