import type { Todo, CreateTodoDto, UpdateTodoDto } from '../types';

const BASE_URL = '/api/todos';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data && typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (data && typeof data.error === 'string') {
        errorMessage = data.error;
      }
    } catch {
      // Body not JSON, keep default message
    }
    throw new ApiError(res.status, errorMessage);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

export const todoApi = {
  async getTodos(): Promise<Todo[]> {
    const res = await fetch(BASE_URL, {
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<Todo[]>(res);
  },

  async createTodo(dto: CreateTodoDto): Promise<Todo> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<Todo>(res);
  },

  async updateTodo(id: string, dto: UpdateTodoDto): Promise<Todo> {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<Todo>(res);
  },

  async deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(res);
  },
};
