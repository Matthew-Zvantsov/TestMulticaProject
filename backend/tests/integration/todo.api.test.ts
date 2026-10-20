import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import type { ITodoRepository } from "../../src/repositories/todo.repository.js";
import { TodoService } from "../../src/services/todo.service.js";
import type {
	CreateTodoDto,
	Todo,
	UpdateTodoDto,
} from "../../src/types/todo.js";

class InMemoryTodoRepository implements ITodoRepository {
	private todos: Map<string, Todo> = new Map();

	async findAll(): Promise<Todo[]> {
		return Array.from(this.todos.values()).sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
		);
	}

	async findById(id: string): Promise<Todo | null> {
		return this.todos.get(id) || null;
	}

	async create(dto: CreateTodoDto): Promise<Todo> {
		const id =
			"a0000000-0000-4000-8000-" +
			String(this.todos.size + 1).padStart(12, "0");
		const now = new Date().toISOString();
		const todo: Todo = {
			id,
			title: dto.title,
			completed: false,
			created_at: now,
			updated_at: now,
		};
		this.todos.set(id, todo);
		return todo;
	}

	async update(id: string, dto: UpdateTodoDto): Promise<Todo | null> {
		const existing = this.todos.get(id);
		if (!existing) return null;

		const updated: Todo = {
			...existing,
			...(dto.title !== undefined && { title: dto.title }),
			...(dto.completed !== undefined && { completed: dto.completed }),
			updated_at: new Date().toISOString(),
		};
		this.todos.set(id, updated);
		return updated;
	}

	async delete(id: string): Promise<boolean> {
		return this.todos.delete(id);
	}
}

describe("Todo REST API Integration Tests", () => {
	let app: ReturnType<typeof createApp>;
	let repo: InMemoryTodoRepository;

	beforeEach(() => {
		repo = new InMemoryTodoRepository();
		const service = new TodoService(repo);
		app = createApp(service);
	});

	describe("GET /health", () => {
		it("should return 200 with status ok", async () => {
			const res = await request(app).get("/health");
			expect(res.status).toBe(200);
			expect(res.body).toEqual({ status: "ok" });
		});
	});

	describe("GET /api/todos", () => {
		it("should return 200 and an empty array initially", async () => {
			const res = await request(app).get("/api/todos");
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body)).toBe(true);
			expect(res.body).toHaveLength(0);
		});

		it("should return 200 with all created todos", async () => {
			await repo.create({ title: "Task 1" });
			await repo.create({ title: "Task 2" });

			const res = await request(app).get("/api/todos");
			expect(res.status).toBe(200);
			expect(res.body).toHaveLength(2);
			expect(res.body[0].title).toBe("Task 1");
			expect(res.body[1].title).toBe("Task 2");
		});
	});

	describe("POST /api/todos", () => {
		it("should return 400 Bad Request when title is missing", async () => {
			const res = await request(app).post("/api/todos").send({});

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 400 Bad Request when title is empty string or only whitespace", async () => {
			const res = await request(app).post("/api/todos").send({ title: "   " });

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 201 Created with created todo on valid title", async () => {
			const res = await request(app)
				.post("/api/todos")
				.send({ title: "Build a great backend API" });

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			expect(res.body.title).toBe("Build a great backend API");
			expect(res.body.completed).toBe(false);
			expect(res.body).toHaveProperty("created_at");
			expect(res.body).toHaveProperty("updated_at");
		});
	});

	describe("GET /api/todos/:id", () => {
		it("should return 400 Bad Request if id is not a valid UUID", async () => {
			const res = await request(app).get("/api/todos/123-not-a-uuid");
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 404 Not Found if todo does not exist", async () => {
			const res = await request(app).get(
				"/api/todos/00000000-0000-4000-8000-000000000000",
			);
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 200 with the todo when it exists", async () => {
			const created = await repo.create({ title: "Read documentation" });
			const res = await request(app).get(`/api/todos/${created.id}`);

			expect(res.status).toBe(200);
			expect(res.body.id).toBe(created.id);
			expect(res.body.title).toBe("Read documentation");
		});
	});

	describe("PATCH /api/todos/:id", () => {
		it("should return 400 Bad Request if id is not a valid UUID", async () => {
			const res = await request(app)
				.patch("/api/todos/not-a-uuid")
				.send({ completed: true });

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 400 Bad Request if no valid fields are provided", async () => {
			const created = await repo.create({ title: "Something" });
			const res = await request(app).patch(`/api/todos/${created.id}`).send({});

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 400 Bad Request if title is invalid", async () => {
			const created = await repo.create({ title: "Something" });
			const res = await request(app)
				.patch(`/api/todos/${created.id}`)
				.send({ title: "  " });

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 400 Bad Request if completed is not a boolean", async () => {
			const created = await repo.create({ title: "Something" });
			const res = await request(app)
				.patch(`/api/todos/${created.id}`)
				.send({ completed: "yes" });

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 404 Not Found if todo does not exist", async () => {
			const res = await request(app)
				.patch("/api/todos/00000000-0000-4000-8000-000000000000")
				.send({ completed: true });

			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 200 OK and toggle completed", async () => {
			const created = await repo.create({ title: "Finish homework" });
			expect(created.completed).toBe(false);

			const res = await request(app)
				.patch(`/api/todos/${created.id}`)
				.send({ completed: true });

			expect(res.status).toBe(200);
			expect(res.body.completed).toBe(true);
			expect(res.body.title).toBe("Finish homework");
		});

		it("should return 200 OK and update title", async () => {
			const created = await repo.create({ title: "Old title" });

			const res = await request(app)
				.patch(`/api/todos/${created.id}`)
				.send({ title: "New updated title" });

			expect(res.status).toBe(200);
			expect(res.body.title).toBe("New updated title");
		});
	});

	describe("DELETE /api/todos/:id", () => {
		it("should return 400 Bad Request if id is not a valid UUID", async () => {
			const res = await request(app).delete("/api/todos/invalid-uuid");
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 404 Not Found if todo does not exist", async () => {
			const res = await request(app).delete(
				"/api/todos/00000000-0000-4000-8000-000000000000",
			);
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 200 OK and remove the todo", async () => {
			const created = await repo.create({ title: "Task to delete" });

			const res = await request(app).delete(`/api/todos/${created.id}`);
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("message");

			// Verify it no longer exists
			const getRes = await request(app).get(`/api/todos/${created.id}`);
			expect(getRes.status).toBe(404);
		});
	});

	describe("Error handling", () => {
		it("should return 404 for unknown routes", async () => {
			const res = await request(app).get("/api/unknown-route");
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty("error");
		});

		it("should return 400 for malformed JSON body", async () => {
			const res = await request(app)
				.post("/api/todos")
				.set("Content-Type", "application/json")
				.send("{ invalid json");

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
		});
	});
});
