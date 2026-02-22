import type { SQLiteBindValue } from "expo-sqlite";
import { getDatabase } from "../database";
import { generateUUID } from "../../utils/uuid";
import type {
  GameLineup,
  GameLineupInsert,
  GameLineupUpdate,
} from "../../types/database";

export async function createGameLineup(data: GameLineupInsert): Promise<GameLineup> {
  const db = await getDatabase();
  const id = generateUUID();

  const lineup: GameLineup = {
    id,
    game_id: data.game_id,
    player_id: data.player_id,
    quarter: data.quarter,
    check_in_time: data.check_in_time ?? null,
    check_out_time: data.check_out_time ?? null,
    is_starter: data.is_starter ?? 0,
  };

  await db.runAsync(
    `INSERT INTO game_lineups
      (id, game_id, player_id, quarter, check_in_time, check_out_time, is_starter)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      lineup.id, lineup.game_id, lineup.player_id, lineup.quarter,
      lineup.check_in_time, lineup.check_out_time, lineup.is_starter,
    ]
  );

  return lineup;
}

export async function getLineupsByGameId(gameId: string): Promise<GameLineup[]> {
  const db = await getDatabase();
  return db.getAllAsync<GameLineup>(
    "SELECT * FROM game_lineups WHERE game_id = ? ORDER BY quarter ASC, is_starter DESC;",
    [gameId]
  );
}

export async function getLineupsByGameAndQuarter(
  gameId: string,
  quarter: number
): Promise<GameLineup[]> {
  const db = await getDatabase();
  return db.getAllAsync<GameLineup>(
    "SELECT * FROM game_lineups WHERE game_id = ? AND quarter = ? ORDER BY is_starter DESC;",
    [gameId, quarter]
  );
}

export async function getStartersByGame(gameId: string): Promise<GameLineup[]> {
  const db = await getDatabase();
  return db.getAllAsync<GameLineup>(
    "SELECT * FROM game_lineups WHERE game_id = ? AND is_starter = 1 ORDER BY quarter ASC;",
    [gameId]
  );
}

export async function updateGameLineup(id: string, data: GameLineupUpdate): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (data.quarter !== undefined) { fields.push("quarter = ?"); values.push(data.quarter); }
  if (data.check_in_time !== undefined) { fields.push("check_in_time = ?"); values.push(data.check_in_time); }
  if (data.check_out_time !== undefined) { fields.push("check_out_time = ?"); values.push(data.check_out_time); }
  if (data.is_starter !== undefined) { fields.push("is_starter = ?"); values.push(data.is_starter); }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE game_lineups SET ${fields.join(", ")} WHERE id = ?;`, values);
}

export async function deleteGameLineup(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM game_lineups WHERE id = ?;", [id]);
}

export async function deleteLineupsByGameId(gameId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM game_lineups WHERE game_id = ?;", [gameId]);
}
