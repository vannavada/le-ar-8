// Shared formatters for calculator display. All pure functions.

export function fmtCurrency(n: number, decimals = 0): string {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);
}

export function fmtPct(n: number, decimals = 2): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(decimals) + "%";
}

export function fmtYears(n: number): string {
  if (!isFinite(n) || n > 200) return "Never";
  if (n < 0) return "Already there";
  const y = Math.floor(n);
  const m = Math.round((n - y) * 12);
  if (m === 0 || m === 12) return `${m === 12 ? y + 1 : y} yr`;
  return `${y} yr ${m} mo`;
}

export function fmtNumber(n: number): string {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}
