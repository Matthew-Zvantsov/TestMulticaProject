import type React from "react";
import type { TodoFilterStatus, TodoStats } from "../types";

export interface TodoFilterProps {
	currentFilter: TodoFilterStatus;
	stats: TodoStats;
	onFilterChange: (filter: TodoFilterStatus) => void;
}

interface FilterOption {
	id: TodoFilterStatus;
	label: string;
	count: number;
}

export const TodoFilter: React.FC<TodoFilterProps> = ({
	currentFilter,
	stats,
	onFilterChange,
}) => {
	const options: FilterOption[] = [
		{ id: "all", label: "All", count: stats.all },
		{ id: "active", label: "Active", count: stats.active },
		{ id: "completed", label: "Completed", count: stats.completed },
	];

	return (
		<nav className="todo-filter-nav" aria-label="Task filters">
			<div className="todo-filter-group" role="tablist">
				{options.map((opt) => {
					const isActive = currentFilter === opt.id;
					return (
						<button
							key={opt.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							className={`todo-filter-btn ${isActive ? "active" : ""}`}
							onClick={() => onFilterChange(opt.id)}
							data-testid={`filter-${opt.id}`}
						>
							<span className="filter-label">{opt.label}</span>
							<span
								className="filter-badge"
								data-testid={`filter-badge-${opt.id}`}
							>
								{opt.count}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
};
