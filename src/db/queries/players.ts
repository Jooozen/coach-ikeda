import type { SQLiteBindValue } from "expo-sqlite";
import { getDatabase } from "../database";
import { generateUUID } from "../../utils/uuid";
import { nowISO } from "../../utils/datetime";
import type { Player, PlayerInsert, PlayerUpdate } from "../../types/database";

export async function createPlayer(data: PlayerInsert): Promise<Player> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = nowISO();
  const isActive = data.is_active ?? 1;

  await db.runAsync(
    `INSERT INTO players (id, team_id, name, number, position, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [id, data.team_id, data.name, data.number, data.position ?? null, isActive, now, now]
  );

  return {
    id,
    team_id: data.team_id,
    name: data.name,
    number: data.number,
    position: data.position ?? null,
    is_active: isActive,
    created_at: now,
    updated_at: now,
  };
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Player>("SELECT * FROM players WHERE id = ?;", [id]);
}

export async function getPlayersByTeamId(teamId: string): Promise<Player[]> {
  const db = await getDatabase();
  return db.getAllAsync<Player>(
    "SELECT * FROM players WHERE team_id = ? ORDER BY number ASC;",
    [teamId]
  );
}

export async function getActivePlayersByTeamId(teamId: string): Promise<Player[]> {
  const db = await getDatabase();
  return db.getAllAsync<Player>(
    "SELECT * FROM players WHERE team_id = ? AND is_active = 1 ORDER BY number ASC;",
    [teamId]
  );
}

export async function updatePlayer(id: string, data: PlayerUpdate): Promise<void> {
  const db = await getDatabase();
  const now = nowISO();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (data.team_id !== undefined) { fields.push("team_id = ?"); values.push(data.team_id); }
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.number !== undefined) { fields.push("number = ?"); values.push(data.number); }
  if (data.position !== undefined) { fields.push("position = ?"); values.push(data.position); }
  if (data.is_active !== undefined) { fields.push("is_active = ?"); values.push(data.is_active); }

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE players SET ${fields.join(", ")} WHERE id = ?;`, values);
}

export async function deletePlayer(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM players WHERE id = ?;", [id]);
}
