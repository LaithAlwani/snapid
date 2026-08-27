const STEPS = [
  {
    n: "01",
    title: "Tell us the country",
    body: "Book online or ask the chat assistant. We look up the current spec for that country's passport, visa, PR or citizenship photo before you arrive.",
  },
  {
    n: "02",
    title: "We shoot and review",
    body: "Studio lighting, correct background, head height and eye line measured on the spot. You see the frame before we finish.",
  },
  {
    n: "03",
    title: "Prints, digital, or both",
    body: "Take home a printed set, get the digital file for an online application, or both. Digital files are emailed the same day.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1120px] px-[18px] py-16">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
        How it works
      </h2>
      <p className="mt-3 max-w-[24ch] font-heading text-[28px] font-bold leading-[1.2]">
        Fifteen minutes, start to finish.
      </p>
      <div className="mt-9 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-[14px] border border-hairline p-[22px]"
          >
            <div className="font-heading text-[13px] font-bold text-brand">
              {s.n}
            </div>
            <h3 className="mt-2.5 text-[19px] font-bold">{s.title}</h3>
            <p className="mt-2 text-[15.5px] leading-[1.5] text-muted">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
