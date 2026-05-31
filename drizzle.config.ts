import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: './src/models/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL?.toString() || '',
  },
  verbose: true,
  strict: true,
};

export default config;

