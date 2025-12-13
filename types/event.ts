export type EventData = {
    EventId: number;
    LeagueId: number;
    Name: string;
    ShortName: string;
    Season: number;
    Day: string;
    DateTime: string;
    Status: string;
    Active: boolean;
    Fights: Array<{
      FightId: number;
      Order: number;
      Status: string;
      WeightClass: string;
      CardSegment: string;
      Referee: string;
      Rounds: number;
      ResultClock: number;
      ResultRound: number;
      ResultType: string;
      WinnerId: number | null;
      Active: boolean;
      Fighters: Array<{
        FighterId: number;
        FirstName: string;
        LastName: string;
        PreFightWins: number;
        PreFightLosses: number;
        PreFightDraws: number;
        PreFightNoContests: number;
        Winner: boolean;
        Moneyline: number | null;
        Active: boolean;
      }>
    }>
  }
  