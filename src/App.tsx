import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  MapPin,
  ShieldCheck
} from "lucide-react";
import type { AnchorHTMLAttributes } from "react";
import { MapPanel } from "./components/MapPanel";
import { menlo, parke, portfolio } from "./data/portfolio";
import type { PropertyData, SaleComp } from "./data/types";

const money0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const money2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const number = new Intl.NumberFormat("en-US");

function Link({
  to,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  return <a href={to} {...props} />;
}

function SiteHeader({ printMode = false }: { printMode?: boolean }) {
  if (printMode) return null;
  return (
    <header className="site-header">
      <Link to="/" className="brand-slot" data-laaa-brand-slot="header" data-logo-variant="blue" data-brand-context="light">
        <img src="/assets/brand/LAAA_Team_Blue.png" alt="LAAA Team" />
      </Link>
      <nav aria-label="Main navigation">
        <Link to="/">Portfolio</Link>
        <Link to="/359-parke">359 Parke</Link>
        <Link to="/1623-menlo">1623 Menlo</Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <span className="brand-slot" data-laaa-brand-slot="footer" data-logo-variant="white" data-brand-context="dark">
          <img src="/assets/brand/LAAA_Team_White.png" alt="LAAA Team" loading="lazy" decoding="async" />
        </span>
        <div>
          <strong>Marcus &amp; Millichap</strong>
          <p>16830 Ventura Boulevard, Suite 100, Encino, California 91436</p>
        </div>
        <div className="footer-contact">
          <a href="tel:18182122808">Glen Scher · (818) 212 2808</a>
          <a href="tel:18182122748">Filip Niculete · (818) 212 2748</a>
        </div>
      </div>
    </footer>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p className="section-intro">{copy}</p>}
    </div>
  );
}

