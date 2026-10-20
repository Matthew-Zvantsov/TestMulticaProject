import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, todoApi } from "../todoApi";

describe("todoApi service", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("fetches todos with GET /api/todos", async () => {
		const mockList = [{ id: "1", title: "Task", completed: false }];
		vi.mocked(globalThis.fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockList,
		} as Response);

		const result = await todoApi.getTodos();

		expect(globalThis.fetch).toHaveBeenCalledWith("/api/todos", {
			headers: { Accept: "application/json" },
		});
		expect(result).toEqual(mockList);
	});

	it("creates a todo with POST /api/todos", async () => {
		const mockCreated = { id: "2", title: "New Task", completed: false };
		vi.mocked(globalThis.fetch).mockResolvedValueOnce({
			ok: true,
			status: 201,
			json: async () => mockCreated,
		} as Response);

		const result = await todoApi.createTodo({ title: "New Task" });

		expect(globalThis.fetch).toHaveBeenCalledWith("/api/todos", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ title: "New Task" }),
		});
		expect(result).toEqual(mockCreated);
	});

	it("updates a todo with PATCH /api/todos/:id", async () => {
		const mockUpdated = { id: "1", title: "Task", completed: true };
		vi.mocked(globalThis.fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockUpdated,
		} as Response);

		const result = await todoApi.updateTodo("1", { completed: true });

		expect(globalThis.fetch).toHaveBeenCalledWith("/api/todos/1", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ completed: true }),
		});
		expect(result).toEqual(mockUpdated);
	});

	it("deletes a todo with DELETE /api/todos/:id", async () => {
		vi.mocked(globalThis.fetch).mockResolvedValueOnce({
			ok: true,
			status: 204,
		} as Response);

		await expect(todoApi.deleteTodo("1")).resolves.toBeUndefined();

		expect(globalThis.fetch).toHaveBeenCalledWith("/api/todos/1", {
			method: "DELETE",
		});
	});

	it("throws ApiError on HTTP failure with message from response body", async () => {
		vi.mocked(globalThis.fetch).mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: async () => ({ message: "Title is required" }),
		} as Response);

		let caughtError: unknown;
		try {
			await todoApi.createTodo({ title: "" });
		} catch (err) {
			caughtError = err;
		}

		expect(caughtError).toBeInstanceOf(ApiError);
		expect((caughtError as ApiError).status).toBe(400);
		expect((caughtError as ApiError).message).toBe("Title is required");
	});
});
