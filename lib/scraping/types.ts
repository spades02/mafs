export interface UFCEvent {
  event: string;
  date: string;
  location: string;
  url: string;
  fights: UFCFight[];
}

export interface UFCFight {
  fight: string;
  fighter1: UFCFighter;
  fighter2: UFCFighter;
  eventName: string;
  date: string;
}

export interface UFCFighter {
  name: string;
}
  
  export interface ScrapingResult {
    scrapedAt: Date;
    source: string;
    events: {
      event: string;
      date: string;
      location: string;
      url: string;
      fights: UFCFight[];
    }[];
  }
  

export type FightItem = {
  id: string;               // stable id (boutUrl or slug)
  fight: string;            // "A vs B"
  fighter1: { name: string };
  fighter2: { name: string };
  boutUrl?: string | null;
  eventName?: string | null;
  date?: string | null;
};
