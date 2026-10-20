import type React from "react";
import { useState } from "react";

export interface TodoInputProps {
	onAdd: (title: string) => Promise<boolean> | boolean;
	disabled?: boolean;
}

export const TodoInput: React.FC<TodoInputProps> = ({
	onAdd,
	disabled = false,
}) => {
	const [title, setTitle] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = title.trim();
		if (!trimmed || submitting || disabled) return;

		setSubmitting(true);
		try {
			const success = await onAdd(trimmed);
			if (success) {
				setTitle("");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form
			className="todo-input-form"
			onSubmit={handleSubmit}
			aria-label="Add task form"
		>
			<input
				type="text"
				className="todo-input-field"
				placeholder="What needs to be done?"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				disabled={disabled || submitting}
				aria-label="New task title"
			/>
			<button
				type="submit"
				className="todo-input-btn"
				disabled={disabled || submitting || !title.trim()}
				aria-label="Add task"
			>
				{submitting ? "Adding..." : "Add Task"}
			</button>
		</form>
	);
};
