/**
 * Strategy doc translation — testable rules for risk-tier card building.
 * Sources: MAFS OPTIMAL BETTING STRATEGY (Sections 1–10).
 */

export type Tier = "elite" | "strong" | "medium" | "below";

/** Tier 1 (Elite): ≥80%, Tier 2 (Strong): 70–79%, Tier 3 (Medium): 60–69%. */
export function classifyTier(appearancePct: number): Tier {
  if (appearancePct >= 0.8) return "elite";
  if (appearancePct >= 0.7) return "strong";
  if (appearancePct >= 0.6) return "medium";
  return "below";
}

export type RiskModel = "conservative" | "balanced" | "aggressive" | "turbo" | "longShot";

export type ModelTone = "emerald" | "rose" | "amber";

export interface ModelBadge {
  label: string;
  tone: ModelTone;
}

/** Fractional Kelly per tier (strategy doc Section 4). */
export const KELLY_FRACTION: Record<Tier, number> = {
  elite: 1 / 4,
  strong: 1 / 6,
  medium: 1 / 10,
  below: 0,
};

/** Default unit allocation per tier — used as a sanity floor when Kelly returns near-zero. */
export const DEFAULT_UNITS: Record<Tier, number> = {
  elite: 3,
  strong: 2,
  medium: 1,
  below: 0,
};

/** Weight-class variance multipliers (Section 5). */
export const WEIGHT_CLASS_MULTIPLIER: Record<string, number> = {
  Heavyweight: 0.7,
  "Light Heavyweight": 0.8,
  Middleweight: 0.9,
  Welterweight: 1.0,
  Lightweight: 1.0,
  Featherweight: 1.0,
  Bantamweight: 1.0,
  Flyweight: 1.0,
  "Women's Strawweight": 0.9,
  "Women's Flyweight": 0.9,
  "Women's Bantamweight": 0.9,
  "Women's Featherweight": 0.9,
};

export function variancMultiplierForWeightClass(wc: string | null | undefined): number {
  if (!wc) return 1.0;
  return WEIGHT_CLASS_MULTIPLIER[wc] ?? 1.0;
}

/**
 * Convert American odds → decimal multiplier (b in Kelly = decimal − 1).
 * Returns 1 when odds are missing so Kelly degenerates safely to zero.
 */
export function americanToDecimal(odds: number | null | undefined): number {
  if (typeof odds !== "number" || !Number.isFinite(odds)) return 1;
  if (odds > 0) return 1 + odds / 100;
  return 1 + 100 / Math.abs(odds);
}

/**
 * Fractional Kelly stake as a fraction of bankroll (0..1).
 * f* = (bp − q) / b where b = decimal − 1, p = win prob, q = 1 − p.
 * Returns 0 when negative (no edge), capped to 0.15 (single-bet sanity cap).
 */
export function kellyFraction({
  modelProb,
  americanOdds,
  fraction,
}: {
  modelProb: number;
  americanOdds: number | null | undefined;
  fraction: number;
}): number {
  const b = americanToDecimal(americanOdds) - 1;
  if (b <= 0) return 0;
  const p = modelProb;
  const q = 1 - p;
  const f = (b * p - q) / b;
  if (f <= 0) return 0;
  return Math.min(0.15, f * fraction);
}