function Metric({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function PortfolioHub() {
  const allSubjectPoints = [parke.mapPoints[0], menlo.mapPoints[0]];
  return (
    <>
      <SiteHeader />
      <main>
        <section className="portfolio-hero dark-hero">
          <div className="portfolio-hero-images">
            <img src={parke.hero} alt="359 Parke Street" fetchPriority="high" />
            <img src={menlo.hero} alt="1623 Menlo Avenue" fetchPriority="high" />
          </div>
          <div className="hero-overlay" />
          <div className="container hero-content">
            <p className="eyebrow light">Portfolio Broker Opinion of Value</p>
            <h1>Two properties.<br />One coordinated sale strategy.</h1>
            <p className="hero-lead">
              Prepared for Tim Okay and Brio Real Estate by the LAAA Team of Marcus &amp; Millichap
            </p>
            <div className="hero-actions">
              <a className="button button-gold" href="#portfolio-analysis">
                Review the portfolio <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <section id="portfolio-analysis" className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Portfolio at a glance"
              title="A clear valuation for each asset, with one coordinated path to market"
              copy="The portfolio combines eighteen apartments across Pasadena and central Los Angeles. Each asset is valued on its own income and property specific comparable evidence."
            />
            <div className="metrics-grid four">
              <Metric label="Properties" value="2" />
              <Metric label="Apartments" value={String(portfolio.totalUnits)} />
              <Metric label="Current annual rent" value={money0.format(portfolio.totalCurrentRent)} />
              <Metric label="Normalized NOI" value={money0.format(portfolio.totalNoi)} />
            </div>
            <div className="property-cards">
              {portfolio.properties.map((property) => (
                <article className="property-card" key={property.slug}>
                  <img src={property.hero} alt={`${property.address} exterior`} loading="lazy" decoding="async" />
                  <div className="property-card-body">
                    <p className="eyebrow">{property.city}</p>
                    <h3>{property.address}</h3>
                    <p>{property.overview[0]}</p>
                    <div className="property-card-metrics">
                      <span><strong>{property.units}</strong> units</span>
                      <span><strong>{property.capRate.toFixed(2)}%</strong> current cap</span>
                      <span><strong>{property.grm.toFixed(2)}</strong> current GRM</span>
                    </div>
                    <Link className="text-link" to={`/${property.slug}`}>
                      View the complete property analysis <ChevronRight size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-stone">
          <div className="container split-layout">
            <div>
              <SectionHeading
                eyebrow="Portfolio geography"
                title="Distinct submarkets, separate evidence"
              />
              <p>
                Pasadena and central Los Angeles attract different buyer pools and carry distinct operating considerations.
                We keep the underwriting and comparable evidence separate so each value conclusion reflects its own market.
              </p>
              <div className="principle-list">
                <p><Check size={18} /> Pasadena sales and rent evidence are used only for 359 Parke.</p>
                <p><Check size={18} /> Los Angeles sales, active listings, and rent evidence are used only for 1623 Menlo.</p>
                <p><Check size={18} /> No portfolio premium or discount is assumed.</p>
              </div>
            </div>
            <MapPanel id="portfolio-subjects" title="Portfolio locations" points={allSubjectPoints} />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Recommended market approach"
              title="One launch, two tailored investment stories"
              copy="A coordinated presentation gives buyers a clear view of the portfolio while preserving the flexibility to sell either asset on its own."
            />
            <div className="strategy-grid">
              <article>
                <span>01</span>
                <h3>Prepare the evidence</h3>
                <p>Organize current leases, operating records, property access, and regulatory diligence before buyer outreach.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Launch in parallel</h3>
                <p>Present both assets together to the broadest qualified audience while maintaining complete standalone packages.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Measure every path</h3>
                <p>Compare portfolio and individual offers on price, certainty, timing, and execution risk.</p>
              </article>
              <article>
                <span>04</span>
                <h3>Create a competitive close</h3>
                <p>Use a defined offer process to concentrate attention and improve the seller's negotiating position.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="value-reveal portfolio-value">
          <div className="container">
            <p className="eyebrow light">Combined opinion of value</p>
            <div className="value-number">{money0.format(portfolio.combinedValue)}</div>
            <p>
              The combined figure is the sum of the independently supported $2.45M value for 359 Parke and
              $2.10M value for 1623 Menlo. No portfolio premium or discount is assumed.
            </p>
            <div className="value-links">
              <Link to="/359-parke">Review 359 Parke <ArrowRight size={18} /></Link>
              <Link to="/1623-menlo">Review 1623 Menlo <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>

        <ProofOfPerformance />
        <TeamSection />
      </main>
      <Footer />
    </>
  );
}

function PropertyHero({ property }: { property: PropertyData }) {
  return (
    <section className="property-hero dark-hero">
      <img className="property-hero-image" src={property.hero} alt={`${property.address} exterior`} fetchPriority="high" />
      <div className="hero-overlay" />
      <div className="container hero-content">
        <p className="eyebrow light">Broker Opinion of Value</p>
        <h1>{property.address}</h1>
        <p className="hero-city"><MapPin size={18} /> {property.city}</p>
        <p className="hero-lead">
          Prepared for Tim Okay and Brio Real Estate by the LAAA Team of Marcus &amp; Millichap
        </p>
        <a className="button button-gold" href="#investment-overview">
          Begin the analysis <ArrowRight size={18} />
        </a>
      </div>
      <div className="hero-facts">
        <span><strong>{property.units}</strong> Apartments</span>
        <span><strong>{property.yearBuilt}</strong> Year built</span>
        <span><strong>{number.format(property.buildingSquareFeet)}</strong> Building SF</span>
        <span><strong>{money0.format(property.currentMonthlyRent)}</strong> Monthly rent</span>
      </div>
    </section>
  );
}

function PropertyOverview({ property }: { property: PropertyData }) {
  return (
    <section id="investment-overview" className="section">
      <div className="container editorial-grid">
        <SectionHeading eyebrow="Investment overview" title={property.locationTitle} />
        <div className="prose-large">
          {property.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
      <div className="container highlights-grid">
        {property.highlights.map((highlight) => (
          <div className="highlight" key={highlight}>
            <Check size={18} />
            <p>{highlight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PropertyAndLocation({ property }: { property: PropertyData }) {
  const subjectPoint = property.mapPoints.filter((point) => point.kind === "subject");
  return (
    <>
      <section className="section section-stone">
        <div className="container">
          <SectionHeading
            eyebrow="Property and physical details"
            title={property.slug === "1623-menlo"
              ? "Eight apartments with a compact, later-vintage profile"
              : "Ten apartments near Pasadena's urban core"}
          />
          <div className="detail-grid">
            <Metric label="Apartments" value={String(property.units)} />
            <Metric label="Year built" value={String(property.yearBuilt)} />
            <Metric label="Building area" value={`${number.format(property.buildingSquareFeet)} SF`} />
            <Metric label="Lot area" value={`${number.format(property.lotSquareFeet)} SF`} />
            <Metric label="APN" value={property.apn} />
            <Metric label="Parking" value="On site" detail={property.parking} />
          </div>
          <div className="two-column-copy">
            {property.physicalNarrative.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="photo-grid">
            {property.gallery.map((photo) => (
              <img src={photo.src} alt={photo.alt} key={photo.src} loading="lazy" decoding="async" />
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split-layout location-layout">
          <div>
            <SectionHeading eyebrow="Location overview" title={property.city} />
            {property.locationNarrative.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <MapPanel id={`${property.slug}-subject`} title={`${property.address} location`} points={subjectPoint} />
        </div>
      </section>
    </>
  );
}

function RentRollAndUnderwriting({ property }: { property: PropertyData }) {
  const total = property.rentRoll.reduce((sum, line) => sum + line.monthlyRent, 0);
  const hasVerifiedConfigurations = property.rentRoll.some(
    (line) => line.configuration !== "Configuration to be verified"
  );
  return (
    <>
      <section className="section section-navy">
        <div className="container">
          <SectionHeading
            eyebrow="Current operations"
            title="Rent roll and unit profile"
            copy={property.unitMixNote}
          />
          <div className="table-wrap">
            <table>
              <thead><tr><th>Unit</th>{hasVerifiedConfigurations && <th>Configuration</th>}<th>Current monthly rent</th></tr></thead>
              <tbody>
                {property.rentRoll.map((line) => (
                  <tr key={line.unit}>
                    <td>{line.unit}</td>
                    {hasVerifiedConfigurations && <td>{line.configuration}</td>}
                    <td>{money0.format(line.monthlyRent)}</td>
                  </tr>
                ))}
                <tr className="total-row"><td colSpan={hasVerifiedConfigurations ? 2 : 1}>Total current monthly rent</td><td>{money0.format(total)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Normalized underwriting"
            title="A current income valuation"
            copy="The valuation uses the current rent roll, a 3% vacancy allowance, normalized operating expenses, management, reserves, and estimated property taxes at the central value."
          />
          <div className="underwriting-layout">
            <div className="table-wrap">
              <table className="underwriting-table">
                <tbody>
                  {property.underwriting.map((line) => (
                    <tr key={line.label} className={line.type}>
                      <td>{line.label}</td>
                      <td>{money2.format(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="income-metrics">
              <Metric label="Current annual rent" value={money0.format(property.currentGrossRent)} />
              <Metric label="Normalized NOI" value={money0.format(property.noi)} />
              <Metric label="Current cap at value" value={`${property.capRate.toFixed(2)}%`} />
              <Metric label="Current GRM at value" value={property.grm.toFixed(2)} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function RentComparables({ property }: { property: PropertyData }) {
  const pointIds = new Set(property.rentComps.map((comp) => comp.pointId));
  const points = property.mapPoints.filter((point) => point.kind === "subject" || pointIds.has(point.id));
  return (
    <section className="section section-stone">
      <div className="container">
        <SectionHeading
          eyebrow="Rent comparable analysis"
          title="Nearby asking rents indicate measured long term potential"
        />
        <div className="two-column-copy">
          {property.rentNarrative.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="rent-grid">
          {property.rentComps.map((comp) => (
            <article className="rent-card" key={`${comp.address}-${comp.unitType}`}>
              {comp.image && <img src={comp.image} alt={`${comp.address} property`} loading="lazy" decoding="async" />}
              <p className="eyebrow">{comp.unitType}</p>
              <h3>{comp.address}</h3>
              <strong>{money0.format(comp.rent)} <small>per month</small></strong>
              <p>{comp.squareFeet ? `${number.format(comp.squareFeet)} SF · ` : ""}{comp.distance.toFixed(2)} miles from subject</p>
            </article>
          ))}
        </div>
        <div className="sensitivity-note">
          <ShieldCheck size={26} />
          <div><strong>Market sensitivity</strong><p>{property.rentSensitivity}</p></div>
        </div>
        <MapPanel id={`${property.slug}-rent-comps`} title="Selected rent comparables" points={points} />
      </div>
    </section>
  );
}

function ComparableCard({ comp, property }: { comp: SaleComp; property: PropertyData }) {
  const point = property.mapPoints.find((candidate) => candidate.id === comp.pointId);
  const subject = property.mapPoints.find((candidate) => candidate.kind === "subject");
  const mapPoints = [subject, point].filter(Boolean) as PropertyData["mapPoints"];
  return (
    <article className="comp-detail" id={`comp-${comp.id}`}>
      <div className="comp-detail-image">
        <img src={comp.image} alt={`${comp.address} exterior`} loading="lazy" decoding="async" />
        <span className={`status ${comp.status.toLowerCase()}`}>{comp.status}</span>
      </div>
      <div className="comp-detail-content">
        <p className="eyebrow">{comp.date}</p>
        <h3>{comp.address}</h3>
        <p className="comp-summary">{comp.summary}</p>
        <div className="comp-metric-grid">
          <Metric label={comp.status === "Closed" ? "Sale price" : "Asking price"} value={money0.format(comp.price)} />
          <Metric label="Units" value={String(comp.units)} />
          <Metric label="Price per unit" value={money0.format(comp.pricePerUnit)} />
          <Metric label="Price per SF" value={money0.format(comp.pricePerSquareFoot)} />
          <Metric label="Year built" value={String(comp.yearBuilt)} />
          <Metric label="Marketing time" value={`${comp.daysOnMarket} days`} />
          {comp.capRate && <Metric label="Cap rate" value={`${comp.capRate.toFixed(2)}%`} />}
          {comp.grm && <Metric label="GRM" value={comp.grm.toFixed(2)} />}
        </div>
        <div className="comp-analysis">
          <div><strong>Why it matters</strong><p>{comp.relevance}</p></div>
          <div><strong>Comparison notes</strong><p>{comp.considerations}</p></div>
        </div>
      </div>
      {mapPoints.length > 1 && (
        <MapPanel
          id={`${property.slug}-${comp.id}`}
          title={`${comp.address} and subject`}
          points={mapPoints}
          compact
        />
      )}
    </article>
  );
}

function ComparableAnalysis({ property }: { property: PropertyData }) {
  const closedIds = new Set(property.saleComps.map((comp) => comp.pointId));
  const closedPoints = property.mapPoints.filter((point) => point.kind === "subject" || closedIds.has(point.id));
  const activeIds = new Set((property.activeComps ?? []).map((comp) => comp.pointId));
  const activePoints = property.mapPoints.filter((point) => point.kind === "subject" || activeIds.has(point.id));
  return (
    <>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Sold comparable overview"
            title="Property specific transaction evidence"
            copy={property.marketNarrative.join(" ")}
          />
          <div className="comp-summary-grid">
            {property.saleComps.map((comp) => (
              <a className="comp-summary-card" href={`#comp-${comp.id}`} key={comp.id}>
                <img src={comp.image} alt={`${comp.address} exterior`} loading="lazy" decoding="async" />
                <div>
                  <p>{comp.address}</p>
                  <strong>{money0.format(comp.price)}</strong>
                  <span>{money0.format(comp.pricePerUnit)} per unit</span>
                </div>
              </a>
            ))}
          </div>
          <MapPanel id={`${property.slug}-sale-comps`} title="Closed sale comparables" points={closedPoints} />
          {property.slug === "359-parke" && (
            <figure className="map-inset">
              <img src="/assets/maps/359-parke-earlham-inset.png" alt="Detailed Google map of the two Earlham Street sale comparables" loading="lazy" decoding="async" />
              <figcaption>Detailed view of the two Earlham Street sale locations</figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className="section section-stone comp-detail-section">
        <div className="container">
          <SectionHeading
            eyebrow="Comparable detail"
            title="The evidence behind the value conclusion"
          />
          {property.saleComps.map((comp) => <ComparableCard comp={comp} property={property} key={comp.id} />)}
        </div>
      </section>

      {property.activeComps && (
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Active competition"
              title="Current asking prices frame buyer alternatives"
              copy="Active listings are not closed evidence. They show what buyers can consider today and help define the subject's competitive position."
            />
            {property.activeComps.map((comp) => <ComparableCard comp={comp} property={property} key={comp.id} />)}
            <MapPanel id={`${property.slug}-active-comps`} title="Active competition" points={activePoints} />
          </div>
        </section>
      )}
    </>
  );
}

type MetricKey = "pricePerUnit" | "pricePerSquareFoot" | "capRate" | "grm";

function PositioningScale({
  property,
  metric,
  label,
  format
}: {
  property: PropertyData;
  metric: MetricKey;
  label: string;
  format: (value: number) => string;
}) {
  const comps = property.saleComps
    .map((comp) => ({ label: comp.address, value: comp[metric] }))
    .filter((item): item is { label: string; value: number } => typeof item.value === "number");
  const subjectValue = property[metric] as number;
  const values = [...comps.map((item) => item.value), subjectValue];
  const min = Math.min(...values) * 0.96;
  const max = Math.max(...values) * 1.04;
  const position = (value: number) => `${((value - min) / (max - min)) * 100}%`;
  return (
    <div className="position-scale">
      <div className="scale-heading"><h3>{label}</h3><strong>{format(subjectValue)}</strong></div>
      <div className="scale-track">
        {comps.map((item, index) => (
          <span
            className="scale-dot"
            key={item.label}
            style={{ left: position(item.value), top: `${index % 2 === 0 ? 8 : 29}px` }}
            title={`${item.label}: ${format(item.value)}`}
          />
        ))}
        <span className="scale-subject" style={{ left: position(subjectValue) }}>
          <i /> Subject
        </span>
      </div>
      <div className="scale-range"><span>{format(min)}</span><span>{format(max)}</span></div>
    </div>
  );
}

function PositioningAndValue({ property }: { property: PropertyData }) {
  return (
    <>
      <section className="section section-navy">
        <div className="container">
          <SectionHeading
            eyebrow="Four metric positioning"
            title="A balanced position across price and income"
            copy={property.positioningNarrative.join(" ")}
          />
          <div className="positioning-grid">
            <PositioningScale property={property} metric="pricePerUnit" label="Price per unit" format={(v) => money0.format(v)} />
            <PositioningScale property={property} metric="pricePerSquareFoot" label="Price per square foot" format={(v) => money0.format(v)} />
            <PositioningScale property={property} metric="capRate" label="Current cap rate" format={(v) => `${v.toFixed(2)}%`} />
            <PositioningScale property={property} metric="grm" label="Current GRM" format={(v) => v.toFixed(2)} />
          </div>
        </div>
      </section>
      <section className="section value-analysis">
        <div className="container editorial-grid">
          <SectionHeading eyebrow="Valuation conclusion" title="The value supported by the evidence" />
          <div className="prose-large">
            {property.valuationNarrative.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <div className="container">
          <div className="value-reveal property-value">
            <p className="eyebrow light">Central opinion of value</p>
            <div className="value-number">{money0.format(property.centralValue)}</div>
            <div className="value-metrics">
              <span><small>Likely trade range</small><strong>{property.valueRange}</strong></span>
              <span><small>Current cap rate</small><strong>{property.capRate.toFixed(2)}%</strong></span>
              <span><small>Current GRM</small><strong>{property.grm.toFixed(2)}</strong></span>
              <span><small>Price per unit</small><strong>{money0.format(property.pricePerUnit)}</strong></span>
              <span><small>Price per SF</small><strong>{money0.format(property.pricePerSquareFoot)}</strong></span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BuyerAndStrategy({ property }: { property: PropertyData }) {
  return (
    <section className="section section-stone">
      <div className="container">
        <SectionHeading
          eyebrow="Likely buyer profile"
          title="The capital most likely to respond"
        />
        <div className="buyer-grid">
          {property.buyerProfiles.map((profile) => (
            <article key={profile.title}><Building2 size={28} /><h3>{profile.title}</h3><p>{profile.copy}</p></article>
          ))}
        </div>
        <SectionHeading
          eyebrow="Transaction strategy"
          title="How we position the asset for the strongest result"
        />
        <div className="strategy-grid three">
          {property.strategy.map((item, index) => (
            <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.copy}</p></article>
          ))}
        </div>
      </div>
    </section>
  );
}

const marketingSteps = [
  { title: "Strategy and positioning", copy: "Set the pricing posture, buyer story, offer process, and diligence sequence before launch." },
  { title: "Institutional quality presentation", copy: "Create professional photography, maps, financial analysis, and complete digital and print materials." },
  { title: "Direct buyer activation", copy: "Reach private owners, exchange buyers, family offices, and active apartment investors through direct conversations." },
  { title: "Broad market exposure", copy: "Distribute through Marcus & Millichap channels, leading commercial platforms, and targeted digital outreach." },
  { title: "Weekly market feedback", copy: "Track inquiries, tours, underwriting questions, and buyer objections so strategy stays responsive." },
  { title: "Competitive offer process", copy: "Create a clear deadline, compare full economics, and negotiate price and terms together." },
  { title: "Contract to closing", copy: "Manage diligence, financing, title, escrow, and issue resolution through a disciplined close." }
];

const proofSales = {
  parke: [
    {
      address: "260 Linda Rosa Avenue, Pasadena",
      image: "/assets/laaa-proof/260-linda-rosa.jpg",
      facts: "7 units · Sold for $2.35M · December 2021",
      detail: "Same city apartment execution with a comparable unit count."
    },
    {
      address: "4123 Ocean View Boulevard, Montrose",
      image: "/assets/laaa-proof/4123-ocean-view.jpg",
      facts: "6 units · Sold for $1.685M · 8 days on market",
      detail: "Recent foothill market execution with a competitive marketing period."
    }
  ],
  menlo: [
    {
      address: "6860 Woodley Avenue, Van Nuys",
      image: "/assets/laaa-proof/6860-woodley.jpg",
      facts: "7 units · Sold for $1.715M · 13 days on market",
      detail: "Recent Los Angeles apartment execution with a similar unit count."
    },
    {
      address: "1010 South Bedford Street, Los Angeles",
      image: "/assets/laaa-proof/1010-bedford.jpg",
      facts: "12 units · Sold for $3.65M · May 2026",
      detail: "Recent central Los Angeles execution with a larger private capital profile."
    }
  ]
};

function ProofOfPerformance({ property }: { property?: PropertyData }) {
  const sales = property?.slug === "359-parke"
    ? proofSales.parke
    : property?.slug === "1623-menlo"
      ? proofSales.menlo
      : [proofSales.parke[0], proofSales.menlo[0]];
  return (
    <section className="section proof-section">
      <div className="container">
        <SectionHeading
          eyebrow="Selected LAAA results"
          title="Relevant execution, backed by a broader apartment track record"
          copy="The LAAA Team has completed 492 transactions representing more than $1.54 billion in aggregate closed sales volume, including 340 apartment transactions and 4,668 apartment units."
        />
        <div className="proof-grid">
          {sales.map((sale) => (
            <article key={sale.address}>
              <img src={sale.image} alt={`${sale.address} apartment property`} loading="lazy" decoding="async" />
              <div>
                <p className="eyebrow">LAAA closed sale</p>
                <h3>{sale.address}</h3>
                <strong>{sale.facts}</strong>
                <p>{sale.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="track-metrics">
          <Metric label="Closed transactions" value="492" />
          <Metric label="Aggregate volume" value="$1.54B+" />
          <Metric label="Apartment transactions" value="340" />
          <Metric label="Apartment units" value="4,668" />
        </div>
      </div>
    </section>
  );
}

function MarketingProcess() {
  return (
    <section className="section marketing-section">
      <div className="container">
        <SectionHeading
          eyebrow="How we sell your building"
          title="A disciplined process from strategy through closing"
          copy="Our work is designed to broaden qualified demand, make the asset easy to underwrite, and preserve negotiating leverage through every stage."
        />
        <div className="process-list">
          {marketingSteps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{step.title}</h3><p>{step.copy}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="section team-section">
      <div className="container">
        <SectionHeading
          eyebrow="The LAAA Team"
          title="Senior leadership on every assignment"
          copy="Glen Scher and Filip Niculete combine local apartment market specialization with the national reach of Marcus &amp; Millichap."
        />
        <div className="team-grid">
          <article>
            <img src="/assets/team/Glen_Scher.png" alt="Glen Scher" loading="lazy" decoding="async" />
            <div>
              <h3>Glen Scher</h3>
              <p>Senior Managing Director Investments<br />Co-Founder, LAAA Team</p>
              <a href="tel:18182122808">(818) 212 2808</a>
              <a href="mailto:Glen.Scher@marcusmillichap.com">Glen.Scher@marcusmillichap.com</a>
              <small>CA 01962976</small>
            </div>
          </article>
          <article>
            <img src="/assets/team/Filip_Niculete.png" alt="Filip Niculete" loading="lazy" decoding="async" />
            <div>
              <h3>Filip Niculete</h3>
              <p>Senior Managing Director Investments<br />Co-Founder, LAAA Team</p>
              <a href="tel:18182122748">(818) 212 2748</a>
              <a href="mailto:Filip.Niculete@marcusmillichap.com">Filip.Niculete@marcusmillichap.com</a>
              <small>CA 01905352</small>
            </div>
          </article>
        </div>
        <div className="team-proof">
          <div><strong>Apartment specialization</strong><p>Focused advice for Los Angeles area apartment owners.</p></div>
          <div><strong>Private capital access</strong><p>Direct relationships with local, regional, and exchange buyers.</p></div>
          <div><strong>Full transaction management</strong><p>Senior broker attention from valuation through closing.</p></div>
        </div>
      </div>
    </section>
  );
}

function NextStepsAndDisclosure({ property }: { property: PropertyData }) {
  return (
    <>
      <section className="section next-steps">
        <div className="container">
          <SectionHeading eyebrow="Next steps" title="Prepare the asset, then take the market's measure" />
          <div className="next-grid">
            <article><span>1</span><h3>Confirm the record</h3><p>Review leases, operating statements, permits, parking, and current physical condition.</p></article>
            <article><span>2</span><h3>Set the launch strategy</h3><p>Choose timing, pricing posture, access protocol, and offer process.</p></article>
            <article><span>3</span><h3>Activate the market</h3><p>Launch a complete package to qualified buyers and manage competition through closing.</p></article>
          </div>
        </div>
      </section>
      <section className="section disclosure-section">
        <div className="container">
          <h2>Basis and disclosures</h2>
          <ul>
            {property.disclosures.map((disclosure) => <li key={disclosure}>{disclosure}</li>)}
            <li>
              This broker opinion of value is not an appraisal, tax opinion, legal opinion, or guarantee of sale proceeds.
              Information has been obtained from sources believed reliable but is not guaranteed and remains subject to independent verification.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

function PropertyPage({ property, printMode = false }: { property: PropertyData; printMode?: boolean }) {
  return (
    <div className={printMode ? "print-property" : ""}>
      <PropertyHero property={property} />
      <PropertyOverview property={property} />
      <PropertyAndLocation property={property} />
      <RentRollAndUnderwriting property={property} />
      <RentComparables property={property} />
      <ComparableAnalysis property={property} />
      <PositioningAndValue property={property} />
      <BuyerAndStrategy property={property} />
      <MarketingProcess />
      <ProofOfPerformance property={property} />
      <TeamSection />
      <NextStepsAndDisclosure property={property} />
    </div>
  );
}

function StandaloneProperty({ property }: { property: PropertyData }) {
  return (
    <>
      <SiteHeader />
      <main><PropertyPage property={property} printMode /></main>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found container">
        <p className="eyebrow">Page not found</p>
        <h1>Return to the Brio portfolio</h1>
        <Link className="button button-navy" to="/">View portfolio <ArrowRight size={18} /></Link>
      </main>
      <Footer />
    </>
  );
}

export function AppShell() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/") return <PortfolioHub />;
  if (pathname === "/359-parke") return <StandaloneProperty property={parke} />;
  if (pathname === "/1623-menlo") return <StandaloneProperty property={menlo} />;
  return <NotFound />;
}
