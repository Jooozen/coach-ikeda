// ============================================================
// バスケットボールスタッツ記録アプリ — データベース型定義
// ============================================================

// --- 共通 ---

export type UUID = string;

export type Timestamp = string; // ISO 8601

// --- teams ---

export interface Team {
  id: UUID;
  name: string;
  is_own_team: number; // 0 | 1
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type TeamInsert = Omit<Team, "id" | "created_at" | "updated_at">;

export type TeamUpdate = Partial<Omit<Team, "id" | "created_at">> & {
  updated_at?: Timestamp;
};

// --- players ---

export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export interface Player {
  id: UUID;
  team_id: UUID;
  name: string;
  number: number;
  position: Position | null;
  is_active: number; // 0 | 1
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type PlayerInsert = Omit<Player, "id" | "created_at" | "updated_at"> & {
  is_active?: number;
};

export type PlayerUpdate = Partial<
  Omit<Player, "id" | "created_at">
> & {
  updated_at?: Timestamp;
};

// --- games ---

export type GameType = "official" | "practice" | "scrimmage";
export type GameStatus = "upcoming" | "live" | "finished";

export interface Game {
  id: UUID;
  home_team_id: UUID;
  away_team_id: UUID;
  game_date: string;
  game_type: GameType;
  tournament_name: string | null;
  quarter_minutes: number;
  total_quarters: number;
  status: GameStatus;
  home_score: number;
  away_score: number;
  notes: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type GameInsert = Omit<Game, "id" | "created_at" | "updated_at"> & {
  quarter_minutes?: number;
  total_quarters?: number;
  status?: GameStatus;
  home_score?: number;
  away_score?: number;
};

export type GameUpdate = Partial<Omit<Game, "id" | "created_at">> & {
  updated_at?: Timestamp;
};

// --- game_events ---

export type ActionType =
  // 得点系
  | "FG2_MADE"
  | "FG2_MISS"
  | "FG3_MADE"
  | "FG3_MISS"
  | "FT_MADE"
  | "FT_MISS"
  // その他
  | "REBOUND_OFF"
  | "REBOUND_DEF"
  | "ASSIST"
  | "STEAL"
  | "BLOCK"
  | "TURNOVER"
  | "FOUL"
  | "FOUL_TECHNICAL";

export interface GameEvent {
  id: UUID;
  game_id: UUID;
  team_id: UUID;
  player_id: UUID | null;
  action_type: ActionType;
  quarter: number;
  game_clock: string | null;
  shot_x: number | null;
  shot_y: number | null;
  is_and_one: number; // 0 | 1
  related_event_id: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type GameEventInsert = Omit<
  GameEvent,
  "id" | "created_at" | "updated_at"
> & {
  is_and_one?: number;
};

export type GameEventUpdate = Partial<
  Omit<GameEvent, "id" | "created_at">
> & {
  updated_at?: Timestamp;
};

// --- game_lineups ---

export interface GameLineup {
  id: UUID;
  game_id: UUID;
  player_id: UUID;
  quarter: number;
  check_in_time: string | null;
  check_out_time: string | null;
  is_starter: number; // 0 | 1
}

export type GameLineupInsert = Omit<GameLineup, "id"> & {
  is_starter?: number;
};

export type GameLineupUpdate = Partial<Omit<GameLineup, "id">>;

// --- player_game_stats ---

export interface PlayerGameStats {
  id: UUID;
  game_id: UUID;
  player_id: UUID;
  minutes: number;
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
  plus_minus: number;
  points: number;
}

export type PlayerGameStatsInsert = Omit<PlayerGameStats, "id"> & {
  minutes?: number;
  fg2_made?: number;
  fg2_attempted?: number;
  fg3_made?: number;
  fg3_attempted?: number;
  ft_made?: number;
  ft_attempted?: number;
  off_rebounds?: number;
  def_rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;
  plus_minus?: number;
  points?: number;
};

export type PlayerGameStatsUpdate = Partial<Omit<PlayerGameStats, "id">>;
