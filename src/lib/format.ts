// Íslenskt talnasnið án Intl – Intl gefur ólíkar niðurstöður á Node og í
// sumum vöfrum (hydration-misræmi). Þúsundir með punkti, tugabrot með kommu.

export function formatIs(n: number, maxFractionDigits = 0): string {
  if (!Number.isFinite(n)) return "–";
  const neg = n < 0;
  const abs = Math.abs(n);
  const fixed = abs.toFixed(maxFractionDigits);
  let [int, frac = ""] = fixed.split(".");
  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  frac = frac.replace(/0+$/, "");
  return (neg ? "−" : "") + int + (frac ? "," + frac : "");
}

/** Sama viðmót og Intl.NumberFormat – `fmt.format(n)` */
export const makeFormatter = (maxFractionDigits: number) => ({
  format: (n: number) => formatIs(n, maxFractionDigits),
});

/** Mánaðanöfn eins og þau eru skrifuð með dagsetningu. */
const MONTHS_IS = [
  "janúar", "febrúar", "mars", "apríl", "maí", "júní",
  "júlí", "ágúst", "september", "október", "nóvember", "desember",
];

/**
 * Dagsetning á íslensku án Intl: "25. ágúst 2026".
 * Intl.DateTimeFormat skilar enskum texta á Node-uppsetningum sem vantar
 * íslensk staðsetningargögn – þá skildi vefþjónn og vafri á um innihaldið.
 */
export function formatDateIs(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d}. ${MONTHS_IS[m - 1] ?? ""} ${y}`;
}
