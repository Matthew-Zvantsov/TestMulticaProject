import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
	port: parseInt(process.env.PORT || "3001", 10),
	databaseUrl:
		process.env.DATABASE_URL ||
		"postgres://postgres:postgres@localhost:5432/todos_db",
	nodeEnv: process.env.NODE_ENV || "development",
};
