export const siteConfig = {
  name: "Acme Enterprise",
  shortName: "Acme",
  description:
    "Enterprise-grade platform for modern teams — ship faster, scale smarter.",
  url: "https://acme.example.com",
  ogImage: "https://acme.example.com/og-default.png",
  creator: "Acme Inc.",
  authors: [{ name: "Acme Inc.", url: "https://acme.example.com" }] as {
    name: string;
    url: string;
  }[],
  keywords: [
    "enterprise",
    "saas",
    "platform",
    "nextjs",
    "react",
    "typescript",
  ] as string[],
  links: {
    twitter: "https://twitter.com/acme",
    github: "https://github.com/acme",
    docs: "https://docs.acme.example.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
