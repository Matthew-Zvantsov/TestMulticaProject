import { Request, Response, NextFunction } from 'express';
import { TodoService } from '../services/todo.service.js';

function extractId(params: Request['params']): string {
  const id = params.id;
  return Array.isArray(id) ? id[0] : id;
}

export class TodoController {
  constructor(private readonly service: TodoService = new TodoService()) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const todos = await this.service.getAllTodos();
      res.status(200).json(todos);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = extractId(req.params);
      const todo = await this.service.getTodoById(id);
      res.status(200).json(todo);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.service.createTodo(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = extractId(req.params);
      const updated = await this.service.updateTodo(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = extractId(req.params);
      await this.service.deleteTodo(id);
      res.status(200).json({
        message: 'Todo deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
