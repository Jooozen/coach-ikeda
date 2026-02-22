import { View, Text } from "react-native";

export default function TeamScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-gray-800">チーム</Text>
      <Text className="mt-2 text-base text-gray-500">
        選手・チームの管理画面
      </Text>
    </View>
  );
}
