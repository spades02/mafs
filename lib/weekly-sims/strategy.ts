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

export type RiskModel = "conservative" | "balanced" | "aggressive" | "professional";

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
}

export const RISK_MODELS: Record<RiskModel, RiskModelConfig> = {
  conservative: {
    id: "conservative",
    label: "Safe Gameplan",
    description: "Tier 1 only. Straights and 2-leg all-elite parlays.",
    minAppearance: 0.8,
    maxCardExposure: 0.15,
    unitPctOfBankroll: 0.01,
    allowParlays: true,
    maxParlayLegs: 2,
    allowLottery: false,
    allowProps: false,
    targetWinRate: [0.68, 0.74],
    targetMonthlyRoi: [0.06, 0.12],
  },
  balanced: {
    id: "balanced",
    label: "Balanced Gameplan",
    description: "Tier 1+2 straights, mixed 2-leg parlays, light props.",
    minAppearance: 0.7,
    maxCardExposure: 0.22,
    unitPctOfBankroll: 0.01,
    allowParlays: true,
    maxParlayLegs: 3,
    allowLottery: false,
    allowProps: true,
    targetWinRate: [0.62, 0.68],
    targetMonthlyRoi: [0.14, 0.2],
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
    targetWinRate: [0.54, 0.62],
    targetMonthlyRoi: [0.22, 0.38],
  },
  professional: {
    id: "professional",
    label: "Pro Strategy",
    description: "Tier 1 only, strict Kelly, correlated parlays only.",
    minAppearance: 0.8,
    maxCardExposure: 0.25,
    unitPctOfBankroll: 0.01,
    allowParlays: true,
    maxParlayLegs: 2,
    allowLottery: false,
    allowProps: false,
    targetWinRate: [0.64, 0.7],
    targetMonthlyRoi: [0.16, 0.24],
  },
};
