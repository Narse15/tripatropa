import Link from "next/link";
export default function NotFound() {
  return (<main className="status-page"><div className="wrap narrow"><h1 className="d2">Wrong turn.</h1><p className="lede" style={{ marginTop: 20 }}>This page doesn&apos;t exist.</p><Link className="btn btn-primary btn-lg" href="/">BACK HOME</Link></div></main>);
}
