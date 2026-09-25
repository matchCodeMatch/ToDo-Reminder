import * as SQLite from 'expo-sqlite';
import { Task, Settings, DEFAULT_SETTINGS, RepeatRule } from '../constants/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('reminder.db');
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT NOT NULL,
      due_time TEXT NOT NULL,
      repeat_rule TEXT DEFAULT 'none',
      repeat_days TEXT DEFAULT '[]',
      alarm_enabled INTEGER DEFAULT 1,
      is_completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Insert default settings if they don't exist
  const existing = await database.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM settings'
  );
  if (existing && existing.cnt === 0) {
    await database.runAsync(
      "INSERT INTO settings (key, value) VALUES ('snooze_duration', ?)",
      String(DEFAULT_SETTINGS.snooze_duration)
    );
    await database.runAsync(
      "INSERT INTO settings (key, value) VALUES ('alarm_sound', ?)",
      DEFAULT_SETTINGS.alarm_sound
    );
    await database.runAsync(
      "INSERT INTO settings (key, value) VALUES ('vibration_enabled', ?)",
      DEFAULT_SETTINGS.vibration_enabled ? '1' : '0'
    );
  }
}

// --- Task CRUD ---

function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    due_date: row.due_date,
    due_time: row.due_time,
    repeat_rule: row.repeat_rule as RepeatRule,
    repeat_days: JSON.parse(row.repeat_days || '[]'),
    alarm_enabled: row.alarm_enabled === 1,
    is_completed: row.is_completed === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getAllTasks(): Promise<Task[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM tasks ORDER BY due_date ASC, due_time ASC'
  );
  return rows.map(rowToTask);
}

export async function getUpcomingTasks(): Promise<Task[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM tasks WHERE is_completed = 0 ORDER BY due_date ASC, due_time ASC'
  );
  return rows.map(rowToTask);
}

export async function getCompletedTasks(): Promise<Task[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM tasks WHERE is_completed = 1 ORDER BY updated_at DESC'
  );
  return rows.map(rowToTask);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM tasks WHERE id = ?', id);
  return row ? rowToTask(row) : null;
}

export async function createTask(task: Task): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO tasks (id, title, description, due_date, due_time, repeat_rule, repeat_days, alarm_enabled, is_completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    task.id,
    task.title,
    task.description,
    task.due_date,
    task.due_time,
    task.repeat_rule,
    JSON.stringify(task.repeat_days),
    task.alarm_enabled ? 1 : 0,
    task.is_completed ? 1 : 0,
    task.created_at,
    task.updated_at
  );
}

export async function updateTask(task: Task): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE tasks SET title = ?, description = ?, due_date = ?, due_time = ?, repeat_rule = ?, repeat_days = ?, alarm_enabled = ?, is_completed = ?, updated_at = ?
     WHERE id = ?`,
    task.title,
    task.description,
    task.due_date,
    task.due_time,
    task.repeat_rule,
    JSON.stringify(task.repeat_days),
    task.alarm_enabled ? 1 : 0,
    task.is_completed ? 1 : 0,
    task.updated_at,
    task.id
  );
}

export async function deleteTask(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

export async function markTaskCompleted(id: string): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    'UPDATE tasks SET is_completed = 1, updated_at = ? WHERE id = ?',
    now,
    id
  );
}

export async function markTaskIncomplete(id: string): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    'UPDATE tasks SET is_completed = 0, updated_at = ? WHERE id = ?',
    now,
    id
  );
}

// --- Settings ---

export async function getSettings(): Promise<Settings> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ key: string; value: string }>(
    'SELECT * FROM settings'
  );

  const settings: Settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    switch (row.key) {
      case 'snooze_duration':
        settings.snooze_duration = parseInt(row.value, 10);
        break;
      case 'alarm_sound':
        settings.alarm_sound = row.value;
        break;
      case 'vibration_enabled':
        settings.vibration_enabled = row.value === '1';
        break;
    }
  }
  return settings;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}
