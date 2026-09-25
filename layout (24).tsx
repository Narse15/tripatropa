import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "TRIPATROP | Personalized Europe Trip Planning", template: "%s | TRIPATROP" },
  description: "Tell us your budget, dates and travel style. TRIPATROP personally researches and designs your Europe trip, then gives you the links to book it yourself.",
  openGraph: {
    type: "website", siteName: "TRIPATROP", url: site,
    title: "TRIPATROP | Your Europe. Your way.",
    description: "Personalized Europe trip planning for American travelers. We plan. You go.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "tripatrop — We plan. You go." }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.png", apple: "/icon.png" },
};
export const viewport: Viewport = { themeColor: "#F2EADB", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Gloock&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        {provider === "plausible" && process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />
        )}
        {provider === "ga4" && process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA4_ID}',{anonymize_ip:true});`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
