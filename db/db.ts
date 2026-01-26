import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, {
  ssl: "require", // required for Supabase cloud
});

import * as schema from "./schema";

export const db = drizzle(client, { schema });
