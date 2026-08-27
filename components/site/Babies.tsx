import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function Babies() {
  return (
    <section id="babies" className="mx-auto max-w-[1120px] px-[18px] py-16">
      <div className="grid grid-cols-1 gap-[34px] md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
            Baby &amp; newborn
          </h2>
          <p className="mt-3 max-w-[22ch] font-heading text-[28px] font-bold leading-[1.2]">
            The hardest photo to get right. It&apos;s what we do most.
          </p>
          <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.6] text-muted">
            Eyes open, mouth closed, no shadow behind the head, no hands in frame
            — on a subject who did not agree to any of this. We shoot newborns on
            a flat white surface with the parent&apos;s hands out of frame, and
            we keep going until we have a frame that passes. Each baby is booked
            for a 30-minute session, so there&apos;s room to settle — bring a
            bottle.
          </p>
          <div className="mt-[22px] grid gap-2.5">
            <div className="text-[15.5px] text-heading">
              Under 1 year — $35.99 printed, $29.99 digital only
            </div>
            <div className="text-[15.5px] text-heading">
              Toddlers 1+ — $29.99 printed, $24.99 digital only
            </div>
            <div className="text-[15.5px] text-heading">
              Each baby is booked for a 30-minute session — add another if you
              need more time.
            </div>
          </div>
        </div>
        <div className="relative min-h-[280px] overflow-hidden rounded-[18px] border border-hairline bg-surface">
          <PhotoPlaceholder label="Newborn / baby sample photo" />
        </div>
      </div>
    </section>
  );
}
