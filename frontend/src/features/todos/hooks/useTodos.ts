import { useCallback, useEffect, useMemo, useState } from "react";
import { todoApi } from "../api/todoApi";
import type { Todo, TodoFilterStatus, TodoStats } from "../types";

export interface UseTodosReturn {
	todos: Todo[];
	filteredTodos: Todo[];
	loading: boolean;
	error: string | null;
	filter: TodoFilterStatus;
	stats: TodoStats;
	setFilter: (filter: TodoFilterStatus) => void;
	fetchTodos: () => Promise<void>;
	addTodo: (title: string) => Promise<boolean>;
	toggleTodo: (id: string) => Promise<boolean>;
	removeTodo: (id: string) => Promise<boolean>;
	clearError: () => void;
}

export function useTodos(): UseTodosReturn {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<TodoFilterStatus>("all");

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const fetchTodos = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await todoApi.getTodos();
			setTodos(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to fetch tasks";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchTodos();
	}, [fetchTodos]);

	const addTodo = useCallback(async (title: string): Promise<boolean> => {
		const trimmed = title.trim();
		if (!trimmed) {
			setError("Task title cannot be empty");
			return false;
		}

		setError(null);
		try {
			const newTodo = await todoApi.createTodo({ title: trimmed });
			setTodos((prev) => [...prev, newTodo]);
			return true;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to add task";
			setError(message);
			return false;
		}
	}, []);

	const toggleTodo = useCallback(
		async (id: string): Promise<boolean> => {
			const target = todos.find((t) => t.id === id);
			if (!target) return false;

			setError(null);
			const newCompleted = !target.completed;

			// Optimistic update
			setTodos((prev) =>
				prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)),
			);

			try {
				const updated = await todoApi.updateTodo(id, {
					completed: newCompleted,
				});
				setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
				return true;
			} catch (err) {
				// Rollback optimistic update
				setTodos((prev) =>
					prev.map((t) =>
						t.id === id ? { ...t, completed: target.completed } : t,
					),
				);
				const message =
					err instanceof Error ? err.message : "Failed to update task";
				setError(message);
				return false;
			}
		},
		[todos],
	);

	const removeTodo = useCallback(
		async (id: string): Promise<boolean> => {
			const targetIndex = todos.findIndex((t) => t.id === id);
			if (targetIndex === -1) return false;
			const target = todos[targetIndex];

			setError(null);
			// Optimistic delete
			setTodos((prev) => prev.filter((t) => t.id !== id));

			try {
				await todoApi.deleteTodo(id);
				return true;
			} catch (err) {
				// Rollback
				setTodos((prev) => {
					const next = [...prev];
					next.splice(targetIndex, 0, target);
					return next;
				});
				const message =
					err instanceof Error ? err.message : "Failed to delete task";
				setError(message);
				return false;
			}
		},
		[todos],
	);

	const stats: TodoStats = useMemo(() => {
		const all = todos.length;
		const completed = todos.filter((t) => t.completed).length;
		const active = all - completed;
		return { all, active, completed };
	}, [todos]);

	const filteredTodos = useMemo(() => {
		switch (filter) {
			case "active":
				return todos.filter((t) => !t.completed);
			case "completed":
				return todos.filter((t) => t.completed);
			default:
				return todos;
		}
	}, [todos, filter]);

	return {
		todos,
		filteredTodos,
		loading,
		error,
		filter,
		stats,
		setFilter,
		fetchTodos,
		addTodo,
		toggleTodo,
		removeTodo,
		clearError,
	};
}
