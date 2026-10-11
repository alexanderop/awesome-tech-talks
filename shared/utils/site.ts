export const SITE = {
  url: "https://alexanderop.github.io/awesome-tech-talks",
  title: "Awesome Tech Talks",
  description:
    "A curated collection of software engineering conference talks and articles — summarized, tagged, and linked.",
  author: "Alexander Opalic",
  profile: "https://alexop.dev",
  ogImage: "/default-og.jpg",
  lang: "en",
  timezone: "Europe/Berlin",
  dir: "ltr" as const,
  // Set to the content value from Google Search Console to emit the
  // <meta name="google-site-verification"> tag. Leave empty to omit it.
  googleVerification: "" as string,
};

export const FEATURES = {
  lightAndDarkMode: true,
  showBackButton: true,
  search: true,
};

export interface SocialLink {
  name: string;
  url: string;
  linkTitle?: string;
}

export const SOCIALS: SocialLink[] = [
  { name: "github", url: "https://github.com/alexanderop" },
  { name: "x", url: "https://x.com/alexanderopalic" },
  { name: "linkedin", url: "https://www.linkedin.com/in/alexanderopalic/" },
];

export const HOME = {
  title: "Awesome Tech Talks",
  pitch: "Software engineering conference talks and articles worth your time. Each one has a short summary, key takeaways, tags and a link to the original, so you can decide what to watch or read before you start.",
};
