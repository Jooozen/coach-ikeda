import type { SQLiteBindValue } from "expo-sqlite";
import { getDatabase } from "../database";
import { generateUUID } from "../../utils/uuid";
import { nowISO } from "../../utils/datetime";
import type {
  GameEvent,
  GameEventInsert,
  GameEventUpdate,
  ActionType,
} from "../../types/database";

export async function createGameEvent(data: GameEventInsert): Promise<GameEvent> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = nowISO();

  const event: GameEvent = {
    id,
    game_id: data.game_id,
    team_id: data.team_id,
    player_id: data.player_id ?? null,
    action_type: data.action_type,
    quarter: data.quarter,
    game_clock: data.game_clock ?? null,
    shot_x: data.shot_x ?? null,
    shot_y: data.shot_y ?? null,
    is_and_one: data.is_and_one ?? 0,
    related_event_id: data.related_event_id ?? null,
    created_at: now,
    updated_at: now,
  };

  await db.runAsync(
    `INSERT INTO game_events
      (id, game_id, team_id, player_id, action_type, quarter, game_clock,
       shot_x, shot_y, is_and_one, related_event_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      event.id, event.game_id, event.team_id, event.player_id,
      event.action_type, event.quarter, event.game_clock,
      event.shot_x, event.shot_y, event.is_and_one,
      event.related_event_id, event.created_at, event.updated_at,
    ]
  );

  return event;
}

export async function getGameEventById(id: string): Promise<GameEvent | null> {
  const db = await getDatabase();
  return db.getFirstAsync<GameEvent>("SELECT * FROM game_events WHERE id = ?;", [id]);
}

export async function getEventsByGameId(gameId: string): Promise<GameEvent[]> {
  const db = await getDatabase();
  return db.getAllAsync<GameEvent>(
    "SELECT * FROM game_events WHERE game_id = ? ORDER BY quarter ASC, created_at ASC;",
    [gameId]
  );
}

export async function getEventsByGameAndQuarter(
  gameId: string,
  quarter: number
): Promise<GameEvent[]> {
  const db = await getDatabase();
  return db.getAllAsync<GameEvent>(
    "SELECT * FROM game_events WHERE game_id = ? AND quarter = ? ORDER BY created_at ASC;",
    [gameId, quarter]
  );
}

export async function getEventsByPlayer(
  gameId: string,
  playerId: string
): Promise<GameEvent[]> {
  const db = await getDatabase();
  return db.getAllAsync<GameEvent>(
    "SELECT * FROM game_events WHERE game_id = ? AND player_id = ? ORDER BY quarter ASC, created_at ASC;",
    [gameId, playerId]
  );
}

export async function getEventsByActionType(
  gameId: string,
  actionType: ActionType
): Promise<GameEvent[]> {
  const db = await getDatabase();
  return db.getAllAsync<GameEvent>(
    "SELECT * FROM game_events WHERE game_id = ? AND action_type = ? ORDER BY quarter ASC, created_at ASC;",
    [gameId, actionType]
  );
}

export async function getShotEvents(gameId: string): Promise<GameEvent[]> {
  const db = await getDatabase();
  return db.getAllAsync<GameEvent>(
    `SELECT * FROM game_events
     WHERE game_id = ?
       AND action_type IN ('FG2_MADE','FG2_MISS','FG3_MADE','FG3_MISS')
     ORDER BY quarter ASC, created_at ASC;`,
    [gameId]
  );
}

export async function updateGameEvent(id: string, data: GameEventUpdate): Promise<void> {
  const db = await getDatabase();
  const now = nowISO();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (data.team_id !== undefined) { fields.push("team_id = ?"); values.push(data.team_id); }
  if (data.player_id !== undefined) { fields.push("player_id = ?"); values.push(data.player_id); }
  if (data.action_type !== undefined) { fields.push("action_type = ?"); values.push(data.action_type); }
  if (data.quarter !== undefined) { fields.push("quarter = ?"); values.push(data.quarter); }
  if (data.game_clock !== undefined) { fields.push("game_clock = ?"); values.push(data.game_clock); }
  if (data.shot_x !== undefined) { fields.push("shot_x = ?"); values.push(data.shot_x); }
  if (data.shot_y !== undefined) { fields.push("shot_y = ?"); values.push(data.shot_y); }
  if (data.is_and_one !== undefined) { fields.push("is_and_one = ?"); values.push(data.is_and_one); }
  if (data.related_event_id !== undefined) { fields.push("related_event_id = ?"); values.push(data.related_event_id); }

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE game_events SET ${fields.join(", ")} WHERE id = ?;`, values);
}

export async function deleteGameEvent(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM game_events WHERE id = ?;", [id]);
}

export async function deleteEventsByGameId(gameId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM game_events WHERE game_id = ?;", [gameId]);
}
