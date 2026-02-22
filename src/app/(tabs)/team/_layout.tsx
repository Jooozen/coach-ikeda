import { Stack } from "expo-router";

export default function TeamLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#f97316" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "チーム" }} />
      <Stack.Screen name="players" options={{ title: "選手管理" }} />
    </Stack>
  );
}
