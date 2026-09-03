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
