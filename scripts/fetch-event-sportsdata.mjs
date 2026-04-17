import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8") + "\n" + fs.readFileSync(".env", "utf8");
const apiKey = env.match(/SPORTS_DATA_API_KEY=['"]?([^'"\n]+)/)[1];

// Find the event first
const sched = await fetch(
  `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/2026?key=${apiKey}`
).then(r => r.json());

const match = sched.find(e => /Burns.*Malott/i.test(e.Name));
console.log("Schedule match:", match?.EventId, match?.Name);

if (!match) process.exit(1);

// Fetch full event
const full = await fetch(
  `https://api.sportsdata.io/v3/mma/scores/json/Event/${match.EventId}?key=${apiKey}`
).then(r => r.json());

console.log("\nFull event name:", full.Name);
console.log("Fights count:", full.Fights?.length);
console.log("\nFight list:");
for (const f of full.Fights || []) {
  const fighters = (f.Fighters || []).map(x => ({
    FighterId: x.FighterId,
    Name: `${x.FirstName ?? ""} ${x.LastName ?? ""}`.trim(),
  }));
  console.log(`  FightId=${f.FightId}`, fighters);
}
