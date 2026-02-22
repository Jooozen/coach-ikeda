// ============================================================
// SQLite テーブル定義 (DDL)
// ============================================================

export const CREATE_TEAMS = `
CREATE TABLE IF NOT EXISTS teams (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  is_own_team INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
`;

export const CREATE_PLAYERS = `
CREATE TABLE IF NOT EXISTS players (
  id          TEXT PRIMARY KEY,
  team_id     TEXT NOT NULL REFERENCES teams(id),
  name        TEXT DEFAULT '',
  number      INTEGER NOT NULL,
  position    TEXT,
  is_active   INTEGER DEFAULT 1,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
`;

export const CREATE_GAMES = `
CREATE TABLE IF NOT EXISTS games (
  id              TEXT PRIMARY KEY,
  home_team_id    TEXT NOT NULL REFERENCES teams(id),
  away_team_id    TEXT NOT NULL REFERENCES teams(id),
  game_date       TEXT NOT NULL,
  game_type       TEXT NOT NULL,
  tournament_name TEXT,
  quarter_minutes INTEGER DEFAULT 10,
  total_quarters  INTEGER DEFAULT 4,
  status          TEXT DEFAULT 'upcoming',
  home_score      INTEGER DEFAULT 0,
  away_score      INTEGER DEFAULT 0,
  notes           TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
`;

export const CREATE_GAME_EVENTS = `
CREATE TABLE IF NOT EXISTS game_events (
  id               TEXT PRIMARY KEY,
  game_id          TEXT NOT NULL REFERENCES games(id),
  team_id          TEXT NOT NULL REFERENCES teams(id),
  player_id        TEXT REFERENCES players(id),
  action_type      TEXT NOT NULL,
  quarter          INTEGER NOT NULL,
  game_clock       TEXT,
  shot_x           REAL,
  shot_y           REAL,
  is_and_one       INTEGER DEFAULT 0,
  related_event_id TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
`;

export const CREATE_GAME_LINEUPS = `
CREATE TABLE IF NOT EXISTS game_lineups (
  id             TEXT PRIMARY KEY,
  game_id        TEXT NOT NULL REFERENCES games(id),
  team_id        TEXT NOT NULL REFERENCES teams(id),
  player_id      TEXT NOT NULL REFERENCES players(id),
  quarter        INTEGER NOT NULL,
  check_in_time  TEXT,
  check_out_time TEXT,
  is_starter     INTEGER DEFAULT 0
);
`;

export const CREATE_PLAYER_GAME_STATS = `
CREATE TABLE IF NOT EXISTS player_game_stats (
  id            TEXT PRIMARY KEY,
  game_id       TEXT NOT NULL REFERENCES games(id),
  team_id       TEXT NOT NULL REFERENCES teams(id),
  player_id     TEXT NOT NULL REFERENCES players(id),
  minutes       REAL    DEFAULT 0,
  fg2_made      INTEGER DEFAULT 0,
  fg2_attempted INTEGER DEFAULT 0,
  fg3_made      INTEGER DEFAULT 0,
  fg3_attempted INTEGER DEFAULT 0,
  ft_made       INTEGER DEFAULT 0,
  ft_attempted  INTEGER DEFAULT 0,
  off_rebounds  INTEGER DEFAULT 0,
  def_rebounds  INTEGER DEFAULT 0,
  assists       INTEGER DEFAULT 0,
  steals        INTEGER DEFAULT 0,
  blocks        INTEGER DEFAULT 0,
  turnovers     INTEGER DEFAULT 0,
  fouls         INTEGER DEFAULT 0,
  plus_minus    INTEGER DEFAULT 0,
  points        INTEGER DEFAULT 0
);
`;

// --- インデックス ---

export const CREATE_INDEXES = [
  "CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_players_team_number ON players(team_id, number);",
  "CREATE INDEX IF NOT EXISTS idx_games_home_team ON games(home_team_id);",
  "CREATE INDEX IF NOT EXISTS idx_games_away_team ON games(away_team_id);",
  "CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);",
  "CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);",
  "CREATE INDEX IF NOT EXISTS idx_game_events_game ON game_events(game_id);",
  "CREATE INDEX IF NOT EXISTS idx_game_events_player ON game_events(player_id);",
  "CREATE INDEX IF NOT EXISTS idx_game_events_team ON game_events(team_id);",
  "CREATE INDEX IF NOT EXISTS idx_game_events_action ON game_events(action_type);",
  "CREATE INDEX IF NOT EXISTS idx_game_events_quarter ON game_events(game_id, quarter);",
  "CREATE INDEX IF NOT EXISTS idx_game_events_game_team ON game_events(game_id, team_id);",
  "CREATE INDEX IF NOT EXISTS idx_game_lineups_game ON game_lineups(game_id);",
  "CREATE INDEX IF NOT EXISTS idx_game_lineups_player ON game_lineups(player_id);",
  "CREATE INDEX IF NOT EXISTS idx_game_lineups_game_quarter ON game_lineups(game_id, quarter);",
  "CREATE INDEX IF NOT EXISTS idx_game_lineups_game_team ON game_lineups(game_id, team_id);",
  "CREATE INDEX IF NOT EXISTS idx_player_game_stats_game ON player_game_stats(game_id);",
  "CREATE INDEX IF NOT EXISTS idx_player_game_stats_player ON player_game_stats(player_id);",
  "CREATE INDEX IF NOT EXISTS idx_player_game_stats_game_team ON player_game_stats(game_id, team_id);",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_player_game_stats_unique ON player_game_stats(game_id, player_id);",
];

// テーブル作成SQL一覧（順序依存）
export const ALL_CREATE_TABLES = [
  CREATE_TEAMS,
  CREATE_PLAYERS,
  CREATE_GAMES,
  CREATE_GAME_EVENTS,
  CREATE_GAME_LINEUPS,
  CREATE_PLAYER_GAME_STATS,
];
