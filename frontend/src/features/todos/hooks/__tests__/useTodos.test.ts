import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTodos } from '../useTodos';
import { todoApi } from '../../api/todoApi';
import type { Todo } from '../../types';

vi.mock('../../api/todoApi', () => ({
  todoApi: {
    getTodos: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

describe('useTodos hook', () => {
  const initialTodos: Todo[] = [
    {
      id: '1',
      title: 'Active Todo',
      completed: false,
      created_at: '2026-10-20T10:00:00Z',
      updated_at: '2026-10-20T10:00:00Z',
    },
    {
      id: '2',
      title: 'Completed Todo',
      completed: true,
      created_at: '2026-10-20T10:05:00Z',
      updated_at: '2026-10-20T10:05:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches initial todos on mount and sets loading correctly', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValueOnce(initialTodos);

    const { result } = renderHook(() => useTodos());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.todos).toEqual(initialTodos);
    expect(result.current.stats).toEqual({ all: 2, active: 1, completed: 1 });
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetching todos fails', async () => {
    vi.mocked(todoApi.getTodos).mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network failure');
    expect(result.current.todos).toEqual([]);
  });

  it('adds a new todo and updates stats', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValueOnce([]);
    const createdTodo: Todo = {
      id: '3',
      title: 'New Task',
      completed: false,
      created_at: '2026-10-20T10:10:00Z',
      updated_at: '2026-10-20T10:10:00Z',
    };
    vi.mocked(todoApi.createTodo).mockResolvedValueOnce(createdTodo);

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.addTodo('New Task');
    });

    expect(success).toBe(true);
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toEqual(createdTodo);
    expect(result.current.stats).toEqual({ all: 1, active: 1, completed: 0 });
  });

  it('rejects adding empty todo without calling API', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = true;
    await act(async () => {
      success = await result.current.addTodo('   ');
    });

    expect(success).toBe(false);
    expect(todoApi.createTodo).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Task title cannot be empty');
  });

  it('toggles a todo with optimistic update and rolls back on failure', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValueOnce(initialTodos);
    vi.mocked(todoApi.updateTodo).mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.toggleTodo('1');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Update failed');
    // Rolled back to original completed: false
    expect(result.current.todos.find((t) => t.id === '1')?.completed).toBe(false);
  });

  it('removes a todo with optimistic delete and rolls back on failure', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValueOnce(initialTodos);
    vi.mocked(todoApi.deleteTodo).mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.removeTodo('1');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Delete failed');
    // Rolled back item
    expect(result.current.todos.find((t) => t.id === '1')).toBeDefined();
  });

  it('correctly filters todos by active and completed status', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValueOnce(initialTodos);

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.filteredTodos).toHaveLength(2);

    act(() => {
      result.current.setFilter('active');
    });
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].id).toBe('1');

    act(() => {
      result.current.setFilter('completed');
    });
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].id).toBe('2');
  });
});
