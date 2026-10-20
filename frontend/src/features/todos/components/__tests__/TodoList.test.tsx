import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Todo } from "../../types";
import { TodoList } from "../TodoList";

describe("TodoList component", () => {
	const mockTodos: Todo[] = [
		{
			id: "1",
			title: "First Task",
			completed: false,
			created_at: "2026-10-20T10:00:00Z",
			updated_at: "2026-10-20T10:00:00Z",
		},
		{
			id: "2",
			title: "Second Task",
			completed: true,
			created_at: "2026-10-20T10:05:00Z",
			updated_at: "2026-10-20T10:05:00Z",
		},
	];

	it("renders loading state when initial fetch is running and list is empty", () => {
		render(
			<TodoList
				todos={[]}
				loading={true}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("todo-loading")).toBeInTheDocument();
		expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
	});

	it("renders error state and handles retry button", async () => {
		const user = userEvent.setup();
		const handleRetry = vi.fn();

		render(
			<TodoList
				todos={[]}
				error="Network error occurred"
				onRetry={handleRetry}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("todo-error")).toBeInTheDocument();
		expect(screen.getByText("Network error occurred")).toBeInTheDocument();

		const retryBtn = screen.getByRole("button", { name: /try again/i });
		await user.click(retryBtn);
		expect(handleRetry).toHaveBeenCalledTimes(1);
	});

	it("renders default empty state when no tasks exist", () => {
		render(
			<TodoList
				todos={[]}
				filter="all"
				onToggle={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("todo-empty")).toBeInTheDocument();
		expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
	});

	it("renders specific empty states for active and completed filters", () => {
		const { rerender } = render(
			<TodoList
				todos={[]}
				filter="active"
				onToggle={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(screen.getByText("No active tasks found.")).toBeInTheDocument();

		rerender(
			<TodoList
				todos={[]}
				filter="completed"
				onToggle={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(screen.getByText("No completed tasks found.")).toBeInTheDocument();
	});

	it("renders list of items when todos are provided", () => {
		render(
			<TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />,
		);

		expect(screen.getByText("First Task")).toBeInTheDocument();
		expect(screen.getByText("Second Task")).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});

	it("renders inline loading indicator when loading with existing items", () => {
		render(
			<TodoList
				todos={mockTodos}
				loading={true}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("todo-inline-loading")).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});
});
