import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTeamStore } from "@/stores/teamStore";
import { getDatabase } from "@/db/database";
import type { Player, Position } from "@/types/database";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

// ポジション別カラー
const POSITION_COLORS: Record<Position, string> = {
  PG: "#3b82f6", // 青
  SG: "#22c55e", // 緑
  SF: "#f97316", // 橙
  PF: "#ef4444", // 赤
  C: "#a855f7", // 紫
};

const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];

// --- スワイプ可能な選手行コンポーネント ---

function SwipeablePlayerRow({
  player,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
  onToggleActive: (id: string, active: boolean) => void;
}) {
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -80;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate((e) => {
      translateX.value = Math.min(0, Math.max(-160, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-160);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const tapGesture = Gesture.Tap().onStart(() => {
    if (translateX.value < -10) {
      translateX.value = withTiming(0);
    }
  });

  const composed = Gesture.Simultaneous(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isActive = player.is_active === 1;
  const posColor = player.position
    ? POSITION_COLORS[player.position]
    : "#9ca3af";

  return (
    <View className="mb-2 overflow-hidden rounded-lg">
      {/* 背面のアクションボタン */}
      <View className="absolute right-0 top-0 bottom-0 flex-row">
        <TouchableOpacity
          className="w-20 items-center justify-center"
          style={{ backgroundColor: "#3b82f6" }}
          onPress={() => {
            translateX.value = withTiming(0);
            runOnJS(onEdit)(player);
          }}
        >
          <Ionicons name="pencil" size={20} color="white" />
          <Text className="text-white text-xs mt-1">編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-20 items-center justify-center"
          style={{ backgroundColor: "#ef4444" }}
          onPress={() => {
            translateX.value = withTiming(0);
            runOnJS(onDelete)(player);
          }}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text className="text-white text-xs mt-1">削除</Text>
        </TouchableOpacity>
      </View>

      {/* 前面のカード */}
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[animatedStyle]}
          className={`flex-row items-center bg-white border border-gray-100 rounded-lg px-3 py-3 ${!isActive ? "opacity-50" : ""}`}
        >
          {/* 背番号 */}
          <View
            className="w-12 h-12 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: posColor + "1a" }}
          >
            <Text
              className="text-xl font-extrabold"
              style={{ color: posColor }}
            >
              {player.number}
            </Text>
          </View>

          {/* 選手情報 */}
          <View className="flex-1">
            <Text
              className={`text-base font-bold ${isActive ? "text-gray-800" : "text-gray-400"}`}
            >
              {player.name}
            </Text>
            <View className="flex-row items-center mt-0.5">
              {player.position && (
                <View
                  className="rounded px-1.5 py-0.5 mr-2"
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
              {!isActive && (
                <Text className="text-xs text-gray-400">非アクティブ</Text>
              )}
            </View>
          </View>

          {/* アクティブ切り替え */}
          <TouchableOpacity
            className="p-2"
            onPress={() => onToggleActive(player.id, !isActive)}
          >
            <Ionicons
              name={isActive ? "person" : "person-outline"}
              size={22}
              color={isActive ? "#f97316" : "#d1d5db"}
            />
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// --- メイン画面 ---

export default function PlayersScreen() {
  const {
    ownTeam,
    players,
    loadTeams,
    loadPlayers,
    addPlayer,
    editPlayer,
    removePlayer,
    togglePlayerActive,
  } = useTeamStore();

  const [isReady, setIsReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState<Position | null>(null);

  // 編集モード
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      await getDatabase();
      await loadTeams();
      await loadPlayers();
      setIsReady(true);
    })();
  }, []);

  // ownTeam が変わったら players を再読込
  useEffect(() => {
    if (ownTeam) {
      loadPlayers();
    }
  }, [ownTeam?.id]);

  const resetForm = useCallback(() => {
    setName("");
    setNumber("");
    setPosition(null);
    setEditingPlayer(null);
    setShowForm(false);
    Keyboard.dismiss();
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    const num = parseInt(number, 10);

    if (!trimmedName) {
      Alert.alert("エラー", "名前を入力してください");
      return;
    }
    if (isNaN(num) || num < 0 || num > 99) {
      Alert.alert("エラー", "背番号は0〜99の数字で入力してください");
      return;
    }

    // 背番号重複チェック（編集時は自分を除外）
    const duplicate = players.find(
      (p) => p.number === num && p.id !== editingPlayer?.id
    );
    if (duplicate) {
      Alert.alert(
        "背番号が重複しています",
        `#${num} は「${duplicate.name}」が使用中です`
      );
      return;
    }

    if (editingPlayer) {
      await editPlayer(editingPlayer.id, {
        name: trimmedName,
        number: num,
        position,
      });
    } else {
      await addPlayer({ name: trimmedName, number: num, position });
    }

    resetForm();
  }, [name, number, position, editingPlayer, players]);

  const handleEdit = useCallback((player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setNumber(String(player.number));
    setPosition(player.position);
    setShowForm(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, []);

  const handleDelete = useCallback(
    (player: Player) => {
      Alert.alert(
        "選手を削除",
        `#${player.number} ${player.name} を削除しますか？`,
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "削除",
            style: "destructive",
            onPress: () => removePlayer(player.id),
          },
        ]
      );
    },
    [removePlayer]
  );

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!ownTeam) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#f97316" />
        <Text className="mt-4 text-lg font-bold text-gray-800 text-center">
          チームが未登録です
        </Text>
        <Text className="mt-2 text-sm text-gray-500 text-center">
          先にチーム画面でチームを登録してください
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-50">
        {/* ヘッダ情報 */}
        <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-2">
              <Ionicons name="shield" size={16} color="white" />
            </View>
            <Text className="text-base font-bold text-gray-800">
              {ownTeam.name}
            </Text>
            <Text className="ml-2 text-sm text-gray-400">
              {players.filter((p) => p.is_active === 1).length}名
            </Text>
          </View>
          <TouchableOpacity
            className={`rounded-lg px-4 py-2 ${showForm ? "bg-gray-300" : "bg-orange-500"}`}
            onPress={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
                setTimeout(() => nameInputRef.current?.focus(), 100);
              }
            }}
          >
            <Text
              className={`font-bold text-sm ${showForm ? "text-gray-600" : "text-white"}`}
            >
              {showForm ? "閉じる" : "選手追加"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 追加/編集フォーム */}
        {showForm && (
          <View className="bg-white px-4 py-4 border-b border-gray-200">
            <Text className="text-sm font-bold text-gray-600 mb-3">
              {editingPlayer ? "選手を編集" : "新しい選手を追加"}
            </Text>

            <View className="flex-row mb-3">
              {/* 名前 */}
              <View className="flex-1 mr-2">
                <Text className="text-xs text-gray-400 mb-1">
                  名前 <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  ref={nameInputRef}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base bg-white"
                  placeholder="山田 太郎"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                />
              </View>

              {/* 背番号 */}
              <View className="w-20">
                <Text className="text-xs text-gray-400 mb-1">
                  背番号 <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base bg-white text-center"
                  placeholder="0"
                  value={number}
                  onChangeText={setNumber}
                  keyboardType="number-pad"
                  maxLength={2}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* ポジション選択 */}
            <View className="mb-3">
              <Text className="text-xs text-gray-400 mb-1">ポジション</Text>
              <View className="flex-row">
                {POSITIONS.map((pos) => {
                  const isSelected = position === pos;
                  const color = POSITION_COLORS[pos];
                  return (
                    <TouchableOpacity
                      key={pos}
                      className="mr-2 rounded-lg px-3 py-2 border"
                      style={{
                        backgroundColor: isSelected ? color + "20" : "#f9fafb",
                        borderColor: isSelected ? color : "#e5e7eb",
                      }}
                      onPress={() =>
                        setPosition(isSelected ? null : pos)
                      }
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: isSelected ? color : "#9ca3af",
                        }}
                      >
                        {pos}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ボタン */}
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-orange-500 rounded-lg py-3 items-center mr-2"
                onPress={handleSubmit}
              >
                <Text className="text-white font-bold">
                  {editingPlayer ? "更新" : "追加"}
                </Text>
              </TouchableOpacity>
              {editingPlayer && (
                <TouchableOpacity
                  className="bg-gray-200 rounded-lg px-4 py-3 items-center"
                  onPress={resetForm}
                >
                  <Text className="text-gray-600 font-bold">キャンセル</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 選手一覧 */}
        {players.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="person-add-outline" size={48} color="#d1d5db" />
            <Text className="mt-4 text-lg font-bold text-gray-400">
              選手を追加しましょう
            </Text>
            <Text className="mt-2 text-sm text-gray-300 text-center">
              上の「選手追加」ボタンから{"\n"}選手を登録できます
            </Text>
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <SwipeablePlayerRow
                player={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={(id, active) => togglePlayerActive(id, active)}
              />
            )}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}
