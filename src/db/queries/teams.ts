import type { SQLiteBindValue } from "expo-sqlite";
import { getDatabase } from "../database";
import { generateUUID } from "../../utils/uuid";
import { nowISO } from "../../utils/datetime";
import type { Team, TeamInsert, TeamUpdate } from "../../types/database";

export async function createTeam(data: TeamInsert): Promise<Team> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = nowISO();

  await db.runAsync(
    `INSERT INTO teams (id, name, is_own_team, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?);`,
    [id, data.name, data.is_own_team ?? 0, now, now]
  );

  return { id, name: data.name, is_own_team: data.is_own_team ?? 0, created_at: now, updated_at: now };
}

export async function getTeamById(id: string): Promise<Team | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Team>("SELECT * FROM teams WHERE id = ?;", [id]);
}

export async function getAllTeams(): Promise<Team[]> {
  const db = await getDatabase();
  return db.getAllAsync<Team>("SELECT * FROM teams ORDER BY is_own_team DESC, name ASC;");
}

export async function getOwnTeam(): Promise<Team | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Team>("SELECT * FROM teams WHERE is_own_team = 1 LIMIT 1;");
}

export async function updateTeam(id: string, data: TeamUpdate): Promise<void> {
  const db = await getDatabase();
  const now = nowISO();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.is_own_team !== undefined) { fields.push("is_own_team = ?"); values.push(data.is_own_team); }

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE teams SET ${fields.join(", ")} WHERE id = ?;`, values);
}

export async function deleteTeam(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM teams WHERE id = ?;", [id]);
}
