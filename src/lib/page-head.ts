export function pageHead(title: string, description: string) {
  return { meta: [
    { title: `${title} — Código Violeta` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Código Violeta` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] };
}