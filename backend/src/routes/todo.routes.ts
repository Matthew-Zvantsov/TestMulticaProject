import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller.js';
import { TodoService } from '../services/todo.service.js';

export function createTodoRouter(service?: TodoService): Router {
  const router = Router();
  const controller = new TodoController(service);

  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.get('/:id', controller.getById);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}

export const todoRouter = createTodoRouter();
