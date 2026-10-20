import React from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoInput } from './TodoInput';
import { TodoFilter } from './TodoFilter';
import { TodoList } from './TodoList';

export const TodoApp: React.FC = () => {
  const {
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
  } = useTodos();

  return (
    <main className="todo-app-card">
      <header className="todo-app-header">
        <h1 className="todo-app-title">Todo List</h1>
        <p className="todo-app-subtitle">Stay organized and productive</p>
      </header>

      <section className="todo-app-input-section" aria-label="Add new task">
        <TodoInput onAdd={addTodo} disabled={loading && filteredTodos.length === 0} />
      </section>

      {error && filteredTodos.length > 0 && (
        <div className="todo-error-banner" role="alert" data-testid="todo-error-banner">
          <span>{error}</span>
          <button
            type="button"
            className="todo-error-dismiss-btn"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      <section className="todo-app-filter-section">
        <TodoFilter
          currentFilter={filter}
          stats={stats}
          onFilterChange={setFilter}
        />
      </section>

      <section className="todo-app-list-section">
        <TodoList
          todos={filteredTodos}
          loading={loading}
          error={error}
          filter={filter}
          onToggle={toggleTodo}
          onDelete={removeTodo}
          onRetry={fetchTodos}
        />
      </section>
    </main>
  );
};
