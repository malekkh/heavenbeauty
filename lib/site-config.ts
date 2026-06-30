/**
 * Static brand content for the storefront chrome. Social links are
 * placeholders — update with the real Heaven Beauty profiles.
 */
export const SITE = {
  name: "Heaven Beauty",
  email: "service@jor.myheavenbeauty.com",
  instagram: "https://instagram.com/myheavenbeauty",
  facebook: "https://facebook.com/myheavenbeauty",
  tagline: "Where Tint Meets Radiance",
};

/** Marquee ticker rows on the home page (light refresh of the live strips). */
export const MARQUEE_ROWS: string[][] = [
  ["For a natural glow", "It's organic", "Cruelty free", "Vegan & conscious"],
  ["Effortless radiance", "Lightweight feel", "Self-love infused", "Made with intention"],
];

/** Footer navigation, grouped into columns (matches the live About/Shop/Care). */
export const FOOTER_COLUMNS = [
  {
    title: "About",
    links: [{ label: "Our Story", href: "/our-story" }],
  },
  {
    title: "Shop",
    links: [{ label: "Shop All", href: "/shop" }],
  },
  {
    title: "Care",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Returns & Cancellations", href: "/return-cancellations" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];
