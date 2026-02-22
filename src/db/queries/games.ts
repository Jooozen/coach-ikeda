import type { SQLiteBindValue } from "expo-sqlite";
import { getDatabase } from "../database";
import { generateUUID } from "../../utils/uuid";
import { nowISO } from "../../utils/datetime";
import type { Game, GameInsert, GameUpdate, GameStatus } from "../../types/database";

export async function createGame(data: GameInsert): Promise<Game> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = nowISO();

  const game: Game = {
    id,
    home_team_id: data.home_team_id,
    away_team_id: data.away_team_id,
    game_date: data.game_date,
    game_type: data.game_type,
    tournament_name: data.tournament_name ?? null,
    quarter_minutes: data.quarter_minutes ?? 10,
    total_quarters: data.total_quarters ?? 4,
    status: data.status ?? "upcoming",
    home_score: data.home_score ?? 0,
    away_score: data.away_score ?? 0,
    notes: data.notes ?? null,
    created_at: now,
    updated_at: now,
  };

  await db.runAsync(
    `INSERT INTO games
      (id, home_team_id, away_team_id, game_date, game_type, tournament_name,
       quarter_minutes, total_quarters, status, home_score, away_score, notes,
       created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      game.id, game.home_team_id, game.away_team_id, game.game_date,
      game.game_type, game.tournament_name, game.quarter_minutes,
      game.total_quarters, game.status, game.home_score, game.away_score,
      game.notes, game.created_at, game.updated_at,
    ]
  );

  return game;
}

export async function getGameById(id: string): Promise<Game | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Game>("SELECT * FROM games WHERE id = ?;", [id]);
}

export async function getAllGames(): Promise<Game[]> {
  const db = await getDatabase();
  return db.getAllAsync<Game>("SELECT * FROM games ORDER BY game_date DESC;");
}

export async function getGamesByStatus(status: GameStatus): Promise<Game[]> {
  const db = await getDatabase();
  return db.getAllAsync<Game>(
    "SELECT * FROM games WHERE status = ? ORDER BY game_date DESC;",
    [status]
  );
}

export async function getGamesByTeamId(teamId: string): Promise<Game[]> {
  const db = await getDatabase();
  return db.getAllAsync<Game>(
    "SELECT * FROM games WHERE home_team_id = ? OR away_team_id = ? ORDER BY game_date DESC;",
    [teamId, teamId]
  );
}

export async function updateGame(id: string, data: GameUpdate): Promise<void> {
  const db = await getDatabase();
  const now = nowISO();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (data.home_team_id !== undefined) { fields.push("home_team_id = ?"); values.push(data.home_team_id); }
  if (data.away_team_id !== undefined) { fields.push("away_team_id = ?"); values.push(data.away_team_id); }
  if (data.game_date !== undefined) { fields.push("game_date = ?"); values.push(data.game_date); }
  if (data.game_type !== undefined) { fields.push("game_type = ?"); values.push(data.game_type); }
  if (data.tournament_name !== undefined) { fields.push("tournament_name = ?"); values.push(data.tournament_name); }
  if (data.quarter_minutes !== undefined) { fields.push("quarter_minutes = ?"); values.push(data.quarter_minutes); }
  if (data.total_quarters !== undefined) { fields.push("total_quarters = ?"); values.push(data.total_quarters); }
  if (data.status !== undefined) { fields.push("status = ?"); values.push(data.status); }
  if (data.home_score !== undefined) { fields.push("home_score = ?"); values.push(data.home_score); }
  if (data.away_score !== undefined) { fields.push("away_score = ?"); values.push(data.away_score); }
  if (data.notes !== undefined) { fields.push("notes = ?"); values.push(data.notes); }

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE games SET ${fields.join(", ")} WHERE id = ?;`, values);
}

export async function deleteGame(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM games WHERE id = ?;", [id]);
}
