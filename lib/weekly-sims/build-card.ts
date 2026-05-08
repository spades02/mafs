import {
  RISK_MODELS,
  RiskModel,
  Tier,
  classifyTier,
  kellyFraction,
  KELLY_FRACTION,
  DEFAULT_UNITS,
  variancMultiplierForWeightClass,
} from "./strategy";

export interface RecurringEdgeRow {
  id: string;
  fightId: string;
  betType: string;
  label: string;
  appearances: number;
  totalRuns: number;
  appearancePct: number;
  avgEdge: number;
  avgModelProb: number;
  latestMarketOdd: number | null;
  weightClass: string | null;
}

export interface CardLeg {
  edgeId: string;
  fightId: string;
  betType: string;
  label: string;
  tier: Tier;
  appearancePct: number;
  modelProb: number;
  americanOdds: number | null;
  edgePct: number;
  weightClass: string | null;
  /** Stake as fraction of bankroll. */
  stakeFraction: number;
  /** Recommended dollar stake when bankroll is provided. */
  stakeUsd: number | null;
  /** Equivalent units (1 unit = unitPctOfBankroll). */
  units: number;
  evPct: number;
  rationale: string;
}

export interface ParlayTicket {
  id: string;
  legs: CardLeg[];
  combinedDecimalOdds: number;
  /** Joint probability assuming independence (best-effort — correlation noted in strategy). */
  combinedProb: number;
  stakeFraction: number;
  stakeUsd: number | null;
  payoutUsd: number | null;
  evPct: number;
}

export interface BuiltCard {
  riskModel: RiskModel;
  bankrollUsd: number | null;
  straights: CardLeg[];
  parlays: ParlayTicket[];
  totalStakeFraction: number;
  totalStakeUsd: number | null;
  expectedReturnUsd: number | null;
  /** Weighted-average model probability across the card. */
  cardConfidence: number;
}

const americanToDecimal = (odds: number | null | undefined): number => {
  if (typeof odds !== "number" || !Number.isFinite(odds)) return 1;
  return odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
};

const isPropBet = (betType: string) =>
  betType !== "ML" && betType !== "DGTD" && betType !== "GTD";

function buildLeg(
  edge: RecurringEdgeRow,
  riskModel: RiskModel,
  bankrollUsd: number | null,
): CardLeg | null {
  const tier = classifyTier(edge.appearancePct);
  if (tier === "below") return null;

  const cfg = RISK_MODELS[riskModel];
  if (edge.appearancePct < cfg.minAppearance) return null;
  if (!cfg.allowProps && isPropBet(edge.betType) && edge.betType !== "Over" && edge.betType !== "Under") {
    return null;
  }
  // Long Shot: only plus-money dogs / asymmetric payoffs.
  if (
    cfg.minLegAmericanOdds != null &&
    (edge.latestMarketOdd == null || edge.latestMarketOdd < cfg.minLegAmericanOdds)
  ) {
    return null;
  }

  const fraction = KELLY_FRACTION[tier] || 0;
  const wcMult = variancMultiplierForWeightClass(edge.weightClass);

  const stakeFractionRaw = kellyFraction({
    modelProb: edge.avgModelProb,
    americanOdds: edge.latestMarketOdd,
    fraction,
  });
  const stakeFraction = stakeFractionRaw * wcMult * cfg.stakeMultiplier;
  if (stakeFraction <= 0) return null;

  const units = stakeFraction / cfg.unitPctOfBankroll;
  const stakeUsd = bankrollUsd != null ? Math.round(bankrollUsd * stakeFraction * 100) / 100 : null;

  const decimal = americanToDecimal(edge.latestMarketOdd);
  const evPct = (edge.avgModelProb * (decimal - 1) - (1 - edge.avgModelProb)) * 100;

  return {
    edgeId: edge.id,
    fightId: edge.fightId,
    betType: edge.betType,
    label: edge.label,
    tier,
    appearancePct: edge.appearancePct,
    modelProb: edge.avgModelProb,
    americanOdds: edge.latestMarketOdd,
    edgePct: edge.avgEdge,
    weightClass: edge.weightClass,
    stakeFraction,
    stakeUsd,
    units: Math.round(units * 10) / 10,
    evPct: Math.round(evPct * 10) / 10,
    rationale: `Tier ${tier === "elite" ? "1" : tier === "strong" ? "2" : "3"} (${Math.round(edge.appearancePct * 100)}% appearance) — ${cfg.label}`,
  };
}

/**
 * Build a card for a given risk model from raw recurring_edges rows.
 *
 * Steps:
 *  1. Filter and sort edges by appearance_pct.
 *  2. Generate straights respecting cfg.minAppearance + tier constraints.
 *  3. Optionally generate parlays from the top-N straights (no two legs from
 *     the same fight, HW legs require ≥85%, parlay min per leg 70%).
 *  4. Cap total exposure at cfg.maxCardExposure — scale stakes proportionally.
 *  5. Return the assembled BuiltCard.
 */
