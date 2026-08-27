import { PRICE_ROWS } from "@/lib/site-data";

const INCLUDED = [
  "Sized and cropped to your country's spec",
  "Compliance guaranteed — free reshoot if a photo is rejected",
  "Newborn posing handled safely on-site",
  "Same-day appointments when available",
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="border-y border-hairline bg-surface"
    >
      <div className="mx-auto max-w-[1120px] px-[18px] py-16">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
          Pricing
        </h2>
        <p className="mt-3 font-heading text-[28px] font-bold leading-[1.2]">
          Priced by age. All prices plus HST.
        </p>

        <div className="mt-[30px] overflow-hidden rounded-2xl border border-hairline bg-white">
          <div className="grid grid-cols-[1fr_auto] gap-3.5 border-b border-hairline bg-surface-2 px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted">
            <div>Who</div>
            <div>Printed set</div>
          </div>
          {PRICE_ROWS.map((row) => (
            <div
              key={row.who}
              className="grid grid-cols-[1fr_auto] items-baseline gap-3.5 border-b border-hairline-soft px-5 py-[18px]"
            >
              <div>
                <div className="font-heading text-[18px] font-bold">
                  {row.who}
                </div>
                <div className="mt-0.5 text-[14.5px] text-muted">{row.note}</div>
              </div>
              <div className="whitespace-nowrap font-heading text-[22px] font-extrabold">
                {row.price}
              </div>
            </div>
          ))}
          <div className="grid gap-2.5 p-5">
            <div className="font-heading text-[15px] font-bold">
              Digital copies
            </div>
            <p className="text-[15.5px] leading-[1.55] text-muted">
              Digital copies are $5 less than the physical — an adult printed set
              is $19.99, digital only is $14.99; a baby set is $35.99, digital
              only is $29.99. If you&apos;re adding a digital copy on top of any
              physical image, it&apos;s only $10 extra.
            </p>
          </div>
        </div>

        <div className="mt-[22px] grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <div className="rounded-2xl bg-navy p-6 text-white">
            <div className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-accent-on-navy">
              We come to you
            </div>
            <div className="mt-4 grid gap-3">
              <div className="flex items-baseline justify-between gap-3 border-b border-white/15 pb-2.5">
                <span className="text-base text-on-navy">Within 20 km</span>
                <span className="font-heading text-[20px] font-extrabold">
                  +$75
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-white/15 pb-2.5">
                <span className="text-base text-on-navy">20–40 km</span>
                <span className="font-heading text-[20px] font-extrabold">
                  +$99
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base text-on-navy">Beyond 40 km</span>
                <a
                  href="#contact"
                  className="font-heading text-[15px] font-bold text-accent-on-navy"
                >
                  Contact us
                </a>
              </div>
            </div>
            <p className="mt-4 text-sm leading-[1.5] text-on-navy-muted">
              Travel fee is added once per visit, not per person. Measured from
              Riverside South.
            </p>
          </div>
          <div className="rounded-2xl border border-hairline bg-white p-6">
            <div className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-brand">
              Included with every sitting
            </div>
            <div className="mt-4 grid gap-[11px]">
              {INCLUDED.map((line) => (
                <div
                  key={line}
                  className="text-[15.5px] leading-[1.45] text-heading"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
