const CARDS = [
  {
    title: "Families",
    body: "Four passports renewing at once, one travel fee. We set up in whatever room has space.",
  },
  {
    title: "Newborns at home",
    body: "Skip the car seat and the waiting room. Most popular booking in the first six weeks.",
  },
  {
    title: "Limited mobility & care homes",
    body: "Seated photos taken to spec, with the background and lighting brought in.",
  },
];

export function MobileService() {
  return (
    <section id="mobile" className="bg-deep text-white">
      <div className="mx-auto max-w-[1120px] px-[18px] py-16">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-accent-on-navy">
          Mobile service
        </h2>
        <p className="mt-3 max-w-[28ch] font-heading text-[28px] font-bold leading-[1.2]">
          We bring the studio to your kitchen table.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-[14px] border border-white/15 p-[22px]"
            >
              <h3 className="text-[18px] font-bold">{c.title}</h3>
              <p className="mt-2 text-[15.5px] leading-[1.55] text-on-deep">
                {c.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-[26px] text-[15.5px] text-on-deep">
          +$75 within 20 km · +$99 up to 40 km · further out,{" "}
          <a href="#contact" className="text-accent-on-navy">
            contact us
          </a>
          . Plus HST.
        </p>
      </div>
    </section>
  );
}
