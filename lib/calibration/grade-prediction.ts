import { americanToDecimal } from "@/lib/odds/utils";

type PredictionLog = {
  id: string;
  fightId: string | null;
  fighterId: string | null;
  betType: string;
  label: string;
  modelProb: number;
  oddsAmerican: number | null;
};

type Settlement = {
  id: string;
  fightId: string;
  winnerId: string | null;
  method: string | null;
  round: number | null;
  wentDistance: boolean | null;
  closingOddsA: number | null;
  closingOddsB: number | null;
};

type FightRecord = {
  fighterAId: string | null;
  fighterBId: string | null;
};

export function determineOutcome(
  prediction: PredictionLog,
  settlement: Settlement,
  _fight: FightRecord
): "win" | "loss" | "push" | "void" {
  const { betType, fighterId } = prediction;
  const { winnerId, method, wentDistance } = settlement;

  // No Contest or Draw
  if (!winnerId || method === "No Contest" || method === "Draw") {
    return "void";
  }

  switch (betType) {
    case "ML":
    case "Double Chance":
      return fighterId === winnerId ? "win" : "loss";

    case "ITD":
      // Inside The Distance = fight finished before going to decision
      if (wentDistance === false && fighterId === winnerId) return "win";
      return "loss";

    case "DGTD":
      // Doesn't Go The Distance = fight ends early (regardless of winner)
      return wentDistance === false ? "win" : "loss";

    case "GTD":
      // Goes The Distance = fight goes to decision
      return wentDistance === true ? "win" : "loss";

    case "Over":
      // Over rounds — simplified: went to decision typically means over hit
      return wentDistance === true ? "win" : "loss";

    case "Under":
      return wentDistance === false ? "win" : "loss";

    case "MOV": {
      // Method of Victory — check if the method matches the label
      const label = prediction.label.toLowerCase();
      const actualMethod = (method || "").toLowerCase();
      if (
        (label.includes("ko") && (actualMethod.includes("ko") || actualMethod.includes("tko"))) ||
        (label.includes("sub") && actualMethod.includes("sub")) ||
        (label.includes("dec") && actualMethod.includes("dec"))
      ) {
        return fighterId === winnerId ? "win" : "loss";
      }
      return "loss";
    }

    case "Round":
      // Round prop — check if the round matches
      if (settlement.round !== null) {
        const labelRound = parseInt(prediction.label.replace(/\D/g, ""), 10);
        if (!isNaN(labelRound) && labelRound === settlement.round) {
          return fighterId === winnerId ? "win" : "loss";
        }
      }
      return "loss";

    case "No Bet":
      return "void";

    default:
      return "void";
  }
}

export function computeClosingOdds(
  prediction: PredictionLog,
  settlement: Settlement,
  fight: FightRecord
): number | null {
  if (!prediction.fighterId) return null;

  // Determine if the predicted fighter is fighter A or B
  if (prediction.fighterId === fight.fighterAId) {
    return settlement.closingOddsA;
  } else if (prediction.fighterId === fight.fighterBId) {
    return settlement.closingOddsB;
  }
  return null;
}

export function computeProfitUnits(
  outcome: string,
  oddsAmerican: number | null
): number {
  if (outcome === "void" || outcome === "push" || !oddsAmerican) return 0;

  const decimal = americanToDecimal(oddsAmerican);
  if (outcome === "win") {
    return decimal - 1; // profit on 1 unit
  }
  return -1; // lost 1 unit
}
