import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { createTodoRouter } from "./routes/todo.routes.js";
import type { TodoService } from "./services/todo.service.js";

export function createApp(service?: TodoService): Express {
	const app = express();

	app.use(cors());
	app.use(express.json());

	// Healthcheck endpoint
	app.get("/health", (_req: Request, res: Response) => {
		res.status(200).json({ status: "ok" });
	});

	// REST API routes for todos
	app.use("/api/todos", createTodoRouter(service));

	// 404 handler for unknown endpoints
	app.use((_req: Request, res: Response) => {
		res.status(404).json({ error: "Endpoint not found." });
	});

	// Centralized error handling middleware
	app.use(errorHandler);

	return app;
}

export const app = createApp();
