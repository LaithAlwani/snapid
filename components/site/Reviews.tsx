import { REVIEWS } from "@/lib/site-data";

export function Reviews() {
  return (
    <section className="mx-auto max-w-[1120px] px-[18px] py-16">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
          Reviews
        </h2>
        <span className="rounded-full border border-dashed border-slate-300 px-2.5 py-[3px] text-[12.5px] text-slate-400">
          Placeholder — swap for real reviews
        </span>
      </div>
      <div className="mt-[26px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <div
            key={i}
            className="rounded-[14px] border border-hairline bg-white p-[22px]"
          >
            <p className="text-[16.5px] leading-[1.55] text-heading">
              {r.quote}
            </p>
            <div className="mt-3.5 text-sm font-semibold text-muted">
              {r.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
