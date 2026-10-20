import { Pool, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config/env.js';

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};
