import type { SQLiteBindValue } from "expo-sqlite";
import { getDatabase } from "../database";
import { generateUUID } from "../../utils/uuid";
import type {
  PlayerGameStats,
  PlayerGameStatsInsert,
  PlayerGameStatsUpdate,
} from "../../types/database";

export async function upsertPlayerGameStats(
  data: PlayerGameStatsInsert
): Promise<PlayerGameStats> {
  const db = await getDatabase();
  const id = generateUUID();

  const stats: PlayerGameStats = {
    id,
    game_id: data.game_id,
    player_id: data.player_id,
    minutes: data.minutes ?? 0,
    fg2_made: data.fg2_made ?? 0,
    fg2_attempted: data.fg2_attempted ?? 0,
    fg3_made: data.fg3_made ?? 0,
    fg3_attempted: data.fg3_attempted ?? 0,
    ft_made: data.ft_made ?? 0,
    ft_attempted: data.ft_attempted ?? 0,
    off_rebounds: data.off_rebounds ?? 0,
    def_rebounds: data.def_rebounds ?? 0,
    assists: data.assists ?? 0,
    steals: data.steals ?? 0,
    blocks: data.blocks ?? 0,
    turnovers: data.turnovers ?? 0,
    fouls: data.fouls ?? 0,
    plus_minus: data.plus_minus ?? 0,
    points: data.points ?? 0,
  };

  // UPSERT: game_id + player_id のユニーク制約を利用
  await db.runAsync(
    `INSERT INTO player_game_stats
      (id, game_id, player_id, minutes,
       fg2_made, fg2_attempted, fg3_made, fg3_attempted,
       ft_made, ft_attempted, off_rebounds, def_rebounds,
       assists, steals, blocks, turnovers, fouls, plus_minus, points)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(game_id, player_id) DO UPDATE SET
       minutes = excluded.minutes,
       fg2_made = excluded.fg2_made,
       fg2_attempted = excluded.fg2_attempted,
       fg3_made = excluded.fg3_made,
       fg3_attempted = excluded.fg3_attempted,
       ft_made = excluded.ft_made,
       ft_attempted = excluded.ft_attempted,
       off_rebounds = excluded.off_rebounds,
       def_rebounds = excluded.def_rebounds,
       assists = excluded.assists,
       steals = excluded.steals,
       blocks = excluded.blocks,
       turnovers = excluded.turnovers,
       fouls = excluded.fouls,
       plus_minus = excluded.plus_minus,
       points = excluded.points;`,
    [
      stats.id, stats.game_id, stats.player_id, stats.minutes,
      stats.fg2_made, stats.fg2_attempted, stats.fg3_made, stats.fg3_attempted,
      stats.ft_made, stats.ft_attempted, stats.off_rebounds, stats.def_rebounds,
      stats.assists, stats.steals, stats.blocks, stats.turnovers,
      stats.fouls, stats.plus_minus, stats.points,
    ]
  );

  return stats;
}

export async function getStatsByGameId(gameId: string): Promise<PlayerGameStats[]> {
  const db = await getDatabase();
  return db.getAllAsync<PlayerGameStats>(
    "SELECT * FROM player_game_stats WHERE game_id = ? ORDER BY points DESC;",
    [gameId]
  );
}

export async function getStatsByPlayerId(playerId: string): Promise<PlayerGameStats[]> {
  const db = await getDatabase();
  return db.getAllAsync<PlayerGameStats>(
    "SELECT * FROM player_game_stats WHERE player_id = ?;",
    [playerId]
  );
}

export async function getStatsByGameAndPlayer(
  gameId: string,
  playerId: string
): Promise<PlayerGameStats | null> {
  const db = await getDatabase();
  return db.getFirstAsync<PlayerGameStats>(
    "SELECT * FROM player_game_stats WHERE game_id = ? AND player_id = ?;",
    [gameId, playerId]
  );
}

