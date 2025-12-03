import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const migrationClient = postgres(process.env.DATABASE_URL!, {
    max: 1,
  });

  const db = drizzle({
    client: migrationClient,
  });

  console.log('⏳ Running migrations...');

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('✅ Migrations completed');

  await migrationClient.end();
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
