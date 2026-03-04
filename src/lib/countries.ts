export const COUNTRIES: { name: string; code: string }[] = [
  { name: "Israel", code: "il" },
  { name: "United States", code: "us" },
  { name: "United Kingdom", code: "gb" },
  { name: "Germany", code: "de" },
  { name: "France", code: "fr" },
  { name: "Canada", code: "ca" },
  { name: "Australia", code: "au" },
  { name: "Japan", code: "jp" },
  { name: "China", code: "cn" },
  { name: "India", code: "in" },
  { name: "Brazil", code: "br" },
  { name: "Italy", code: "it" },
  { name: "Spain", code: "es" },
  { name: "Netherlands", code: "nl" },
  { name: "Sweden", code: "se" },
  { name: "Switzerland", code: "ch" },
  { name: "South Korea", code: "kr" },
  { name: "Singapore", code: "sg" },
  { name: "Mexico", code: "mx" },
  { name: "Argentina", code: "ar" },
];

export const getCountryCode = (name: string): string | undefined =>
  COUNTRIES.find((c) => c.name === name)?.code;
