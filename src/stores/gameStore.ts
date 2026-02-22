import { create } from "zustand";
import type {
  Game,
  GameType,
  GameStatus,
  Player,
} from "@/types/database";
import { createGame } from "@/db/queries/games";
import { createGameLineup } from "@/db/queries/gameLineups";

// --- 試合作成ウィザードの状態 ---

export interface GameCreateState {
  // Step 1: 試合種別・対戦相手
  gameType: GameType;
  opponentTeamId: string | null;
  newOpponentName: string;
  isHome: boolean;

  // 紅白戦用: A/B チーム振り分け
  teamAPlayerIds: string[];
  teamBPlayerIds: string[];

  // Step 2: 大会名・日時・クォーター設定
  tournamentName: string;
  gameDate: string; // YYYY-MM-DD
  quarterMinutes: number;
  totalQuarters: number;

  // Step 3: スターティング5
  starterIds: string[];

  // ウィザード制御
  currentStep: number;
}

interface GameStoreState extends GameCreateState {
  // ウィザード操作
  setGameType: (type: GameType) => void;
  setOpponentTeamId: (id: string | null) => void;
  setNewOpponentName: (name: string) => void;
  setIsHome: (isHome: boolean) => void;
  setTournamentName: (name: string) => void;
  setGameDate: (date: string) => void;
  setQuarterMinutes: (minutes: number) => void;
  setTotalQuarters: (quarters: number) => void;

  // 紅白戦の選手振り分け
  assignToTeamA: (playerId: string) => void;
  assignToTeamB: (playerId: string) => void;
  removeFromScrimmageTeam: (playerId: string) => void;

  // スターター選択
  toggleStarter: (playerId: string) => void;

  // ステップ制御
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // 試合作成
  createNewGame: (
    homeTeamId: string,
    awayTeamId: string
  ) => Promise<Game>;

  // リセット
  resetWizard: () => void;
}

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const initialState: GameCreateState = {
  gameType: "official",
  opponentTeamId: null,
  newOpponentName: "",
  isHome: true,
  teamAPlayerIds: [],
  teamBPlayerIds: [],
  tournamentName: "",
  gameDate: todayStr(),
  quarterMinutes: 10,
  totalQuarters: 4,
  starterIds: [],
  currentStep: 0,
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...initialState,

  setGameType: (gameType) => set({ gameType }),
  setOpponentTeamId: (opponentTeamId) => set({ opponentTeamId }),
  setNewOpponentName: (newOpponentName) => set({ newOpponentName }),
  setIsHome: (isHome) => set({ isHome }),
  setTournamentName: (tournamentName) => set({ tournamentName }),
  setGameDate: (gameDate) => set({ gameDate }),
  setQuarterMinutes: (quarterMinutes) => set({ quarterMinutes }),
  setTotalQuarters: (totalQuarters) => set({ totalQuarters }),

  assignToTeamA: (playerId) =>
    set((s) => ({
      teamAPlayerIds: s.teamAPlayerIds.includes(playerId)
        ? s.teamAPlayerIds
        : [...s.teamAPlayerIds, playerId],
      teamBPlayerIds: s.teamBPlayerIds.filter((id) => id !== playerId),
    })),

  assignToTeamB: (playerId) =>
    set((s) => ({
      teamBPlayerIds: s.teamBPlayerIds.includes(playerId)
        ? s.teamBPlayerIds
        : [...s.teamBPlayerIds, playerId],
      teamAPlayerIds: s.teamAPlayerIds.filter((id) => id !== playerId),
    })),

  removeFromScrimmageTeam: (playerId) =>
    set((s) => ({
      teamAPlayerIds: s.teamAPlayerIds.filter((id) => id !== playerId),
      teamBPlayerIds: s.teamBPlayerIds.filter((id) => id !== playerId),
    })),

  toggleStarter: (playerId) =>
    set((s) => {
      if (s.starterIds.includes(playerId)) {
        return { starterIds: s.starterIds.filter((id) => id !== playerId) };
      }
      if (s.starterIds.length >= 5) return s;
      return { starterIds: [...s.starterIds, playerId] };
    }),

  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  goToStep: (step) => set({ currentStep: step }),

  createNewGame: async (homeTeamId, awayTeamId) => {
    const s = get();
    const game = await createGame({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      game_date: s.gameDate,
      game_type: s.gameType,
      tournament_name: s.tournamentName || null,
      quarter_minutes: s.quarterMinutes,
      total_quarters: s.totalQuarters,
      status: "live" as GameStatus,
      home_score: 0,
      away_score: 0,
      notes: null,
    });

    // スターターのラインナップを登録
    for (const playerId of s.starterIds) {
      await createGameLineup({
        game_id: game.id,
        team_id: homeTeamId,
        player_id: playerId,
        quarter: 1,
        check_in_time: `${String(s.quarterMinutes).padStart(2, "0")}:00`,
        check_out_time: null,
        is_starter: 1,
      });
    }

    return game;
  },

  resetWizard: () => set(initialState),
}));
