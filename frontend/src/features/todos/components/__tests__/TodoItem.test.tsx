import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Todo } from "../../types";
import { TodoItem } from "../TodoItem";

describe("TodoItem component", () => {
	const mockTodo: Todo = {
		id: "todo-1",
		title: "Write unit tests",
		completed: false,
		created_at: "2026-10-20T10:00:00Z",
		updated_at: "2026-10-20T10:00:00Z",
	};

	it("renders title and unchecked checkbox for active todo", () => {
		render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

		expect(screen.getByText("Write unit tests")).toBeInTheDocument();
		const checkbox = screen.getByRole("checkbox", {
			name: /mark "write unit tests" as completed/i,
		});
		expect(checkbox).not.toBeChecked();
	});

	it("renders checked checkbox and completed style for completed todo", () => {
		const completedTodo: Todo = { ...mockTodo, completed: true };
		render(
			<TodoItem todo={completedTodo} onToggle={vi.fn()} onDelete={vi.fn()} />,
		);

		const checkbox = screen.getByRole("checkbox", {
			name: /mark "write unit tests" as active/i,
		});
		expect(checkbox).toBeChecked();
		expect(screen.getByTestId("todo-item-todo-1")).toHaveClass("completed");
	});

	it("calls onToggle with todo id when checkbox is clicked", async () => {
		const user = userEvent.setup();
		const handleToggle = vi.fn().mockResolvedValue(true);
		render(
			<TodoItem todo={mockTodo} onToggle={handleToggle} onDelete={vi.fn()} />,
		);

		const checkbox = screen.getByRole("checkbox");
		await user.click(checkbox);

		expect(handleToggle).toHaveBeenCalledTimes(1);
		expect(handleToggle).toHaveBeenCalledWith("todo-1");
	});

	it("calls onDelete with todo id when delete button is clicked", async () => {
		const user = userEvent.setup();
		const handleDelete = vi.fn().mockResolvedValue(true);
		render(
			<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={handleDelete} />,
		);

		const deleteBtn = screen.getByRole("button", {
			name: /delete "write unit tests"/i,
		});
		await user.click(deleteBtn);

		expect(handleDelete).toHaveBeenCalledTimes(1);
		expect(handleDelete).toHaveBeenCalledWith("todo-1");
	});

	it("disables controls when disabled prop is true", () => {
		render(
			<TodoItem
				todo={mockTodo}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				disabled={true}
			/>,
		);

		expect(screen.getByRole("checkbox")).toBeDisabled();
		expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
	});
});
