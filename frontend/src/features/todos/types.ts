import type { Todo, CreateTodoDto, UpdateTodoDto } from '../../../../shared/types/todo';

export type { Todo, CreateTodoDto, UpdateTodoDto };

export type TodoFilterStatus = 'all' | 'active' | 'completed';

export interface TodoStats {
  all: number;
  active: number;
  completed: number;
}
