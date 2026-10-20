import type {
	CreateTodoDto,
	Todo,
	UpdateTodoDto,
} from "../../../../shared/types/todo";

export type { CreateTodoDto, Todo, UpdateTodoDto };

export type TodoFilterStatus = "all" | "active" | "completed";

export interface TodoStats {
	all: number;
	active: number;
	completed: number;
}
