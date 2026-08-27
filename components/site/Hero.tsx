import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-10 px-[18px] py-14 md:grid-cols-2 md:items-center md:py-[84px]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-[13px] py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-accent-on-navy">
            Ottawa · By appointment
          </div>
          <h1 className="mt-5 text-[40px] font-extrabold leading-[1.04] md:text-[56px]">
            Passport &amp; ID photos accepted the first time.
          </h1>
          <p className="mt-[18px] max-w-[46ch] text-lg leading-[1.55] text-on-navy">
            Every country, every document. We size and crop to the exact
            government spec — Canada, India, the US, the EU, China, the
            Philippines, Nigeria, anywhere. Home studio in Riverside South /
            Barrhaven, or we come to you.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#book"
              className="rounded-full bg-brand px-[26px] py-[15px] text-base font-semibold text-white transition-colors hover:bg-brand-bright"
            >
              Book an appointment
            </a>
            <a
              href="#pricing"
              className="rounded-full border border-white/30 px-[26px] py-[15px] text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              See pricing
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="border-l-2 border-brand-bright pl-2.5 text-sm font-semibold text-accent-on-navy">
              Compliance guaranteed
              <br />
              <span className="font-normal text-on-navy-muted">
                Free reshoot if rejected
              </span>
            </div>
            <div className="border-l-2 border-brand-bright pl-2.5 text-sm font-semibold text-accent-on-navy">
              Newborn specialists
              <br />
              <span className="font-normal text-on-navy-muted">
                Safe posing, done on-site
              </span>
            </div>
          </div>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-[18px] bg-deep">
          <PhotoPlaceholder label="Studio & sample ID photos" tone="dark" />
        </div>
      </div>
    </section>
  );
}
