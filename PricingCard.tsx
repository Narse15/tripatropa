import { BuildLink } from "./BuildLink";

export function PricingCard() {
  return (
    <div className="price-card">
      <div className="price-head">
        <div><div style={{ fontWeight: 700, letterSpacing: ".14em", fontSize: ".85rem" }}>PERSONAL TRIP DESIGN</div><div className="d3" style={{ fontSize: "2.4rem", marginTop: 4 }}>$199 total</div></div>
        <div className="muted">One service. Two steps. No packages to decode.</div>
      </div>
      <div className="price-col">
        <p className="eyebrow" style={{ marginBottom: 6 }}>STEP ONE</p>
        <div className="amt">$49</div>
        <h3 className="d3" style={{ marginTop: 6 }}>Find My Europe</h3>
        <ul className="checks">
          <li>Personal review</li><li>Initial research</li><li>Three trip directions</li><li>Estimated trip budget direction</li><li>One reasonable revision to selected direction</li>
        </ul>
        <BuildLink className="btn btn-primary btn-lg" from="pricing">START FOR $49 →</BuildLink>
      </div>
      <div className="price-col">
        <p className="eyebrow" style={{ marginBottom: 6 }}>STEP TWO</p>
        <div className="amt">$150</div>
        <h3 className="d3" style={{ marginTop: 6 }}>Build My Europe</h3>
        <p className="muted" style={{ marginTop: 8 }}>After selecting your preferred direction.</p>
        <ul className="checks two">
          <li>Complete itinerary</li><li>Flight recommendations</li><li>Accommodation recommendations</li><li>Transportation</li><li>Attractions</li><li>Ticket research</li><li>Relevant events</li><li>Food recommendations</li><li>Nightlife when relevant</li><li>Direct booking links</li><li>Budget overview</li><li>Final trip organization</li>
        </ul>
      </div>
      <div className="price-foot">
        <p className="fine" style={{ margin: 0 }}>Travel purchases are separate and are made directly by the traveler with third-party providers. Prices and availability can change between research and booking.</p>
      </div>
    </div>
  );
}
