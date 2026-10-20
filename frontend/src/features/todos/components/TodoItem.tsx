import type React from "react";
import { useState } from "react";
import type { Todo } from "../types";

export interface TodoItemProps {
	todo: Todo;
	onToggle: (id: string) => Promise<boolean> | boolean;
	onDelete: (id: string) => Promise<boolean> | boolean;
	disabled?: boolean;
}

export const TodoItem: React.FC<TodoItemProps> = ({
	todo,
	onToggle,
	onDelete,
	disabled = false,
}) => {
	const [isProcessing, setIsProcessing] = useState(false);

	const handleToggle = async () => {
		if (disabled || isProcessing) return;
		setIsProcessing(true);
		try {
			await onToggle(todo.id);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDelete = async () => {
		if (disabled || isProcessing) return;
		setIsProcessing(true);
		try {
			await onDelete(todo.id);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<li
			className={`todo-item ${todo.completed ? "completed" : ""}`}
			data-testid={`todo-item-${todo.id}`}
		>
			<label className="todo-item-label">
				<input
					type="checkbox"
					className="todo-item-checkbox"
					checked={todo.completed}
					onChange={handleToggle}
					disabled={disabled || isProcessing}
					aria-label={`Mark "${todo.title}" as ${todo.completed ? "active" : "completed"}`}
				/>
				<span className="todo-item-title">{todo.title}</span>
			</label>
			<button
				type="button"
				className="todo-item-delete-btn"
				onClick={handleDelete}
				disabled={disabled || isProcessing}
				aria-label={`Delete "${todo.title}"`}
				title="Delete task"
			>
				<span aria-hidden="true">&times;</span>
			</button>
		</li>
	);
};
