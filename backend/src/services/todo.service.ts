import { ITodoRepository, TodoRepository } from '../repositories/todo.repository.js';
import { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo.js';
import { BadRequestError, NotFoundError } from '../errors/app-error.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class TodoService {
  constructor(private readonly repository: ITodoRepository = new TodoRepository()) {}

  private validateUuid(id: string): void {
    if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
      throw new BadRequestError('Invalid todo ID format. Expected a valid UUID.');
    }
  }

  async getAllTodos(): Promise<Todo[]> {
    return this.repository.findAll();
  }

  async getTodoById(id: string): Promise<Todo> {
    this.validateUuid(id);
    const todo = await this.repository.findById(id);
    if (!todo) {
      throw new NotFoundError(`Todo with ID "${id}" not found.`);
    }
    return todo;
  }

  async createTodo(dto: CreateTodoDto): Promise<Todo> {
    if (!dto || typeof dto.title !== 'string' || dto.title.trim().length === 0) {
      throw new BadRequestError('Title is required and must not be empty.');
    }

    const trimmedTitle = dto.title.trim();
    return this.repository.create({ title: trimmedTitle });
  }

  async updateTodo(id: string, dto: UpdateTodoDto): Promise<Todo> {
    this.validateUuid(id);

    if (!dto || (dto.title === undefined && dto.completed === undefined)) {
      throw new BadRequestError('At least one of "title" or "completed" must be provided for update.');
    }

    const updatePayload: UpdateTodoDto = {};

    if (dto.title !== undefined) {
      if (typeof dto.title !== 'string' || dto.title.trim().length === 0) {
        throw new BadRequestError('Title must be a non-empty string.');
      }
      updatePayload.title = dto.title.trim();
    }

    if (dto.completed !== undefined) {
      if (typeof dto.completed !== 'boolean') {
        throw new BadRequestError('Completed must be a boolean value.');
      }
      updatePayload.completed = dto.completed;
    }

    const updated = await this.repository.update(id, updatePayload);
    if (!updated) {
      throw new NotFoundError(`Todo with ID "${id}" not found.`);
    }

    return updated;
  }

  async deleteTodo(id: string): Promise<void> {
    this.validateUuid(id);
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Todo with ID "${id}" not found.`);
    }
  }
}
