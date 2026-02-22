import type * as SQLite from "expo-sqlite";
import { ALL_CREATE_TABLES, CREATE_INDEXES } from "./schema";

// マイグレーションのバージョン管理
// 新しいマイグレーションを追加する場合は配列末尾に追加する
interface Migration {
  version: number;
  description: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    description: "初期テーブル作成",
    up: async (db) => {
      await db.execAsync("PRAGMA foreign_keys = ON;");
      for (const sql of ALL_CREATE_TABLES) {
        await db.execAsync(sql);
      }
      for (const sql of CREATE_INDEXES) {
        await db.execAsync(sql);
      }
    },
  },
];

/**
 * マイグレーション管理テーブルを作成し、未適用のマイグレーションを順番に実行する
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // マイグレーション管理テーブル
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     INTEGER PRIMARY KEY,
      description TEXT,
      applied_at  TEXT NOT NULL
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    "SELECT version FROM schema_migrations ORDER BY version;"
  );
  const appliedSet = new Set(applied.map((r) => r.version));

  for (const migration of migrations) {
    if (appliedSet.has(migration.version)) continue;

    await db.withExclusiveTransactionAsync(async (txn) => {
      await migration.up(txn);
      await txn.runAsync(
        "INSERT INTO schema_migrations (version, description, applied_at) VALUES (?, ?, ?);",
        [migration.version, migration.description, new Date().toISOString()]
      );
    });
  }
}
