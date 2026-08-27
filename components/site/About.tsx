import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function About() {
  return (
    <section id="about" className="border-t border-hairline bg-surface">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-[34px] px-[18px] py-16 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
            About SnapID
          </h2>
          <p className="mt-3 max-w-[24ch] font-heading text-[28px] font-bold leading-[1.2]">
            A home studio in Ottawa, built around documents.
          </p>
          <p className="mt-4 max-w-[54ch] text-[16.5px] leading-[1.6] text-muted">
            SnapID is a small, Canadian-owned studio in Riverside South /
            Barrhaven. We only do identity photography, which means we know the
            requirements that trip people up: head height in millimetres, neutral
            expression, no glare, no shadow, the specific background grey some
            countries want instead of white.
          </p>
          <p className="mt-3.5 max-w-[54ch] text-[16.5px] leading-[1.6] text-muted">
            Appointments only, so you&apos;re never in a queue and a newborn
            session never gets rushed. Other languages spoken — ask when you
            book.
          </p>
        </div>
        <div className="relative min-h-[260px] overflow-hidden rounded-[18px] border border-hairline bg-white">
          <PhotoPlaceholder label="Studio or portrait photo" />
        </div>
      </div>
    </section>
  );
}
