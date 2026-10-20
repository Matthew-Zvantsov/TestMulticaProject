import { query as defaultQuery } from '../db/index.js';
import { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo.js';
import { QueryResult, QueryResultRow } from 'pg';

export type QueryFn = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) => Promise<QueryResult<T>>;

export interface ITodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  create(dto: CreateTodoDto): Promise<Todo>;
  update(id: string, dto: UpdateTodoDto): Promise<Todo | null>;
  delete(id: string): Promise<boolean>;
}

export class TodoRepository implements ITodoRepository {
  constructor(private readonly queryFn: QueryFn = defaultQuery) {}

  async findAll(): Promise<Todo[]> {
    const res = await this.queryFn<Todo>(
      'SELECT id, title, completed, created_at, updated_at FROM todos ORDER BY created_at ASC'
    );
    return res.rows;
  }

  async findById(id: string): Promise<Todo | null> {
    const res = await this.queryFn<Todo>(
      'SELECT id, title, completed, created_at, updated_at FROM todos WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    const res = await this.queryFn<Todo>(
      'INSERT INTO todos (title) VALUES ($1) RETURNING id, title, completed, created_at, updated_at',
      [dto.title]
    );
    return res.rows[0];
  }

  async update(id: string, dto: UpdateTodoDto): Promise<Todo | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(dto.title);
    }

    if (dto.completed !== undefined) {
      fields.push(`completed = $${idx++}`);
      values.push(dto.completed);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const queryText = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, title, completed, created_at, updated_at`;
    const res = await this.queryFn<Todo>(queryText, values);
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.queryFn(
      'DELETE FROM todos WHERE id = $1 RETURNING id',
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }
}
