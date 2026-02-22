import { View, Text, TouchableOpacity, FlatList } from "react-native";
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

export default function StepStarters({ onNext, onBack }: Props) {
  const { gameType, starterIds, toggleStarter } = useGameStore();
  const { players } = useTeamStore();

  const activePlayers = players.filter((p) => p.is_active === 1);
  const isScrimmage = gameType === "scrimmage";

  const canProceed = isScrimmage || starterIds.length === 5;

  return (
    <View className="flex-1 bg-gray-50">
      {/* ヘッダ */}
      <View className="px-4 pt-5 pb-2">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          スターティング5を選択
        </Text>
        <Text className="text-sm text-gray-400 mt-1">
          {starterIds.length}/5 人選択中
        </Text>
      </View>

      {/* 選手一覧 */}
      {activePlayers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="person-add-outline" size={48} color="#d1d5db" />
          <Text className="mt-4 text-base text-gray-400 text-center">
            アクティブな選手がいません{"\n"}チーム画面で選手を追加してください
          </Text>
        </View>
      ) : (
        <FlatList
          data={activePlayers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <PlayerSelectRow
              player={item}
              isSelected={starterIds.includes(item.id)}
              onToggle={() => toggleStarter(item.id)}
              disabled={
                !starterIds.includes(item.id) && starterIds.length >= 5
              }
            />
          )}
        />
      )}

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

// --- 選手選択行 ---

function PlayerSelectRow({
  player,
  isSelected,
  onToggle,
  disabled,
}: {
  player: Player;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const posColor = player.position
    ? POSITION_COLORS[player.position]
    : "#9ca3af";

  return (
    <TouchableOpacity
      className={`flex-row items-center rounded-lg px-3 py-3 mb-2 border ${
        isSelected
          ? "bg-orange-50 border-orange-400"
          : disabled
            ? "bg-gray-50 border-gray-100 opacity-40"
            : "bg-white border-gray-100"
      }`}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* 背番号 */}
      <View
        className="w-12 h-12 rounded-lg items-center justify-center mr-3"
        style={{
          backgroundColor: isSelected ? "#f97316" + "20" : posColor + "1a",
        }}
      >
        <Text
          className="text-xl font-extrabold"
          style={{ color: isSelected ? "#f97316" : posColor }}
        >
          {player.number}
        </Text>
      </View>

      {/* 選手情報 */}
      <View className="flex-1">
        <Text
          className={`text-base font-bold ${
            isSelected ? "text-orange-600" : "text-gray-800"
          }`}
        >
          {player.name}
        </Text>
        {player.position && (
          <View
            className="rounded px-1.5 py-0.5 self-start mt-0.5"
            style={{ backgroundColor: posColor + "20" }}
          >
            <Text className="text-xs font-bold" style={{ color: posColor }}>
              {player.position}
            </Text>
          </View>
        )}
      </View>

      {/* チェックマーク */}
      <View
        className={`w-7 h-7 rounded-full items-center justify-center border-2 ${
          isSelected
            ? "bg-orange-500 border-orange-500"
            : "border-gray-300"
        }`}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={18} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );
}
