import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { todoApi } from "../../api/todoApi";
import type { Todo } from "../../types";
import { TodoApp } from "../TodoApp";

vi.mock("../../api/todoApi", () => ({
	todoApi: {
		getTodos: vi.fn(),
		createTodo: vi.fn(),
		updateTodo: vi.fn(),
		deleteTodo: vi.fn(),
	},
}));

describe("TodoApp component integration", () => {
	const initialTodos: Todo[] = [
		{
			id: "item-1",
			title: "Initial Todo",
			completed: false,
			created_at: "2026-10-20T10:00:00Z",
			updated_at: "2026-10-20T10:00:00Z",
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders app header, input, filters and loaded items", async () => {
		vi.mocked(todoApi.getTodos).mockResolvedValueOnce(initialTodos);

		render(<TodoApp />);

		expect(screen.getByText("Todo List")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("What needs to be done?"),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText("Initial Todo")).toBeInTheDocument();
		});

		expect(screen.getByTestId("filter-all")).toHaveTextContent("All1");
		expect(screen.getByTestId("filter-active")).toHaveTextContent("Active1");
		expect(screen.getByTestId("filter-completed")).toHaveTextContent(
			"Completed0",
		);
	});

	it("adds a new todo from the form and updates the list", async () => {
		const user = userEvent.setup();
		vi.mocked(todoApi.getTodos).mockResolvedValueOnce(initialTodos);
		vi.mocked(todoApi.createTodo).mockResolvedValueOnce({
			id: "item-2",
			title: "Second Todo",
			completed: false,
			created_at: "2026-10-20T10:01:00Z",
			updated_at: "2026-10-20T10:01:00Z",
		});

		render(<TodoApp />);

		await waitFor(() => {
			expect(screen.getByText("Initial Todo")).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText("What needs to be done?");
		await user.type(input, "Second Todo");
		await user.click(screen.getByRole("button", { name: /add task/i }));

		await waitFor(() => {
			expect(screen.getByText("Second Todo")).toBeInTheDocument();
		});

		expect(screen.getByTestId("filter-all")).toHaveTextContent("All2");
	});

	it("displays error banner on API error with existing items and allows dismissing", async () => {
		const user = userEvent.setup();
		vi.mocked(todoApi.getTodos).mockResolvedValueOnce(initialTodos);
		vi.mocked(todoApi.createTodo).mockRejectedValueOnce(
			new Error("Server error"),
		);

		render(<TodoApp />);

		await waitFor(() => {
			expect(screen.getByText("Initial Todo")).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText("What needs to be done?");
		await user.type(input, "Failing Todo");
		await user.click(screen.getByRole("button", { name: /add task/i }));

		await waitFor(() => {
			expect(screen.getByTestId("todo-error-banner")).toBeInTheDocument();
			expect(screen.getByText("Server error")).toBeInTheDocument();
		});

		// Dismiss error
		await user.click(screen.getByRole("button", { name: /dismiss error/i }));
		expect(screen.queryByTestId("todo-error-banner")).not.toBeInTheDocument();
	});
});
