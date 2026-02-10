
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './db/client';
import { historicalOdds } from './db/schema/historical-odds-schema';
import { count } from 'drizzle-orm';

async function main() {
    try {
        const res = await db.select({ value: count() }).from(historicalOdds);
        console.log(`Historical Odds Count: ${res[0].value}`);
    } catch (e) {
        console.error("DB Error:", e);
    }
    process.exit(0);
}

main();
