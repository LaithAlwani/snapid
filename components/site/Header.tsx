import Image from "next/image";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#babies", label: "Babies" },
  { href: "#mobile", label: "Mobile" },
  { href: "#faq", label: "FAQ" },
  { href: "#corporate", label: "Corporate" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-[18px] py-2.5">
        <a href="#top" className="flex items-center">
          <Image
            src="/snapid-logo-mark.png"
            alt="SnapID — Passport &amp; ID Photos"
            width={170}
            height={46}
            priority
            className="h-[38px] w-auto sm:h-[46px]"
          />
        </a>
        <nav className="ml-auto hidden items-center gap-3 md:flex lg:gap-[22px]">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-[14px] font-medium text-heading hover:text-brand lg:text-[15px]"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href="#book"
          className="ml-auto whitespace-nowrap rounded-full bg-brand px-[18px] py-[11px] text-[15px] font-semibold text-white transition-colors hover:bg-navy md:ml-6"
        >
          Book now
        </a>
      </div>
    </header>
  );
}
