import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "@/stores/gameStore";
import { useTeamStore } from "@/stores/teamStore";
import type { Player, Position } from "@/types/database";

const POSITION_COLORS: Record<Position, string> = {
  PG: "#3b82f6",
  SG: "#22c55e",
  SF: "#f97316",
  PF: "#ef4444",
  C: "#a855f7",
};

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function StepScrimmageTeams({ onNext, onBack }: Props) {
  const {
    teamAPlayerIds,
    teamBPlayerIds,
    assignToTeamA,
    assignToTeamB,
    removeFromScrimmageTeam,
  } = useGameStore();
  const { players } = useTeamStore();

  const activePlayers = players.filter((p) => p.is_active === 1);

  const teamAPlayers = activePlayers.filter((p) =>
    teamAPlayerIds.includes(p.id)
  );
  const teamBPlayers = activePlayers.filter((p) =>
    teamBPlayerIds.includes(p.id)
  );
  const unassigned = activePlayers.filter(
    (p) =>
      !teamAPlayerIds.includes(p.id) && !teamBPlayerIds.includes(p.id)
  );

  const canProceed =
    teamAPlayerIds.length >= 5 && teamBPlayerIds.length >= 5;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
        {/* 説明 */}
        <View className="px-4 pt-5 pb-2">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            紅白戦 チーム振り分け
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            選手をタップしてA/Bチームに振り分けてください
          </Text>
        </View>

        {/* Aチーム */}
        <View className="px-4 pt-3">
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">A</Text>
            </View>
            <Text className="text-sm font-bold text-red-600">
              Aチーム ({teamAPlayers.length}名)
            </Text>
          </View>
          <View className="bg-red-50 rounded-lg p-2 min-h-[60px] border border-red-200">
            {teamAPlayers.length === 0 ? (
              <Text className="text-red-300 text-sm text-center py-3">
                下の一覧から選手を追加
              </Text>
            ) : (
              <View className="flex-row flex-wrap">
                {teamAPlayers.map((p) => (
                  <ScrimmagePlayerChip
                    key={p.id}
                    player={p}
                    color="#ef4444"
                    onRemove={() => removeFromScrimmageTeam(p.id)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Bチーム */}
        <View className="px-4 pt-3">
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">B</Text>
            </View>
            <Text className="text-sm font-bold text-blue-600">
              Bチーム ({teamBPlayers.length}名)
            </Text>
          </View>
          <View className="bg-blue-50 rounded-lg p-2 min-h-[60px] border border-blue-200">
            {teamBPlayers.length === 0 ? (
              <Text className="text-blue-300 text-sm text-center py-3">
                下の一覧から選手を追加
              </Text>
            ) : (
              <View className="flex-row flex-wrap">
                {teamBPlayers.map((p) => (
                  <ScrimmagePlayerChip
                    key={p.id}
                    player={p}
                    color="#3b82f6"
                    onRemove={() => removeFromScrimmageTeam(p.id)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 未割り当て */}
        <View className="px-4 pt-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            未割り当て ({unassigned.length}名)
          </Text>
          {unassigned.map((player) => (
            <UnassignedPlayerRow
              key={player.id}
              player={player}
              onAssignA={() => assignToTeamA(player.id)}
              onAssignB={() => assignToTeamB(player.id)}
            />
          ))}
          {unassigned.length === 0 && (
            <Text className="text-sm text-gray-300 text-center py-3">
              全員振り分け済み
            </Text>
          )}
        </View>
      </ScrollView>

      {/* ナビゲーションボタン */}
      <View className="px-4 py-4 border-t border-gray-200 bg-white flex-row">
        <TouchableOpacity
          className="rounded-xl py-4 items-center bg-gray-200 mr-3 px-6"
          onPress={onBack}
        >
          <Text className="text-gray-600 font-bold text-base">戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 rounded-xl py-4 items-center ${
            canProceed ? "bg-orange-500" : "bg-gray-300"
          }`}
          onPress={onNext}
          disabled={!canProceed}
        >
          <Text className="text-white font-bold text-base">確認画面へ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- チップ表示 ---

function ScrimmagePlayerChip({
  player,
  color,
  onRemove,
}: {
  player: Player;
  color: string;
  onRemove: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center rounded-full px-2 py-1 mr-1 mb-1"
      style={{ backgroundColor: color + "20" }}
      onPress={onRemove}
    >
      <Text className="text-sm font-bold mr-1" style={{ color }}>
        #{player.number}
      </Text>
      <Text className="text-sm" style={{ color }}>
        {player.name}
      </Text>
      <Ionicons
        name="close-circle"
        size={16}
        color={color}
        style={{ marginLeft: 4 }}
      />
    </TouchableOpacity>
  );
}

// --- 未割り当て選手行 ---

function UnassignedPlayerRow({
  player,
  onAssignA,
  onAssignB,
}: {
  player: Player;
  onAssignA: () => void;
  onAssignB: () => void;
}) {
  const posColor = player.position
    ? POSITION_COLORS[player.position]
    : "#9ca3af";

  return (
    <View className="flex-row items-center bg-white rounded-lg px-3 py-2 mb-2 border border-gray-100">
      {/* 背番号 */}
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-2"
        style={{ backgroundColor: posColor + "1a" }}
      >
        <Text className="text-lg font-extrabold" style={{ color: posColor }}>
          {player.number}
        </Text>
      </View>

      <Text className="flex-1 text-sm font-bold text-gray-800">
        {player.name}
      </Text>

      {/* A/B 振り分けボタン */}
      <TouchableOpacity
        className="w-9 h-9 rounded-full bg-red-100 items-center justify-center mr-2"
        onPress={onAssignA}
      >
        <Text className="text-red-600 text-xs font-bold">A</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center"
        onPress={onAssignB}
      >
        <Text className="text-blue-600 text-xs font-bold">B</Text>
      </TouchableOpacity>
    </View>
  );
}
