import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "@/stores/gameStore";
import { useTeamStore } from "@/stores/teamStore";
import type { GameType } from "@/types/database";

const GAME_TYPES: { value: GameType; label: string; icon: string }[] = [
  { value: "official", label: "公式戦", icon: "trophy" },
  { value: "practice", label: "練習試合", icon: "basketball" },
  { value: "scrimmage", label: "紅白戦", icon: "swap-horizontal" },
];

interface Props {
  onNext: () => void;
}

export default function StepGameType({ onNext }: Props) {
  const {
    gameType,
    opponentTeamId,
    newOpponentName,
    isHome,
    setGameType,
    setOpponentTeamId,
    setNewOpponentName,
    setIsHome,
  } = useGameStore();

  const { opponents, ownTeam } = useTeamStore();
  const [showNewOpponent, setShowNewOpponent] = useState(false);

  const isScrimmage = gameType === "scrimmage";

  const canProceed = isScrimmage
    ? true
    : opponentTeamId !== null || newOpponentName.trim() !== "";

  return (
    <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
      {/* 試合種別 */}
      <View className="px-4 pt-5 pb-3">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          試合種別
        </Text>
        <View className="flex-row">
          {GAME_TYPES.map((t) => {
            const selected = gameType === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                className={`flex-1 rounded-xl py-4 items-center mr-2 border ${
                  selected
                    ? "bg-orange-50 border-orange-400"
                    : "bg-white border-gray-200"
                }`}
                style={t.value === "scrimmage" ? { marginRight: 0 } : undefined}
                onPress={() => {
                  setGameType(t.value);
                  if (t.value === "scrimmage") {
                    setOpponentTeamId(null);
                    setNewOpponentName("");
                  }
                }}
              >
                <Ionicons
                  name={t.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={selected ? "#f97316" : "#9ca3af"}
                />
                <Text
                  className={`mt-1 text-sm font-bold ${
                    selected ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 対戦相手選択（紅白戦以外） */}
      {!isScrimmage && (
        <View className="px-4 pt-3 pb-3">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            対戦相手
          </Text>

          {/* 既存チーム一覧 */}
          {opponents.length > 0 && (
            <View className="mb-3">
              {opponents.map((team) => {
                const selected = opponentTeamId === team.id;
                return (
                  <TouchableOpacity
                    key={team.id}
                    className={`flex-row items-center rounded-lg px-4 py-3 mb-2 border ${
                      selected
                        ? "bg-orange-50 border-orange-400"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => {
                      setOpponentTeamId(selected ? null : team.id);
                      setNewOpponentName("");
                      setShowNewOpponent(false);
                    }}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        selected ? "bg-orange-500" : "bg-gray-200"
                      }`}
                    >
                      <Ionicons
                        name="shield-outline"
                        size={16}
                        color={selected ? "white" : "#6b7280"}
                      />
                    </View>
                    <Text
                      className={`text-base ${
                        selected ? "font-bold text-orange-600" : "text-gray-700"
                      }`}
                    >
                      {team.name}
                    </Text>
                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#f97316"
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* 新規追加 */}
          {showNewOpponent || opponents.length === 0 ? (
            <View className="bg-white rounded-lg px-4 py-3 border border-gray-200">
              <Text className="text-xs text-gray-400 mb-1">新しいチーム名</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                placeholder="相手チーム名を入力"
                value={newOpponentName}
                onChangeText={(v) => {
                  setNewOpponentName(v);
                  setOpponentTeamId(null);
                }}
                autoFocus={opponents.length === 0}
                returnKeyType="done"
              />
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-center py-3 border border-dashed border-gray-300 rounded-lg"
              onPress={() => {
                setShowNewOpponent(true);
                setOpponentTeamId(null);
              }}
            >
              <Ionicons name="add" size={20} color="#9ca3af" />
              <Text className="ml-1 text-sm text-gray-400 font-bold">
                新しいチームを追加
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ホーム/アウェイ選択（紅白戦以外） */}
      {!isScrimmage && ownTeam && (
        <View className="px-4 pt-3 pb-3">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            ホーム / アウェイ
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 items-center mr-2 border ${
                isHome
                  ? "bg-orange-50 border-orange-400"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => setIsHome(true)}
            >
              <Text
                className={`text-base font-bold ${
                  isHome ? "text-orange-500" : "text-gray-400"
                }`}
              >
                ホーム
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {ownTeam.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 items-center border ${
                !isHome
                  ? "bg-orange-50 border-orange-400"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => setIsHome(false)}
            >
              <Text
                className={`text-base font-bold ${
                  !isHome ? "text-orange-500" : "text-gray-400"
                }`}
              >
                アウェイ
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {ownTeam.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 次へボタン */}
      <View className="px-4 pt-4 pb-8">
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${
            canProceed ? "bg-orange-500" : "bg-gray-300"
          }`}
          onPress={onNext}
          disabled={!canProceed}
        >
          <Text className="text-white font-bold text-base">次へ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
