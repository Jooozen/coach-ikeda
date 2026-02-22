import { View, Text } from "react-native";

export default function StatsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-gray-800">スタッツ</Text>
      <Text className="mt-2 text-base text-gray-500">
        スタッツの閲覧・分析画面
      </Text>
    </View>
  );
}
