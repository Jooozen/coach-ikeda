import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GameIndexScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center px-6">
      <Ionicons name="basketball-outline" size={64} color="#d1d5db" />
      <Text className="mt-4 text-lg font-bold text-gray-400">
        試合がありません
      </Text>
      <Text className="mt-2 text-sm text-gray-300 text-center">
        新しい試合を作成して{"\n"}スタッツの記録を始めましょう
      </Text>
      <TouchableOpacity
        className="mt-6 bg-orange-500 rounded-xl px-8 py-4 flex-row items-center"
        onPress={() => router.push("/game/create")}
      >
        <Ionicons name="add-circle-outline" size={22} color="white" />
        <Text className="text-white font-bold text-base ml-2">
          新しい試合を作成
        </Text>
      </TouchableOpacity>
    </View>
  );
}
