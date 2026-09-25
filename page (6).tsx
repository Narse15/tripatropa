import Link from "next/link";
import { BuildLink } from "@/components/BuildLink";
import { Photo } from "@/components/Photo";
import { PricingCard } from "@/components/PricingCard";
import { Faq } from "@/components/Faq";
import { TrackOnMount } from "@/components/TrackOnMount";
import { faqItems } from "@/lib/faq";
import { getSetting } from "@/lib/trips";
import Image from "next/image";

export const revalidate = 300;

const TABS = ["cheap flights to europe","barcelona vs lisbon","where to stay in rome","trenitalia timetable","is ibiza expensive","uffizi tickets","europe itinerary reddit","best time amalfi","paris neighborhoods","eurail worth it?","nice airport transfer","hidden gems portugal","munich hotels","dolomites car rental","premier league tickets","la liga fixtures","seville in june","ferry to ibiza","vatican skip line","late night food madrid","driving in italy","florence day trips","cheapest day louvre","venice crowds","innsbruck to venice","lisbon trams","algarve beaches","tapas seville","ryanair bag rules","how many days rome","santorini vs mykonos","swiss pass","europe 10 days budget","travel adapter","festivals july europe","train or fly","is it worth it"];

const HOMEWORK: [string, string, string[]?][] = [
  ["Routes", "We figure out which destinations actually make sense together — and in what order."],
  ["Flights", "We compare options based on price, timing, airports and how the flight affects the rest of your vacation."],
  ["Stays", "We research accommodations and neighborhoods that fit your budget and style."],
  ["Transport", "Train, flight, ferry, rental car or bus? We compare what makes sense for your route."],
  ["Attractions", "We research museums, landmarks, tours and experiences relevant to you."],
  ["Smarter timing", "When reliable information is available, we look for free-entry periods, lower-priced admission times, closures and reservation requirements."],
  ["Events", "We look at what's actually happening while you're there.", ["Football", "Concerts", "Festivals", "Sports", "Markets", "Seasonal events", "Nightlife"]],
  ["Food", "Restaurants, cafés, markets and local specialties that fit your interests and budget."],
  ["Logistics", "Airport transfers, travel times, check-in realities and how the trip actually connects."],
  ["Budget", "We keep the recommendations grounded in the budget you gave us."],
];

const SMART: [string, string][] = [
  ["CHEAPER MUSEUM DAY?", "We'll check current official admission information where available."],
  ["FREE ENTRY?", "If a relevant free-entry opportunity exists during your dates, we'll flag it."],
  ["FOOTBALL MATCH?", "If football is your thing, we'll research what's happening."],
  ["FESTIVAL?", "We'll look at events during your actual dates."],
  ["CHEAPER FLIGHT?", "We'll consider the price — and whether the schedule ruins half a vacation day."],
  ["BEAUTIFUL HOTEL?", "Great. But we'll also look at where it is."],
  ["FIVE CITIES IN SEVEN DAYS?", "Technically possible isn't always enjoyable."],
];

const TRIPS = [
  { p: "medNights", t: "Mediterranean Nights", r: "Barcelona → Ibiza → Nice", v: "NIGHTLIFE • BEACHES • FOOD" },
  { p: "dolceVita", t: "La Dolce Vita", r: "Rome → Florence → Amalfi Coast", v: "FOOD • CULTURE • ROMANCE" },
  { p: "alpine", t: "Alpine Escape", r: "Munich → Innsbruck → Dolomites → Venice", v: "MOUNTAINS • NATURE • ROAD TRIP" },
  { p: "iberian", t: "Iberian Summer", r: "Lisbon → Algarve → Seville", v: "BEACHES • FOOD • NIGHTLIFE • LOCAL LIFE" },
] as const;

