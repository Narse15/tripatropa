import Link from "next/link";
import Image from "next/image";
import { config } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <Image src="/logo-wordmark-light.png" alt="tripatrop" width={900} height={198} style={{ height: 34, width: "auto" }} />
            <p style={{ marginTop: 12, letterSpacing: ".16em", fontWeight: 700, fontSize: ".8rem" }}>WE PLAN. YOU GO.</p>
          </div>
          <ul>
            <li><Link href="/build-my-trip">Build My Trip</Link></li>
            <li><Link href="/#how-it-works">How It Works</Link></li>
            <li><Link href="/#what-you-get">What You Get</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <ul>
            <li><Link href="/terms">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/refund-policy">Refund Policy</Link></li>
          </ul>
          <ul>
            <li><a href={config.instagram()} rel="noopener" target="_blank">Instagram</a></li>
            <li><a href={config.tiktok()} rel="noopener" target="_blank">TikTok</a></li>
          </ul>
        </div>
        <div className="bottom">
          <span>Personalized European trip planning for travelers from the United States.</span>
          <span>© {new Date().getFullYear()} {config.legalName()}</span>
        </div>
      </div>
    </footer>
  );
}
