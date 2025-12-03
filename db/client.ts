import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Validate environment variable
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Connection pooling configuration
const connectionString = process.env.DATABASE_URL;

// For query purposes (recommended for serverless)
const queryClient = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance with schema
export const db = drizzle({
  client: queryClient,
  schema,
});

// Type exports for convenience
export type Database = typeof db;