export default async function Home() {
  const turnaround = await getSetting("turnaround_message", "[OWNER TO SET]");
  const faqs = faqItems(turnaround).filter((f) => ["what", "reservations", "markup", "49", "three-options", "150", "prices-change", "football", "no-idea", "turnaround"].includes(f.id));
  const jsonLd = {
    "@context": "https://schema.org", "@type": "ProfessionalService", name: "TRIPATROP",
    slogan: "We plan. You go.", areaServed: "US",
    description: "Personalized Europe trip planning service for travelers from the United States: custom Europe itineraries researched by a real person, with direct booking links.",
    offers: { "@type": "Offer", name: "Personal Trip Design", price: "199", priceCurrency: "USD" },
  };
  return (
    <>
      <TrackOnMount event="homepage_view" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="hero" aria-labelledby="hero-h">
        <div className="wrap">
          <div>
            <p className="eyebrow">PERSONAL EUROPEAN TRIP PLANNING</p>
            <h1 id="hero-h" className="d1">Your Europe.<br />Your way.</h1>
            <p className="lede"><strong>Tell us your budget, your vibe and what you want to experience. We&apos;ll research, organize and design your European trip around you.</strong></p>
            <div className="row">
              <BuildLink className="btn btn-primary btn-lg" from="hero" />
              <Link href="#how-it-works" className="btn btn-ghost btn-lg">HOW IT WORKS</Link>
            </div>
            <p className="trust">Human planning &nbsp;•&nbsp; Direct booking &nbsp;•&nbsp; No hidden booking markups</p>
          </div>
          <div className="postcards">
            {([["heroAlgarve", "Algarve", "PORTUGAL"], ["heroFlorence", "Florence", "ITALY"], ["heroAlps", "Dolomites", "ITALY"], ["heroFootball", "Match night", "ENGLAND"], ["heroTrain", "Rhine valley", "GERMANY"]] as const).map(([id, t, c], i) => (
              <figure className="pc" key={id}><Photo id={id} priority={i < 2} sizes="250px" /><figcaption>{t}<small>{c}</small></figcaption></figure>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section paper" aria-labelledby="prob-h">
        <div className="wrap">
          <h2 id="prob-h" className="d2">Europe is amazing.<br />Planning it isn&apos;t.</h2>
          <div className="browser">
            <div className="tabs" aria-hidden="true">{TABS.map((t, i) => <span key={t} className={`tab${i === 5 ? " on" : ""}`}>{t}</span>)}</div>
            <div className="tabcount"><span>37 tabs open</span><span>and counting</span></div>
            <ul className="questions">
              {["Which countries?", "Which cities?", "Which neighborhood?", "Which hotel?", "Train or flight?", "Which airport?", "Is the cheaper flight actually worth losing half a day?", "Is the museum cheaper on another day?", "Does it require reservations?", "Is there a football match while you're there?", "A festival?", "A concert?", "Are three countries realistic in seven days?"].map((q) => <li key={q}>{q}</li>)}
            </ul>
          </div>
          <p className="huge">Stop opening 37 tabs.</p>
          <p className="lede strong" style={{ marginTop: 20 }}>Tell us what you want. We&apos;ll do the homework.</p>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section" id="what-you-get" aria-labelledby="what-h">
        <div className="wrap split">
          <div className="sticky">
            <h2 id="what-h" className="d2">We don&apos;t just make itineraries. We do the homework.</h2>
            <p className="lede" style={{ marginTop: 24 }}>Tell us your vibe. We&apos;ll figure out the geography.</p>
            <BuildLink className="btn btn-primary" from="what_we_do" />
          </div>
          <div>
            <ul className="hw">
              {HOMEWORK.map(([h, p, tags]) => (
                <li key={h}><h3>{h}</h3><div><p>{p}</p>{tags && <div className="tags">{tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>}</div></li>
              ))}
            </ul>
            <p className="closing">The details are the trip.</p>
          </div>
        </div>
      </section>

      {/* SMART PLANNING */}
      <section className="section dark" aria-labelledby="smart-h">
        <div className="wrap">
          <h2 id="smart-h" className="d2">It&apos;s not just where.<br />It&apos;s when, how and whether it&apos;s worth it.</h2>
          <div className="ledger">{SMART.map(([h, p]) => <div key={h}><h3>{h}</h3><p>{p}</p></div>)}</div>
          <p className="closing">That&apos;s what planning means to us.</p>
          <p className="fine" style={{ marginTop: 16 }}>We don&apos;t control prices or offer special rates. Prices and availability we share are what we observed at the time of research and can change.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h" className="d2">How it works.</h2>
          <ol className="stages">
            <li className="stage">
              <div className="stage-num" aria-hidden="true">1</div>
              <div><h3>Tell us your Europe.</h3><p>Five minutes of questions: dates, budget, the landscapes you picture, your pace and what would make this trip unforgettable.</p><BuildLink className="link" from="how_step1">Start the questionnaire</BuildLink></div>
              <div><p className="fine">One question per screen. No account. No sales call.</p></div>
            </li>
            <li className="stage">
              <div className="stage-num" aria-hidden="true">2</div>
              <div>
                <span className="pill">$49 • FIND MY EUROPE</span>
                <h3>First, we find your trip.</h3>
                <p>A real person reviews your answers and researches your dates. You receive three personalized trip directions: concepts, not three complete itineraries.</p>
                <ul className="checks two"><li>Destinations &amp; order</li><li>Nights in each place</li><li>Why it fits you</li><li>Major experiences</li><li>Transport approach</li><li>Accommodation direction</li><li>Estimated budget range</li><li>Things to consider</li></ul>
              </div>
              <div className="concept" aria-label="Example trip direction">
                <div className="tagline">OPTION A</div>
                <h4>Mediterranean Nights</h4>
                <p style={{ lineHeight: 1.8 }}>Barcelona — 3 nights<br />Ibiza — 3 nights<br />Nice — 3 nights</p>
                <p className="muted" style={{ fontSize: ".95rem" }}><strong style={{ color: "var(--ink)" }}>Why you:</strong> You told us nightlife matters, you want beaches, you love food and you don&apos;t want to spend half the vacation inside museums.</p>
                <div className="meta"><span>Est. <strong>$2,800–$3,300/person</strong></span><span>NIGHTLIFE • BEACH • FOOD</span></div>
              </div>
            </li>
            <li className="stage">
              <div className="stage-num" aria-hidden="true">3</div>
              <div><h3>Choose your direction.</h3><p>Pick the one you love. One reasonable revision is included.</p><p className="d3" style={{ fontSize: "1.4rem" }}>&ldquo;We love Option B, but can we spend fewer nights in Paris and add Amsterdam?&rdquo;</p></div>
              <div><p className="fine">When the direction is agreed, we send you a secure link for the remaining balance.</p></div>
            </li>
            <li className="stage">
              <div className="stage-num" aria-hidden="true">4</div>
              <div>
                <span className="pill">$150 • BUILD MY EUROPE</span>
                <h3>Then we go deep.</h3>
                <p>Your complete plan, researched for your actual dates, with direct booking links.</p>
                <ul className="checks two"><li>Flights &amp; accommodations</li><li>Trains, ferries, cars &amp; transfers</li><li>Day-by-day itinerary</li><li>Attractions &amp; tickets</li><li>Events during your dates</li><li>Restaurants &amp; nightlife</li><li>Practical logistics</li><li>Estimated budget</li></ul>
              </div>
              <div><p className="fine">A cheaper flight isn&apos;t cheaper if it costs you a day in Europe. We factor that in.</p></div>
            </li>
          </ol>
          <p className="huge" style={{ borderTop: "1.5px solid var(--ink)", paddingTop: 40 }}>You go.</p>
        </div>
      </section>

      {/* DIRECT BOOKING */}
      <section className="section paper" aria-labelledby="book-h">
        <div className="wrap flow">
          <div>
            <h2 id="book-h" className="d2">We plan it.<br />You own it.</h2>
            <p className="lede" style={{ marginTop: 24 }}>Your planning fee pays TRIPATROP for research and trip design. Your vacation itself remains yours.</p>
            <p>When your final plan is ready, we provide direct booking links. You complete your reservations with the relevant providers.</p>
          </div>
          <div>
            <div className="flow-top"><Image src="/logo-wordmark.png" alt="tripatrop" width={900} height={198} style={{ height: 26, width: "auto" }} /><strong>Planning</strong></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="flow-grid">{["AIRLINE", "HOTEL", "TRAIN", "ACTIVITY"].map((x) => <div key={x}><b>{x}</b><span>Book directly</span></div>)}</div>
          </div>
        </div>
        <div className="wrap"><p className="closing" style={{ marginTop: 64 }}>One clear planning fee.<br />No TRIPATROP markup added to your direct travel purchases.</p></div>
      </section>

      {/* WHY A HUMAN */}
      <section className="section terra" aria-labelledby="ai-h">
        <div className="wrap">
          <h2 id="ai-h" className="d2" style={{ maxWidth: "16ch" }}>Can&apos;t AI just make me an itinerary?</h2>
          <div className="twocol">
            <div>
              <p className="lede">Absolutely — AI can give you ideas in seconds.</p>
              <p className="lede">TRIPATROP is for travelers who don&apos;t want to spend their vacation figuring out which of those ideas actually work.</p>
              <p className="lede">We personally research your real dates, route, budget and priorities. That can mean checking whether a train schedule makes sense, whether a hotel is in the right neighborhood, whether an attraction requires advance reservations, whether something interesting is happening while you&apos;re there, or whether squeezing another city into the trip is actually worth it.</p>
            </div>
            <p className="pull">AI can suggest Europe. We help organize yours.</p>
          </div>
        </div>
      </section>

      {/* EXAMPLES */}
      <section className="section" id="explore" aria-labelledby="exp-h">
        <div className="wrap">
          <h2 id="exp-h" className="d2">Same continent.<br />Different Europe.</h2>
          <div className="trips">
            {TRIPS.map((t) => (
              <figure className="trip" key={t.t}><Photo id={t.p} /><figcaption><h3>{t.t}</h3><p className="route">{t.r}</p><p className="vibes">{t.v}</p></figcaption></figure>
            ))}
          </div>
          <div className="endrow"><p>They&apos;re examples. Yours starts with you.</p><BuildLink className="btn btn-primary btn-lg" from="examples">BUILD MINE →</BuildLink></div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section paper" id="pricing" aria-labelledby="price-h">
        <div className="wrap"><h2 id="price-h" className="d2">Simple pricing.<br />Serious planning.</h2><PricingCard /></div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" aria-labelledby="faq-h">
        <div className="wrap narrow">
          <h2 id="faq-h" className="d2">Good questions.</h2>
          <Faq items={faqs} />
          <p style={{ marginTop: 28 }}><Link className="link" href="/faq">See all questions</Link></p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta" aria-labelledby="final-h">
        <div className="wrap">
          <h2 id="final-h" className="d2">Enough research.<br />Let&apos;s build your Europe.</h2>
          <p className="lede strong" style={{ margin: "24px auto 36px" }}>Five minutes of questions. Then we&apos;ll take it from there.</p>
          <BuildLink className="btn btn-primary btn-lg" from="final_cta" />
          <p className="muted" style={{ marginTop: 18 }}>Start with a $49 personalized trip design.</p>
        </div>
      </section>
    </>
  );
}
