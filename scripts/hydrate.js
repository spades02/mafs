import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEY = process.env.SPORTSDATA_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function hydrateDatabase() {
    // Last 5 years + current
    const years = [2021, 2022, 2023, 2024, 2025, 2026];

    for (const year of years) {
        console.log(`\n--- Processing Year: ${year} ---`);

        try {
            // 1. Get Season Schedule
            const scheduleUrl = `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/${year}?key=${API_KEY}`;
            const { data: events } = await axios.get(scheduleUrl);

            for (const event of events) {
                const eventId = event.EventId;

                // 2. Fetch Detailed Event Data (to get Fights)
                const detailUrl = `https://api.sportsdata.io/v3/mma/scores/json/Event/${eventId}?key=${API_KEY}`;
                const { data: detail } = await axios.get(detailUrl);

                // 3. Update/Insert into your existing Events table
                await supabase.from('events').upsert({
                    event_id: detail.EventId,
                    name: detail.Name,
                    date_time: detail.Day
                });

                if (!detail.Fights || detail.Fights.length === 0) continue;

                for (const fight of detail.Fights) {
                    // 4. Upsert Fighters
                    for (const f of fight.Fighters) {
                        await supabase.from('fighters').upsert({
                            id: f.FighterId,
                            first_name: f.FirstName,
                            last_name: f.LastName
                        });
                    }

                    // 5. Prepare and Upsert the Fight record
                    const f1 = fight.Fighters[0].FighterId;
                    const f2 = fight.Fighters[1].FighterId;

                    await supabase.from('fights').upsert({
                        id: fight.FightId,
                        event_id: eventId,
                        fighter_a_id: f1,
                        fighter_b_id: f2,
                        winner_id: fight.WinnerId,
                        method: fight.ResultType,
                        round: fight.ResultRound,
                        time: String(fight.ResultClock || "0:00"),
                        is_title_fight: !!(fight.WeightClass && fight.WeightClass.includes("Title"))
                    });

                    // 6. Record Historical Odds (Moneyline)
                    const oddsData = fight.Fighters
                        .filter(f => f.Moneyline !== null)
                        .map(f => ({
                            fight_id: fight.FightId,
                            fighter_id: f.FighterId,
                            moneyline: f.Moneyline
                        }));

                    if (oddsData.length > 0) {
                        await supabase.from('historical_odds').insert(oddsData);
                    }
                }

                console.log(`Successfully Hydrated: ${detail.Name}`);

                // 7. Respect Rate Limits (500ms delay)
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error(`Error processing year ${year}:`, error.message);
        }
    }
    console.log("\nFull Hydration Complete.");
}

hydrateDatabase();