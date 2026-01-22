import httpx
import asyncio
from supabase import create_client
import os

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
API_KEY = os.getenv("SPORTSDATA_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def hydrate_database():
    years = [2021, 2022, 2023, 2024, 2025, 2026]
    
    async with httpx.AsyncClient() as client:
        for year in years:
            print(f"--- Processing Year: {year} ---")
            
            # 1. Get Season Schedule
            schedule_url = f"https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/{year}?key={API_KEY}"
            schedule_res = await client.get(schedule_url)
            events = schedule_res.json()

            for event in events:
                event_id = event['EventId']
                
                # 2. Fetch Detailed Event Data
                detail_url = f"https://api.sportsdata.io/v3/mma/scores/json/Event/{event_id}?key={API_KEY}"
                detail_res = await client.get(detail_url)
                data = detail_res.json()

                # 3. Ensure Event exists in your existing table
                # (You mentioned you have some, but this ensures the historical ones are there too)
                supabase.table("events").upsert({
                    "event_id": data['EventId'],
                    "name": data['Name'],
                    "date_time": data['Day']
                }).execute()

                if not data.get('Fights'):
                    continue

                for fight in data['Fights']:
                    # 4. Upsert Fighters
                    for f in fight['Fighters']:
                        supabase.table("fighters").upsert({
                            "id": f['FighterId'],
                            "first_name": f['FirstName'],
                            "last_name": f['LastName']
                        }).execute()

                    # 5. Upsert Fight
                    # We use .upsert to handle cases where fight data updates (e.g. winner determined)
                    supabase.table("fights").upsert({
                        "id": fight['FightId'],
                        "event_id": event_id,
                        "fighter_a_id": fight['Fighters'][0]['FighterId'],
                        "fighter_b_id": fight['Fighters'][1]['FighterId'],
                        "winner_id": fight.get('WinnerId'),
                        "status": fight.get('Status'),
                        "method": fight.get('ResultType'),
                        "round": fight.get('ResultRound'),
                        "time": str(fight.get('ResultClock') or "0:00"),
                        "is_title_fight": "Title" in (fight.get('WeightClass') or ""),
                        "weight_class": fight.get('WeightClass')
                    }).execute()

                    # 6. Record Odds (Moneyline)
                    odds_data = []
                    for f in fight['Fighters']:
                        if f.get('Moneyline') is not None:
                            odds_data.append({
                                "fight_id": fight['FightId'],
                                "fighter_id": f['FighterId'],
                                "moneyline": f['Moneyline']
                            })
                    
                    if odds_data:
                        supabase.table("historical_odds").insert(odds_data).execute()

                print(f"Imported: {data['Name']}")
                await asyncio.sleep(0.5) # Respect Rate Limits

if __name__ == "__main__":
    asyncio.run(hydrate_database())