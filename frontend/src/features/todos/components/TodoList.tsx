import type React from "react";
import type { Todo, TodoFilterStatus } from "../types";
import { TodoItem } from "./TodoItem";

export interface TodoListProps {
	todos: Todo[];
	loading?: boolean;
	error?: string | null;
	filter?: TodoFilterStatus;
	onToggle: (id: string) => Promise<boolean> | boolean;
	onDelete: (id: string) => Promise<boolean> | boolean;
	onRetry?: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
	todos,
	loading = false,
	error = null,
	filter = "all",
	onToggle,
	onDelete,
	onRetry,
}) => {
	if (loading && todos.length === 0) {
		return (
			<div className="todo-state-box loading" data-testid="todo-loading">
				<div className="spinner" aria-hidden="true" />
				<p>Loading tasks...</p>
			</div>
		);
	}

	if (error && todos.length === 0) {
		return (
			<div
				className="todo-state-box error"
				data-testid="todo-error"
				role="alert"
			>
				<p className="error-message">{error}</p>
				{onRetry && (
					<button type="button" className="retry-btn" onClick={onRetry}>
						Try Again
					</button>
				)}
			</div>
		);
	}

	if (todos.length === 0) {
		let emptyMessage = "No tasks yet. Add your first task above!";
		if (filter === "active") {
			emptyMessage = "No active tasks found.";
		} else if (filter === "completed") {
			emptyMessage = "No completed tasks found.";
		}

		return (
			<div className="todo-state-box empty" data-testid="todo-empty">
				<p className="empty-message">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="todo-list-container">
			{loading && (
				<div
					className="inline-loading-bar"
					data-testid="todo-inline-loading"
					role="status"
					aria-label="Updating..."
				>
					Updating...
				</div>
			)}
			<ul className="todo-list" aria-label="Task list">
				{todos.map((todo) => (
					<TodoItem
						key={todo.id}
						todo={todo}
						onToggle={onToggle}
						onDelete={onDelete}
					/>
				))}
			</ul>
		</div>
	);
};
