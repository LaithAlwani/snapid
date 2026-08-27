// Central SEO/business config. Override the URL per environment with
// NEXT_PUBLIC_SITE_URL (e.g. the Vercel/production domain).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://snapid.ca"
).replace(/\/$/, "");

export const SITE_NAME = "SnapID — Passport & ID Photos";
export const SITE_TAGLINE = "Passport & ID photos accepted the first time";
export const SITE_DESCRIPTION =
  "Passport, visa, PR and citizenship photos for every country, sized and cropped to the exact government spec. Home studio in Riverside South / Barrhaven, Ottawa, or mobile service to you. Newborn specialists. Compliance guaranteed — free reshoot if rejected.";

export const BUSINESS_PHONE = "+1-613-000-0000";
export const BUSINESS_EMAIL = "hello@snapid.ca";

export const AREAS_SERVED = [
  "Riverside South",
  "Barrhaven",
  "Manotick",
  "Findlay Creek",
  "Greely",
  "Kanata",
  "Orléans",
  "Nepean",
  "Ottawa",
  "Gatineau",
];

// schema.org LocalBusiness node for rich results / local SEO.
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "PhotographyBusiness",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/snapid-logo.png`,
    logo: `${SITE_URL}/snapid-logo.png`,
    url: SITE_URL,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    priceRange: "$$",
    currenciesAccepted: "CAD",
    paymentAccepted: "Cash, e-Transfer",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ottawa",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    areaServed: AREAS_SERVED.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    knowsAbout: [
      "Passport photos",
      "Visa photos",
      "Citizenship photos",
      "PR card photos",
      "Newborn passport photos",
    ],
    sameAs: [] as string[], // add Instagram/Facebook/Google when live
  };
}
