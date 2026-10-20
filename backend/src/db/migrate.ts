import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const possiblePaths = [
    path.join(__dirname, 'migrations'),
    path.join(__dirname, '..', 'src', 'db', 'migrations'),
    path.join(process.cwd(), 'src', 'db', 'migrations'),
    path.join(process.cwd(), 'backend', 'src', 'db', 'migrations'),
  ];

  let migrationsDir = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      migrationsDir = p;
      break;
    }
  }

  if (!migrationsDir) {
    throw new Error(`Migrations directory not found in: ${possiblePaths.join(', ')}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Running migrations from ${migrationsDir}...`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`Applying migration: ${file}`);
    await pool.query(sql);
    console.log(`Successfully applied: ${file}`);
  }

  console.log('All migrations executed successfully.');
}

// Allow running directly from CLI
if (process.argv[1] === __filename) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Migration failed:', err);
      await pool.end();
      process.exit(1);
    });
}
