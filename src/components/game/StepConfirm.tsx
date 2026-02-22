import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "@/stores/gameStore";
import { useTeamStore } from "@/stores/teamStore";
import type { Position } from "@/types/database";

const POSITION_COLORS: Record<Position, string> = {
  PG: "#3b82f6",
  SG: "#22c55e",
  SF: "#f97316",
  PF: "#ef4444",
  C: "#a855f7",
};

const GAME_TYPE_LABELS = {
  official: "公式戦",
  practice: "練習試合",
  scrimmage: "紅白戦",
} as const;

interface Props {
  opponentName: string;
  onBack: () => void;
  onStart: () => void;
}

export default function StepConfirm({ opponentName, onBack, onStart }: Props) {
  const {
    gameType,
    isHome,
    tournamentName,
    gameDate,
    quarterMinutes,
    totalQuarters,
    starterIds,
  } = useGameStore();

  const { ownTeam, players } = useTeamStore();
  const [isCreating, setIsCreating] = useState(false);

  const isScrimmage = gameType === "scrimmage";
  const starters = players.filter((p) => starterIds.includes(p.id));

  const handleStart = async () => {
    setIsCreating(true);
    try {
      await onStart();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="px-4 pt-5 pb-2">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            試合内容の確認
          </Text>
        </View>

        {/* カード: 対戦カード */}
        <View className="mx-4 mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* 試合種別 */}
          <View className="px-4 py-2 bg-orange-50 border-b border-orange-100">
            <Text className="text-sm font-bold text-orange-600">
              {GAME_TYPE_LABELS[gameType]}
            </Text>
          </View>

          {/* 対戦カード */}
          <View className="px-4 py-4">
            {isScrimmage ? (
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-800">
                  {ownTeam?.name ?? ""}
                </Text>
                <Text className="text-sm text-gray-400 mt-1">紅白戦</Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                <View className="flex-1 items-center">
                  <Text className="text-xs text-gray-400 mb-1">
                    {isHome ? "HOME" : "AWAY"}
                  </Text>
                  <Text className="text-base font-bold text-gray-800">
                    {ownTeam?.name ?? ""}
                  </Text>
                </View>
                <View className="px-3">
                  <Text className="text-lg font-bold text-gray-300">VS</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-xs text-gray-400 mb-1">
                    {isHome ? "AWAY" : "HOME"}
                  </Text>
                  <Text className="text-base font-bold text-gray-800">
                    {opponentName}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 詳細情報 */}
        <View className="mx-4 mt-3 bg-white rounded-xl border border-gray-200">
          <ConfirmRow label="試合日" value={gameDate} />
          {tournamentName ? (
            <ConfirmRow label="大会名" value={tournamentName} />
          ) : null}
          <ConfirmRow
            label="クォーター"
            value={`${quarterMinutes}分 × ${totalQuarters}Q`}
          />
          {!isScrimmage && (
            <ConfirmRow
              label="ホーム/アウェイ"
              value={isHome ? "ホーム" : "アウェイ"}
              isLast
            />
          )}
        </View>

        {/* スターティング5 */}
        {!isScrimmage && starters.length > 0 && (
          <View className="mx-4 mt-3">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              スターティング5
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {starters.map((player, idx) => {
                const posColor = player.position
                  ? POSITION_COLORS[player.position]
                  : "#9ca3af";
                return (
                  <View
                    key={player.id}
                    className={`flex-row items-center px-4 py-2.5 ${
                      idx < starters.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <View
                      className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: posColor + "1a" }}
                    >
                      <Text
                        className="text-base font-extrabold"
                        style={{ color: posColor }}
                      >
                        {player.number}
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-gray-800 flex-1">
                      {player.name}
                    </Text>
                    {player.position && (
                      <View
                        className="rounded px-1.5 py-0.5"
                        style={{ backgroundColor: posColor + "20" }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: posColor }}
                        >
                          {player.position}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* 試合開始ボタン */}
      <View className="px-4 py-4 border-t border-gray-200 bg-white flex-row">
        <TouchableOpacity
          className="rounded-xl py-4 items-center bg-gray-200 mr-3 px-6"
          onPress={onBack}
          disabled={isCreating}
        >
          <Text className="text-gray-600 font-bold text-base">戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 rounded-xl py-4 items-center flex-row justify-center ${
            isCreating ? "bg-orange-300" : "bg-orange-500"
          }`}
          onPress={handleStart}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                試合開始
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ConfirmRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row justify-between px-4 py-3 ${
        isLast ? "" : "border-b border-gray-100"
      }`}
    >
      <Text className="text-sm text-gray-400">{label}</Text>
      <Text className="text-sm font-bold text-gray-800">{value}</Text>
    </View>
  );
}
