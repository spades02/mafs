// lib/odds/utils.ts (or wherever you keep utilities)

export function oddsToProb(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

// lib/odds/utils.ts

export function americanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
}

export function formatOdds(odds: number | string, format: "american" | "decimal" | string): string {
  // Handle case where odds might be "No odds available" or similar string
  if (typeof odds === "string") {
    // If it contains a slash, it's likely a composite string like "-132 / +200".
    // We should try to format each part.
    if (odds.includes("/")) {
      return odds.split("/")
        .map(part => formatOdds(part.trim(), format))
        .join(" / ");
    }

    if (isNaN(parseInt(odds))) return odds;
  }

  const numericOdds = typeof odds === "string" ? parseInt(odds) : odds;

  if (isNaN(numericOdds) || numericOdds === 0) return "N/A";

  if (format === "decimal") {
    const decimal = americanToDecimal(numericOdds);
    return decimal.toFixed(2);
  }

  // American format
  return numericOdds > 0 ? `+${numericOdds}` : `${numericOdds}`;
}