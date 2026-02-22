import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useGameStore } from "@/stores/gameStore";

const QUARTER_MINUTES_OPTIONS = [5, 6, 7, 8, 10];
const QUARTER_COUNT_OPTIONS = [1, 2, 3, 4];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function StepDetails({ onNext, onBack }: Props) {
  const {
    gameType,
    tournamentName,
    gameDate,
    quarterMinutes,
    totalQuarters,
    setTournamentName,
    setGameDate,
    setQuarterMinutes,
    setTotalQuarters,
  } = useGameStore();

  const isOfficial = gameType === "official";

  return (
    <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
      {/* 大会名 */}
      <View className="px-4 pt-5 pb-3">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          大会名{isOfficial ? "" : "（任意）"}
        </Text>
        <View className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <TextInput
            className="text-base text-gray-800"
            placeholder={
              isOfficial
                ? "例: 関東大会 予選リーグ"
                : "大会名があれば入力"
            }
            value={tournamentName}
            onChangeText={setTournamentName}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* 試合日 */}
      <View className="px-4 pt-3 pb-3">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          試合日
        </Text>
        <View className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <TextInput
            className="text-base text-gray-800"
            placeholder="YYYY-MM-DD"
            value={gameDate}
            onChangeText={setGameDate}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
          />
        </View>
        <Text className="text-xs text-gray-300 mt-1 ml-1">
          形式: YYYY-MM-DD
        </Text>
      </View>

      {/* クォーターの分数 */}
      <View className="px-4 pt-3 pb-3">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          1クォーターの時間
        </Text>
        <View className="flex-row">
          {QUARTER_MINUTES_OPTIONS.map((min) => {
            const selected = quarterMinutes === min;
            return (
              <TouchableOpacity
                key={min}
                className={`flex-1 rounded-xl py-3 items-center mr-2 border ${
                  selected
                    ? "bg-orange-50 border-orange-400"
                    : "bg-white border-gray-200"
                }`}
                style={min === 10 ? { marginRight: 0 } : undefined}
                onPress={() => setQuarterMinutes(min)}
              >
                <Text
                  className={`text-base font-bold ${
                    selected ? "text-orange-500" : "text-gray-500"
                  }`}
                >
                  {min}分
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* クォーター数 */}
      <View className="px-4 pt-3 pb-3">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          クォーター数
        </Text>
        <View className="flex-row">
          {QUARTER_COUNT_OPTIONS.map((q) => {
            const selected = totalQuarters === q;
            return (
              <TouchableOpacity
                key={q}
                className={`flex-1 rounded-xl py-3 items-center mr-2 border ${
                  selected
                    ? "bg-orange-50 border-orange-400"
                    : "bg-white border-gray-200"
                }`}
                style={q === 4 ? { marginRight: 0 } : undefined}
                onPress={() => setTotalQuarters(q)}
              >
                <Text
                  className={`text-base font-bold ${
                    selected ? "text-orange-500" : "text-gray-500"
                  }`}
                >
                  {q}Q
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ナビゲーションボタン */}
      <View className="px-4 pt-4 pb-8 flex-row">
        <TouchableOpacity
          className="rounded-xl py-4 items-center bg-gray-200 mr-3 px-6"
          onPress={onBack}
        >
          <Text className="text-gray-600 font-bold text-base">戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-xl py-4 items-center bg-orange-500"
          onPress={onNext}
        >
          <Text className="text-white font-bold text-base">次へ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
