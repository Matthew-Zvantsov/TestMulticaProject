import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { TodoStats } from "../../types";
import { TodoFilter } from "../TodoFilter";

describe("TodoFilter component", () => {
	const mockStats: TodoStats = {
		all: 5,
		active: 3,
		completed: 2,
	};

	it("renders filter tabs with correct badges and counts", () => {
		render(
			<TodoFilter
				currentFilter="all"
				stats={mockStats}
				onFilterChange={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("filter-all")).toHaveTextContent("All5");
		expect(screen.getByTestId("filter-active")).toHaveTextContent("Active3");
		expect(screen.getByTestId("filter-completed")).toHaveTextContent(
			"Completed2",
		);
	});

	it("marks current active filter tab with active class and aria-selected", () => {
		render(
			<TodoFilter
				currentFilter="active"
				stats={mockStats}
				onFilterChange={vi.fn()}
			/>,
		);

		const activeTab = screen.getByTestId("filter-active");
		expect(activeTab).toHaveClass("active");
		expect(activeTab).toHaveAttribute("aria-selected", "true");

		const allTab = screen.getByTestId("filter-all");
		expect(allTab).not.toHaveClass("active");
		expect(allTab).toHaveAttribute("aria-selected", "false");
	});

	it("triggers onFilterChange when a tab is clicked", async () => {
		const user = userEvent.setup();
		const handleFilterChange = vi.fn();

		render(
			<TodoFilter
				currentFilter="all"
				stats={mockStats}
				onFilterChange={handleFilterChange}
			/>,
		);

		await user.click(screen.getByTestId("filter-completed"));
		expect(handleFilterChange).toHaveBeenCalledWith("completed");

		await user.click(screen.getByTestId("filter-active"));
		expect(handleFilterChange).toHaveBeenCalledWith("active");
	});
});