export async function updatePlayerGameStats(
  id: string,
  data: PlayerGameStatsUpdate
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (data.minutes !== undefined) { fields.push("minutes = ?"); values.push(data.minutes); }
  if (data.fg2_made !== undefined) { fields.push("fg2_made = ?"); values.push(data.fg2_made); }
  if (data.fg2_attempted !== undefined) { fields.push("fg2_attempted = ?"); values.push(data.fg2_attempted); }
  if (data.fg3_made !== undefined) { fields.push("fg3_made = ?"); values.push(data.fg3_made); }
  if (data.fg3_attempted !== undefined) { fields.push("fg3_attempted = ?"); values.push(data.fg3_attempted); }
  if (data.ft_made !== undefined) { fields.push("ft_made = ?"); values.push(data.ft_made); }
  if (data.ft_attempted !== undefined) { fields.push("ft_attempted = ?"); values.push(data.ft_attempted); }
  if (data.off_rebounds !== undefined) { fields.push("off_rebounds = ?"); values.push(data.off_rebounds); }
  if (data.def_rebounds !== undefined) { fields.push("def_rebounds = ?"); values.push(data.def_rebounds); }
  if (data.assists !== undefined) { fields.push("assists = ?"); values.push(data.assists); }
  if (data.steals !== undefined) { fields.push("steals = ?"); values.push(data.steals); }
  if (data.blocks !== undefined) { fields.push("blocks = ?"); values.push(data.blocks); }
  if (data.turnovers !== undefined) { fields.push("turnovers = ?"); values.push(data.turnovers); }
  if (data.fouls !== undefined) { fields.push("fouls = ?"); values.push(data.fouls); }
  if (data.plus_minus !== undefined) { fields.push("plus_minus = ?"); values.push(data.plus_minus); }
  if (data.points !== undefined) { fields.push("points = ?"); values.push(data.points); }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE player_game_stats SET ${fields.join(", ")} WHERE id = ?;`, values);
}

export async function deleteStatsByGameId(gameId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM player_game_stats WHERE game_id = ?;", [gameId]);
}

/**
 * game_events テーブルから集計して player_game_stats を再計算する
 */
export async function recalculateStatsFromEvents(
  gameId: string,
  playerId: string
): Promise<void> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<{
    fg2_made: number;
    fg2_attempted: number;
    fg3_made: number;
    fg3_attempted: number;
    ft_made: number;
    ft_attempted: number;
    off_rebounds: number;
    def_rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fouls: number;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN action_type = 'FG2_MADE' THEN 1 ELSE 0 END), 0) AS fg2_made,
       COALESCE(SUM(CASE WHEN action_type IN ('FG2_MADE','FG2_MISS') THEN 1 ELSE 0 END), 0) AS fg2_attempted,
       COALESCE(SUM(CASE WHEN action_type = 'FG3_MADE' THEN 1 ELSE 0 END), 0) AS fg3_made,
       COALESCE(SUM(CASE WHEN action_type IN ('FG3_MADE','FG3_MISS') THEN 1 ELSE 0 END), 0) AS fg3_attempted,
       COALESCE(SUM(CASE WHEN action_type = 'FT_MADE' THEN 1 ELSE 0 END), 0) AS ft_made,
       COALESCE(SUM(CASE WHEN action_type IN ('FT_MADE','FT_MISS') THEN 1 ELSE 0 END), 0) AS ft_attempted,
       COALESCE(SUM(CASE WHEN action_type = 'REBOUND_OFF' THEN 1 ELSE 0 END), 0) AS off_rebounds,
       COALESCE(SUM(CASE WHEN action_type = 'REBOUND_DEF' THEN 1 ELSE 0 END), 0) AS def_rebounds,
       COALESCE(SUM(CASE WHEN action_type = 'ASSIST' THEN 1 ELSE 0 END), 0) AS assists,
       COALESCE(SUM(CASE WHEN action_type = 'STEAL' THEN 1 ELSE 0 END), 0) AS steals,
       COALESCE(SUM(CASE WHEN action_type = 'BLOCK' THEN 1 ELSE 0 END), 0) AS blocks,
       COALESCE(SUM(CASE WHEN action_type = 'TURNOVER' THEN 1 ELSE 0 END), 0) AS turnovers,
       COALESCE(SUM(CASE WHEN action_type IN ('FOUL','FOUL_TECHNICAL') THEN 1 ELSE 0 END), 0) AS fouls
     FROM game_events
     WHERE game_id = ? AND player_id = ?;`,
    [gameId, playerId]
  );

  if (!row) return;

  const points = row.fg2_made * 2 + row.fg3_made * 3 + row.ft_made;

  await upsertPlayerGameStats({
    game_id: gameId,
    player_id: playerId,
    minutes: 0,
    fg2_made: row.fg2_made,
    fg2_attempted: row.fg2_attempted,
    fg3_made: row.fg3_made,
    fg3_attempted: row.fg3_attempted,
    ft_made: row.ft_made,
    ft_attempted: row.ft_attempted,
    off_rebounds: row.off_rebounds,
    def_rebounds: row.def_rebounds,
    assists: row.assists,
    steals: row.steals,
    blocks: row.blocks,
    turnovers: row.turnovers,
    fouls: row.fouls,
    plus_minus: 0,
    points,
  });
}
