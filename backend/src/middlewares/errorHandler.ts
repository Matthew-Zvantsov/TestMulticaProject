import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";

export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void {
	if (err instanceof AppError) {
		res.status(err.statusCode).json({
			error: err.message,
		});
		return;
	}

	// Handle malformed JSON body from express.json()
	if (
		"type" in err &&
		(err as { type: string }).type === "entity.parse.failed"
	) {
		res.status(400).json({
			error: "Invalid JSON payload.",
		});
		return;
	}

	console.error("Unhandled server error:", err);
	res.status(500).json({
		error: "Internal server error.",
	});
}
