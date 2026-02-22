import { create } from "zustand";
import type { Team, Player, Position } from "@/types/database";
import {
  createTeam,
  getOwnTeam,
  getAllTeams,
  updateTeam,
  deleteTeam,
} from "@/db/queries/teams";
import {
  createPlayer,
  getPlayersByTeamId,
  updatePlayer,
  deletePlayer,
} from "@/db/queries/players";

interface TeamState {
  ownTeam: Team | null;
  opponents: Team[];
  players: Player[];
  isLoading: boolean;

  // チーム操作
  loadTeams: () => Promise<void>;
  createOwnTeam: (name: string) => Promise<void>;
  addOpponent: (name: string) => Promise<void>;
  editTeam: (id: string, name: string) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;

  // 選手操作
  loadPlayers: () => Promise<void>;
  addPlayer: (data: {
    name: string;
    number: number;
    position: Position | null;
  }) => Promise<void>;
  editPlayer: (
    id: string,
    data: { name?: string; number?: number; position?: Position | null }
  ) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  togglePlayerActive: (id: string, isActive: boolean) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  ownTeam: null,
  opponents: [],
  players: [],
  isLoading: false,

  loadTeams: async () => {
    set({ isLoading: true });
    try {
      const own = await getOwnTeam();
      const all = await getAllTeams();
      set({
        ownTeam: own ?? null,
        opponents: all.filter((t) => !t.is_own_team),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createOwnTeam: async (name) => {
    const team = await createTeam({ name, is_own_team: 1 });
    set({ ownTeam: team });
  },

  addOpponent: async (name) => {
    const team = await createTeam({ name, is_own_team: 0 });
    set((s) => ({ opponents: [...s.opponents, team] }));
  },

  editTeam: async (id, name) => {
    await updateTeam(id, { name });
    const { ownTeam } = get();
    if (ownTeam?.id === id) {
      set({ ownTeam: { ...ownTeam, name } });
    } else {
      set((s) => ({
        opponents: s.opponents.map((t) => (t.id === id ? { ...t, name } : t)),
      }));
    }
  },

  removeTeam: async (id) => {
    await deleteTeam(id);
    set((s) => ({ opponents: s.opponents.filter((t) => t.id !== id) }));
  },

  loadPlayers: async () => {
    const { ownTeam } = get();
    if (!ownTeam) {
      set({ players: [] });
      return;
    }
    const players = await getPlayersByTeamId(ownTeam.id);
    set({ players });
  },

  addPlayer: async ({ name, number, position }) => {
    const { ownTeam } = get();
    if (!ownTeam) return;
    const player = await createPlayer({
      team_id: ownTeam.id,
      name,
      number,
      position,
    });
    set((s) => ({
      players: [...s.players, player].sort((a, b) => a.number - b.number),
    }));
  },

  editPlayer: async (id, data) => {
    await updatePlayer(id, data);
    set((s) => ({
      players: s.players
        .map((p) => (p.id === id ? { ...p, ...data } : p))
        .sort((a, b) => a.number - b.number),
    }));
  },

  removePlayer: async (id) => {
    await deletePlayer(id);
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
  },

  togglePlayerActive: async (id, isActive) => {
    const val = isActive ? 1 : 0;
    await updatePlayer(id, { is_active: val });
    set((s) => ({
      players: s.players.map((p) =>
        p.id === id ? { ...p, is_active: val } : p
      ),
    }));
  },
}));
