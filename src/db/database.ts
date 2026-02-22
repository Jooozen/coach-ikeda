import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

const DB_NAME = "coach_ikeda.db";

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * データベースを開き、マイグレーションを実行して返す。
 * 2回目以降はキャッシュされたインスタンスを返す。
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // WAL モードで高速化
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  await runMigrations(db);

  _db = db;
  return db;
}

/**
 * データベース接続を閉じる（テストやリセット用）
 */
export async function closeDatabase(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
