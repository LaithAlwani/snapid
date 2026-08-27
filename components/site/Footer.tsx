export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-deep text-on-navy-muted">
      <div className="mx-auto grid max-w-[1120px] gap-5 px-[18px] py-10">
        <div className="flex flex-wrap items-center gap-[18px]">
          <a href="#" className="font-semibold text-on-navy">
            Instagram
          </a>
          <a href="#" className="font-semibold text-on-navy">
            Facebook
          </a>
          <a href="#" className="font-semibold text-on-navy">
            Google reviews
          </a>
        </div>
        <p className="max-w-[60ch] text-[14.5px] leading-[1.6]">
          Serving Ottawa and surrounding communities: Riverside South, Barrhaven,
          Manotick, Findlay Creek, Greely, Kanata, Orléans, Nepean and Gatineau.
          Mobile service to 40 km; beyond that, contact us for a quote.
        </p>
        <p className="text-sm">
          © 2026 SnapID — Passport &amp; ID Photos. Prices plus HST.{" "}
          <a href="/admin" className="text-on-navy hover:text-accent-on-navy">
            Staff login
          </a>
        </p>
      </div>
    </footer>
  );
}
