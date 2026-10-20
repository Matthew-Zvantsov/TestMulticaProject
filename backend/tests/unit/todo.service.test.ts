import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoService } from '../../src/services/todo.service.js';
import { ITodoRepository } from '../../src/repositories/todo.repository.js';
import { BadRequestError, NotFoundError } from '../../src/errors/app-error.js';
import { Todo } from '../../src/types/todo.js';

describe('TodoService Unit Tests', () => {
  let mockRepo: ITodoRepository;
  let service: TodoService;

  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const sampleTodo: Todo = {
    id: validUuid,
    title: 'Test todo',
    completed: false,
    created_at: '2026-10-20T12:00:00.000Z',
    updated_at: '2026-10-20T12:00:00.000Z',
  };

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new TodoService(mockRepo);
  });

  describe('getAllTodos', () => {
    it('should return all todos from repository', async () => {
      vi.mocked(mockRepo.findAll).mockResolvedValue([sampleTodo]);

      const result = await service.getAllTodos();

      expect(mockRepo.findAll).toHaveBeenCalledOnce();
      expect(result).toEqual([sampleTodo]);
    });
  });

  describe('getTodoById', () => {
    it('should throw BadRequestError for invalid UUID', async () => {
      await expect(service.getTodoById('invalid-id')).rejects.toThrow(BadRequestError);
      expect(mockRepo.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if todo is not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      await expect(service.getTodoById(validUuid)).rejects.toThrow(NotFoundError);
      expect(mockRepo.findById).toHaveBeenCalledWith(validUuid);
    });

    it('should return todo when found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(sampleTodo);

      const result = await service.getTodoById(validUuid);
      expect(result).toEqual(sampleTodo);
    });
  });

  describe('createTodo', () => {
    it('should throw BadRequestError if title is missing or empty', async () => {
      // @ts-expect-error test invalid input
      await expect(service.createTodo({})).rejects.toThrow(BadRequestError);
      await expect(service.createTodo({ title: '' })).rejects.toThrow(BadRequestError);
      await expect(service.createTodo({ title: '   ' })).rejects.toThrow(BadRequestError);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should create todo with trimmed title', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(sampleTodo);

      const result = await service.createTodo({ title: '  Buy groceries  ' });

      expect(mockRepo.create).toHaveBeenCalledWith({ title: 'Buy groceries' });
      expect(result).toEqual(sampleTodo);
    });
  });

  describe('updateTodo', () => {
    it('should throw BadRequestError for invalid UUID', async () => {
      await expect(service.updateTodo('not-a-uuid', { completed: true })).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if no update fields are provided', async () => {
      await expect(service.updateTodo(validUuid, {})).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError for empty title in update', async () => {
      await expect(service.updateTodo(validUuid, { title: '   ' })).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if completed is not a boolean', async () => {
      // @ts-expect-error test invalid type
      await expect(service.updateTodo(validUuid, { completed: 'true' })).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if todo to update is not found', async () => {
      vi.mocked(mockRepo.update).mockResolvedValue(null);

      await expect(service.updateTodo(validUuid, { completed: true })).rejects.toThrow(NotFoundError);
      expect(mockRepo.update).toHaveBeenCalledWith(validUuid, { completed: true });
    });

    it('should update and return updated todo', async () => {
      const updatedTodo: Todo = { ...sampleTodo, title: 'Updated Title', completed: true };
      vi.mocked(mockRepo.update).mockResolvedValue(updatedTodo);

      const result = await service.updateTodo(validUuid, { title: 'Updated Title', completed: true });

      expect(mockRepo.update).toHaveBeenCalledWith(validUuid, { title: 'Updated Title', completed: true });
      expect(result).toEqual(updatedTodo);
    });
  });

  describe('deleteTodo', () => {
    it('should throw BadRequestError for invalid UUID', async () => {
      await expect(service.deleteTodo('not-a-uuid')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if todo to delete does not exist', async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(false);

      await expect(service.deleteTodo(validUuid)).rejects.toThrow(NotFoundError);
      expect(mockRepo.delete).toHaveBeenCalledWith(validUuid);
    });

    it('should delete successfully when todo exists', async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(true);

      await expect(service.deleteTodo(validUuid)).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith(validUuid);
    });
  });
});
