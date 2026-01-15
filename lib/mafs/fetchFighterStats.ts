// lib/mafs/fetchFighterStats.ts
export interface MafsFighterInput {
  id: number;
  name: string;
  nickname: string;
  weightClass: string;
  height: number;
  reach: number;
  strikingPerMinute: number;
  strikingAccuracy: number;
  takedownAverage: number;
  submissionAverage: number;
  knockoutPct: number;
  tkoPct: number;
  decisionPct: number;
  wins: number;
  losses: number;
  titleWins: number;
  titleLosses: number;
}

export interface EventFighter {
  id: number;
  name: string;
}

export interface MafsEventInput {
  fighters: MafsFighterInput[];
}

/**
 * Fetches a single fighter profile from SportsData.io and normalizes it for MAFS
 * Includes retry logic for transient server errors
 */
async function fetchFighterProfile(fighterId: number, retries = 3): Promise<MafsFighterInput> {
  const apiKey = process.env.SPORTS_DATA_API_KEY!;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${fighterId}?key=${apiKey}`,
        {
          headers: {
            'User-Agent': 'MAFS-Analysis/1.0',
            'Accept': 'application/json',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();

        const career = data.CareerStats || {};

        return {
          id: data.FighterId,
          name: `${data.FirstName} ${data.LastName}`,
          nickname: data.Nickname || "",
          weightClass: data.WeightClass || "",
          height: data.Height || 0,
          reach: data.Reach || 0,
          strikingPerMinute: career.SigStrikesLandedPerMinute || 0,
          strikingAccuracy: career.SigStrikeAccuracy || 0,
          takedownAverage: career.TakedownAverage || 0,
          submissionAverage: career.SubmissionAverage || 0,
          knockoutPct: career.KnockoutPercentage || 0,
          tkoPct: career.TechnicalKnockoutPercentage || 0,
          decisionPct: career.DecisionPercentage || 0,
          wins: data.Wins || 0,
          losses: data.Losses || 0,
          titleWins: data.TitleWins || 0,
          titleLosses: data.TitleLosses || 0,
        };
      }

      // Retry on 5xx server errors
      if (res.status >= 500 && attempt < retries) {
        console.warn(`Fighter ${fighterId}: 500 error, retrying (${attempt}/${retries})...`);
        await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
        continue;
      }

      console.warn(`Failed to fetch fighter ${fighterId}: ${res.status} ${res.statusText}`);
    } catch (err: any) {
      if (attempt < retries) {
        console.warn(`Fighter ${fighterId}: Network error, retrying (${attempt}/${retries})...`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      console.warn(`Failed to fetch fighter ${fighterId}: ${err.message}`);
    }
  }

  // Return fallback after all retries exhausted
  return {
    id: fighterId,
    name: "Unknown Fighter",
    nickname: "",
    weightClass: "",
    height: 0,
    reach: 0,
    strikingPerMinute: 0,
    strikingAccuracy: 0,
    takedownAverage: 0,
    submissionAverage: 0,
    knockoutPct: 0,
    tkoPct: 0,
    decisionPct: 0,
    wins: 0,
    losses: 0,
    titleWins: 0,
    titleLosses: 0,
  };
}


/**
 * Takes an array of EventFighters (with fighter IDs) and returns MAFS-ready structure
 */
export async function buildMafsEventInput(fighters: EventFighter[]): Promise<MafsEventInput> {
  const fighterProfiles = await Promise.all(
    fighters.map(f => fetchFighterProfile(f.id))
  );

  return { fighters: fighterProfiles };
}