export function buildCard(
  edges: RecurringEdgeRow[],
  riskModel: RiskModel,
  bankrollUsd: number | null,
): BuiltCard {
  const cfg = RISK_MODELS[riskModel];
  const sorted = [...edges].sort((a, b) => b.appearancePct - a.appearancePct);

  // 1) straights — capped at cfg.maxStraights so each tier produces a card
  // of meaningfully different size, not just different stake amounts.
  const seenFightStraight = new Set<string>();
  const straights: CardLeg[] = [];
  for (const e of sorted) {
    if (straights.length >= cfg.maxStraights) break;
    if (seenFightStraight.has(e.fightId)) continue; // one straight per fight
    const leg = buildLeg(e, riskModel, bankrollUsd);
    if (!leg) continue;
    straights.push(leg);
    seenFightStraight.add(e.fightId);
  }

  // 2) parlays (only when allowed and we have enough qualifying legs)
  const parlays: ParlayTicket[] = [];
  if (cfg.allowParlays && straights.length >= 2) {
    const parlayPool = straights.filter((l) => {
      if (l.appearancePct < 0.7) return false;
      if (l.weightClass === "Heavyweight" && l.appearancePct < 0.85) return false;
      if (l.betType === "Round") return false; // round props ineligible
      return true;
    });

    const buildTicket = (legs: CardLeg[]): ParlayTicket => {
      const combinedDecimal = legs.reduce((acc, l) => acc * americanToDecimal(l.americanOdds), 1);
      const combinedProb = legs.reduce((acc, l) => acc * l.modelProb, 1);
      const stakeFraction =
        Math.min(...legs.map((l) => l.stakeFraction)) * 0.5; // half the smallest leg
      const stakeUsd = bankrollUsd != null ? Math.round(bankrollUsd * stakeFraction * 100) / 100 : null;
      const payoutUsd = stakeUsd != null ? Math.round(stakeUsd * combinedDecimal * 100) / 100 : null;
      const evPct = (combinedProb * (combinedDecimal - 1) - (1 - combinedProb)) * 100;
      return {
        id: legs.map((l) => l.edgeId).join("+"),
        legs,
        combinedDecimalOdds: Math.round(combinedDecimal * 100) / 100,
        combinedProb: Math.round(combinedProb * 1000) / 1000,
        stakeFraction,
        stakeUsd,
        payoutUsd,
        evPct: Math.round(evPct * 10) / 10,
      };
    };

    // 2-leg ticket: best two qualifiers
    if (parlayPool.length >= 2) {
      parlays.push(buildTicket(parlayPool.slice(0, 2)));
    }
    // 3-leg ticket: only when allowed and all three are elite (or aggressive+)
    if (cfg.maxParlayLegs >= 3 && parlayPool.length >= 3) {
      const eliteOnly = parlayPool.filter((l) => l.tier === "elite");
      const skipsEliteOnly =
        riskModel === "aggressive" || riskModel === "turbo" || riskModel === "longShot";
      if (skipsEliteOnly && parlayPool.length >= 3) {
        parlays.push(buildTicket(parlayPool.slice(0, 3)));
      } else if (eliteOnly.length >= 3) {
        parlays.push(buildTicket(eliteOnly.slice(0, 3)));
      }
    }
    // Lottery (4+) — aggressive/turbo/longShot only, sparingly
    if (cfg.allowLottery && parlayPool.length >= 4) {
      const lotteryLegs = Math.min(cfg.maxParlayLegs, parlayPool.length);
      parlays.push(buildTicket(parlayPool.slice(0, lotteryLegs)));
    }
  }

  // 3) Exposure cap — scale stakes if total > maxCardExposure
  const sumStakes =
    straights.reduce((s, l) => s + l.stakeFraction, 0) +
    parlays.reduce((s, p) => s + p.stakeFraction, 0);
  const cap = cfg.maxCardExposure;
  const scale = sumStakes > cap ? cap / sumStakes : 1;
  if (scale < 1) {
    for (const l of straights) {
      l.stakeFraction *= scale;
      if (l.stakeUsd != null && bankrollUsd != null) {
        l.stakeUsd = Math.round(bankrollUsd * l.stakeFraction * 100) / 100;
      }
      l.units = Math.round((l.stakeFraction / cfg.unitPctOfBankroll) * 10) / 10;
    }
    for (const p of parlays) {
      p.stakeFraction *= scale;
      if (bankrollUsd != null) {
        p.stakeUsd = Math.round(bankrollUsd * p.stakeFraction * 100) / 100;
        p.payoutUsd = Math.round(p.stakeUsd! * p.combinedDecimalOdds * 100) / 100;
      }
    }
  }

  const totalStakeFraction =
    straights.reduce((s, l) => s + l.stakeFraction, 0) +
    parlays.reduce((s, p) => s + p.stakeFraction, 0);
  const totalStakeUsd =
    bankrollUsd != null ? Math.round(bankrollUsd * totalStakeFraction * 100) / 100 : null;

  // Expected dollar return = sum(stake * (decimal-1) * p) − sum(stake * (1-p))
  let expectedReturnUsd: number | null = null;
  if (bankrollUsd != null) {
    let ev = 0;
    for (const l of straights) {
      const decimal = americanToDecimal(l.americanOdds);
      const stake = bankrollUsd * l.stakeFraction;
      ev += stake * (decimal - 1) * l.modelProb - stake * (1 - l.modelProb);
    }
    for (const p of parlays) {
      const stake = bankrollUsd * p.stakeFraction;
      ev += stake * (p.combinedDecimalOdds - 1) * p.combinedProb - stake * (1 - p.combinedProb);
    }
    expectedReturnUsd = Math.round(ev * 100) / 100;
  }

  // Card confidence — stake-weighted model probability, as a 0–100 number.
  let weightedSum = 0;
  let weight = 0;
  for (const l of straights) {
    weightedSum += l.modelProb * l.stakeFraction;
    weight += l.stakeFraction;
  }
  const cardConfidence = weight > 0 ? Math.round((weightedSum / weight) * 100) : 0;

  return {
    riskModel,
    bankrollUsd,
    straights,
    parlays,
    totalStakeFraction,
    totalStakeUsd,
    expectedReturnUsd,
    cardConfidence,
  };
}
