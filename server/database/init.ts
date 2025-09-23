import Database from 'better-sqlite3';

const db = new Database('./cowatch.db');

const dbRun = (sql: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(...params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

const dbGet = (sql: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.get(...params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

const dbAll = (sql: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.all(...params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const initializeDatabase = async () => {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS friendships (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        friend_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (friend_id) REFERENCES users (id),
        UNIQUE(user_id, friend_id)
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS watch_sessions (
        id TEXT PRIMARY KEY,
        video_id TEXT NOT NULL,
        video_title TEXT NOT NULL,
        video_thumbnail TEXT NOT NULL,
        video_duration INTEGER NOT NULL,
        video_url TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS session_participants (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES watch_sessions (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(session_id, user_id)
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export { db, dbRun, dbGet, dbAll };