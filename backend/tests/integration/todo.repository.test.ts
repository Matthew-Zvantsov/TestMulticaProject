import { describe, it, expect, beforeEach } from 'vitest';
import { newDb } from 'pg-mem';
import { TodoRepository } from '../../src/repositories/todo.repository.js';

describe('TodoRepository PostgreSQL Query Integration Tests (pg-mem)', () => {
  let memDb: ReturnType<typeof newDb>;
  let repo: TodoRepository;

  beforeEach(async () => {
    memDb = newDb();

    // Register gen_random_uuid in pg-mem with valid hex UUIDs
    memDb.public.registerFunction({
      name: 'gen_random_uuid',
      returns: memDb.public.getType('uuid'),
      implementation: () => {
        const hex = '0123456789abcdef';
        let rand = '';
        for (let i = 0; i < 12; i++) {
          rand += hex[Math.floor(Math.random() * 16)];
        }
        return 'b0000000-0000-4000-8000-' + rand;
      },
    });

    // Create table schema
    memDb.public.none(`
      CREATE TABLE todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Hook query to pg-mem pg adapter
    const pgAdapter = memDb.adapters.createPg();
    const memPool = new pgAdapter.Pool();

    repo = new TodoRepository((text, params) => memPool.query(text, params) as any);
  });

  it('should start with an empty table', async () => {
    const todos = await repo.findAll();
    expect(todos).toEqual([]);
  });

  it('should insert and retrieve a new todo with SQL defaults', async () => {
    const created = await repo.create({ title: 'Integration Test Todo' });
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.title).toBe('Integration Test Todo');
    expect(created.completed).toBe(false);
    expect(created.created_at).toBeDefined();

    const fetched = await repo.findById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.title).toBe('Integration Test Todo');
  });

  it('should update completed status and title via SQL query', async () => {
    const created = await repo.create({ title: 'Task to update' });

    const updated = await repo.update(created.id, { completed: true, title: 'Updated Task' });
    expect(updated).toBeDefined();
    expect(updated?.completed).toBe(true);
    expect(updated?.title).toBe('Updated Task');

    const fetched = await repo.findById(created.id);
    expect(fetched?.completed).toBe(true);
    expect(fetched?.title).toBe('Updated Task');
  });

  it('should delete a todo from the table', async () => {
    const created = await repo.create({ title: 'Task to remove' });

    const deleted = await repo.delete(created.id);
    expect(deleted).toBe(true);

    const fetched = await repo.findById(created.id);
    expect(fetched).toBeNull();
  });
});
