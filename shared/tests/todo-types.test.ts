import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CreateTodoDto, Todo, UpdateTodoDto } from "../types/todo.js";

describe("Shared Todo Types contract tests", () => {
	it("should accept valid Todo object structure", () => {
		const todo: Todo = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			title: "Test task",
			completed: false,
			created_at: "2026-10-20T12:00:00Z",
			updated_at: "2026-10-20T12:00:00Z",
		};

		assert.equal(todo.id, "123e4567-e89b-12d3-a456-426614174000");
		assert.equal(todo.title, "Test task");
		assert.equal(todo.completed, false);
		assert.equal(typeof todo.created_at, "string");
		assert.equal(typeof todo.updated_at, "string");
	});

	it("should accept valid CreateTodoDto", () => {
		const createDto: CreateTodoDto = {
			title: "New Todo Title",
		};

		assert.equal(createDto.title, "New Todo Title");
	});

	it("should accept valid UpdateTodoDto with partial fields", () => {
		const updateDto1: UpdateTodoDto = {
			completed: true,
		};
		const updateDto2: UpdateTodoDto = {
			title: "Updated Title",
		};
		const updateDto3: UpdateTodoDto = {
			title: "Updated Title",
			completed: false,
		};

		assert.equal(updateDto1.completed, true);
		assert.equal(updateDto1.title, undefined);
		assert.equal(updateDto2.title, "Updated Title");
		assert.equal(updateDto3.completed, false);
	});
});
