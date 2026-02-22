import { View, Text } from "react-native";

export default function GameScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-gray-800">試合</Text>
      <Text className="mt-2 text-base text-gray-500">
        試合の記録・管理画面
      </Text>
    </View>
  );
}