/** Per-risk-model card config. Drives builder + UI. */
export interface RiskModelConfig {
  id: RiskModel;
  label: string;
  description: string;
  /** Min appearance_pct for any straight included in this card. */
  minAppearance: number;
  /** Max % of bankroll the entire card can stake. */
  maxCardExposure: number;
  /** 1 unit as % of bankroll. Aggressive bumps to 1.5%. */
  unitPctOfBankroll: number;
  allowParlays: boolean;
  /** Max legs per parlay (excluding lottery). */
  maxParlayLegs: number;
  /** Allow lottery parlays (4+ legs). Aggressive only. */
  allowLottery: boolean;
  /** Allow standalone props in the card. */
  allowProps: boolean;
  /** Win-rate range, monthly ROI range — for the UI strategy header. */
  targetWinRate: [number, number];
  targetMonthlyRoi: [number, number];
  /** UI accent color for the strategy tab. */
  tone: ModelTone;
  /** Optional pill ("BEST", "EXTREME", "RARE") shown next to the label. */
  badge?: ModelBadge;
  /** Per-model multiplier on each leg's Kelly stake fraction. */
  stakeMultiplier: number;
  /** Max number of straights to include in this card. */
  maxStraights: number;
  /** Min American odds floor for individual legs (e.g. +200 → only plus-money dogs). */
  minLegAmericanOdds?: number;
}

export const RISK_MODELS: Record<RiskModel, RiskModelConfig> = {
  conservative: {
    id: "conservative",
    label: "Safe",
    description: "Tier 1 only. Straights and 2-leg all-elite parlays.",
    minAppearance: 0.8,
    maxCardExposure: 0.15,
    unitPctOfBankroll: 0.01,
    allowParlays: true,
    maxParlayLegs: 2,
    allowLottery: false,
    allowProps: false,
    targetWinRate: [0.74, 0.82],
    targetMonthlyRoi: [0.1, 0.15],
    tone: "emerald",
    stakeMultiplier: 0.6,
    maxStraights: 3,
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    description: "Tier 1+2 straights, mixed 2-leg parlays, light props.",
    minAppearance: 0.7,
    maxCardExposure: 0.22,
    unitPctOfBankroll: 0.01,
    allowParlays: true,
    maxParlayLegs: 3,
    allowLottery: false,
    allowProps: true,
    targetWinRate: [0.68, 0.76],
    targetMonthlyRoi: [0.2, 0.3],
    tone: "emerald",
    badge: { label: "BEST", tone: "emerald" },
    stakeMultiplier: 1.0,
    maxStraights: 5,
  },
  aggressive: {
    id: "aggressive",
    label: "High Upside",
    description: "All tiers, parlays, props, lottery tickets.",
    minAppearance: 0.6,
    maxCardExposure: 0.3,
    unitPctOfBankroll: 0.015,
    allowParlays: true,
    maxParlayLegs: 4,
    allowLottery: true,
    allowProps: true,
    targetWinRate: [0.6, 0.68],
    targetMonthlyRoi: [0.38, 0.5],
    tone: "emerald",
    stakeMultiplier: 1.3,
    maxStraights: 7,
  },
  turbo: {
    id: "turbo",
    label: "Turbo Max EV",
    description:
      "Maximum EV chase — accepts variance for outsized upside. Lottery parlays and props on every fight.",
    minAppearance: 0.55,
    maxCardExposure: 0.4,
    unitPctOfBankroll: 0.02,
    allowParlays: true,
    maxParlayLegs: 5,
    allowLottery: true,
    allowProps: true,
    targetWinRate: [0.48, 0.56],
    targetMonthlyRoi: [0.7, 0.9],
    tone: "rose",
    badge: { label: "EXTREME", tone: "rose" },
    stakeMultiplier: 1.8,
    maxStraights: 9,
  },
  longShot: {
    id: "longShot",
    label: "Long Shot",
    description: "Lottery-tier moonshots. Long parlays, plus-money dogs, asymmetric payoffs.",
    minAppearance: 0.5,
    maxCardExposure: 0.12,
    unitPctOfBankroll: 0.01,
    allowParlays: true,
    maxParlayLegs: 6,
    allowLottery: true,
    allowProps: true,
    targetWinRate: [0.34, 0.42],
    targetMonthlyRoi: [1.5, 2.5],
    tone: "amber",
    badge: { label: "RARE", tone: "amber" },
    stakeMultiplier: 0.4,
    maxStraights: 2,
    minLegAmericanOdds: 150,
  },
};
