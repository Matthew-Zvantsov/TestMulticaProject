import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { config } from "../config/env.js";

let poolInstance: Pool | null = null;

export const getPool = (): Pool => {
	if (!poolInstance) {
		poolInstance = new Pool({
			connectionString: config.databaseUrl,
		});
		poolInstance.on("error", (err: Error) => {
			console.error("Unexpected error on idle PostgreSQL client", err);
		});
	}
	return poolInstance;
};

export const pool = new Proxy({} as Pool, {
	get(_target, prop) {
		const p = getPool();
		const value = (p as unknown as Record<string | symbol, unknown>)[prop];
		if (typeof value === "function") {
			return value.bind(p);
		}
		return value;
	},
});

export const query = async <T extends QueryResultRow = QueryResultRow>(
	text: string,
	params?: unknown[],
): Promise<QueryResult<T>> => {
	return getPool().query<T>(text, params);
};

export const closePool = async (): Promise<void> => {
	if (poolInstance) {
		await poolInstance.end();
		poolInstance = null;
	}
};
