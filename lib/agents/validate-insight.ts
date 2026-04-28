// Defensive net for AI-generated narrative copy. The prompt rules in
// `lib/agents/prompts.ts` and `app/ai/agents/agents.ts` push the model in the
// right direction, but it still leaks contradictions occasionally. These
// helpers run AFTER generation and flag / sanitize the worst offenders.

const FINISH_BET_TYPES = new Set(["ITD", "DGTD", "MOV", "Round"]);

// Words that contradict a "the fight ends early" thesis.
const FINISH_CONTRADICTIONS = [
  "durab",            // durability / durable
  "tough chin",
  "iron chin",
  "rarely finished",
  "goes the distance",
  "decision-prone",
  "decision prone",
  "prone to decisions",
];

// Words that contradict a "the fight goes the distance" thesis.
const GTD_CONTRADICTIONS = [
  "quick finish",
  "early ko",
  "early stoppage",
  "first-round",
  "first round finish",
  "wrap it up",
  "wraps it up",
];

const HEDGING_WORDS = ["could", "might", "possibly", "may", "perhaps", "potentially"];

const HEDGING_REPLACEMENTS: Record<string, string> = {
  could: "will likely",
  might: "should",
  possibly: "likely",
  may: "should",
  perhaps: "likely",
  potentially: "likely",
};

export function insightContradictsBetType(betType: string, summary: string): boolean {
  if (!summary) return false;
  const lower = summary.toLowerCase();
  if (FINISH_BET_TYPES.has(betType)) {
    return FINISH_CONTRADICTIONS.some((w) => lower.includes(w));
  }
  if (betType === "GTD") {
    return GTD_CONTRADICTIONS.some((w) => lower.includes(w));
  }
  return false;
}

export function isLegacyTemplate(summary: string): boolean {
  if (!summary) return false;
  const normalized = summary.toLowerCase().replace(/[—–-]+/g, " ").replace(/\s+/g, " ").trim();
  // The famous repeating line and very-near-duplicates.
  const banned = [
    "both fighters have shown durability not a quick finish",
    "both fighters have shown durability not a quick finish.",
    "both fighters have shown durability",
  ];
  return banned.some((b) => normalized.includes(b));
}

export function stripHedgingForHighConfidence(summary: string, confidencePct: number): string {
  if (!summary) return summary;
  if (confidencePct < 70) return summary;
  let out = summary;
  for (const word of HEDGING_WORDS) {
    const replacement = HEDGING_REPLACEMENTS[word] ?? "";
    // Match whole word, case-insensitive, preserve original capitalization on the first letter.
    out = out.replace(new RegExp(`\\b${word}\\b`, "gi"), (match) => {
      if (!replacement) return match;
      const isCap = match[0] === match[0].toUpperCase();
      return isCap ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
    });
  }
  return out;
}

// Tag/append fight-specific text to break duplicates without re-calling the LLM.
export function deduplicateSummary(
  summary: string,
  used: Set<string>,
  betLabel: string,
): string {
  if (!summary) return summary;
  const key = summary.trim().toLowerCase();
  if (!used.has(key)) {
    used.add(key);
    return summary;
  }
  // Append a fight-specific tail. Prefer the bet label since it's always known.
  const trimmed = summary.replace(/[.\s]+$/, "");
  const augmented = `${trimmed} — angle: ${betLabel}.`;
  used.add(augmented.trim().toLowerCase());
  return augmented;
}
