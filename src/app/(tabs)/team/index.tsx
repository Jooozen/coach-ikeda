import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTeamStore } from "@/stores/teamStore";
import { getDatabase } from "@/db/database";

export default function TeamIndexScreen() {
  const router = useRouter();
  const {
    ownTeam,
    opponents,
    isLoading,
    loadTeams,
    createOwnTeam,
    addOpponent,
    editTeam,
    removeTeam,
  } = useTeamStore();

  const [ownTeamName, setOwnTeamName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await getDatabase();
      await loadTeams();
      setIsReady(true);
    })();
  }, []);

  const handleCreateOwnTeam = useCallback(async () => {
    const trimmed = ownTeamName.trim();
    if (!trimmed) return;
    await createOwnTeam(trimmed);
    setOwnTeamName("");
    await loadTeams();
  }, [ownTeamName]);

  const handleAddOpponent = useCallback(async () => {
    const trimmed = opponentName.trim();
    if (!trimmed) return;
    await addOpponent(trimmed);
    setOpponentName("");
  }, [opponentName]);

  const handleEditStart = useCallback((id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (!trimmed) return;
    await editTeam(editingId, trimmed);
    setEditingId(null);
    setEditingName("");
  }, [editingId, editingName]);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert("削除確認", `「${name}」を削除しますか？`, [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: () => removeTeam(id),
        },
      ]);
    },
    [removeTeam]
  );

  if (!isReady || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* 自チームセクション */}
      <View className="bg-white px-4 py-5 border-b border-gray-200">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          自チーム
        </Text>
        {ownTeam ? (
          <View className="flex-row items-center justify-between">
            {editingId === ownTeam.id ? (
              <View className="flex-1 flex-row items-center">
                <TextInput
                  className="flex-1 border border-orange-300 rounded-lg px-3 py-2 text-base bg-white"
                  value={editingName}
                  onChangeText={setEditingName}
                  autoFocus
                  onSubmitEditing={handleEditSave}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  className="ml-2 bg-orange-500 rounded-lg px-4 py-2"
                  onPress={handleEditSave}
                >
                  <Text className="text-white font-bold">保存</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center mr-3">
                    <Ionicons name="shield" size={20} color="white" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">
                    {ownTeam.name}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="p-2"
                    onPress={() =>
                      handleEditStart(ownTeam.id, ownTeam.name)
                    }
                  >
                    <Ionicons name="pencil" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-orange-500 rounded-lg px-4 py-2 ml-2"
                    onPress={() => router.push("/team/players")}
                  >
                    <Text className="text-white font-bold text-sm">
                      選手管理
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : (
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base bg-white"
              placeholder="チーム名を入力"
              value={ownTeamName}
              onChangeText={setOwnTeamName}
              onSubmitEditing={handleCreateOwnTeam}
              returnKeyType="done"
            />
            <TouchableOpacity
              className="ml-2 bg-orange-500 rounded-lg px-4 py-2"
              onPress={handleCreateOwnTeam}
              disabled={!ownTeamName.trim()}
            >
              <Text className="text-white font-bold">登録</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 対戦相手セクション */}
      <View className="flex-1">
        <View className="px-4 pt-5 pb-3">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            対戦相手
          </Text>
        </View>

        {/* 追加フォーム */}
        <View className="px-4 pb-3">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base bg-white"
              placeholder="対戦相手のチーム名"
              value={opponentName}
              onChangeText={setOpponentName}
              onSubmitEditing={handleAddOpponent}
              returnKeyType="done"
            />
            <TouchableOpacity
              className="ml-2 bg-gray-700 rounded-lg px-4 py-2"
              onPress={handleAddOpponent}
              disabled={!opponentName.trim()}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 対戦相手一覧 */}
        {opponents.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text className="mt-3 text-base text-gray-400 text-center">
              対戦相手を追加しましょう
            </Text>
          </View>
        ) : (
          <FlatList
            data={opponents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            renderItem={({ item }) => (
              <View className="bg-white rounded-lg px-4 py-3 mb-2 flex-row items-center justify-between border border-gray-100">
                {editingId === item.id ? (
                  <View className="flex-1 flex-row items-center">
                    <TextInput
                      className="flex-1 border border-orange-300 rounded-lg px-3 py-1 text-base bg-white"
                      value={editingName}
                      onChangeText={setEditingName}
                      autoFocus
                      onSubmitEditing={handleEditSave}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      className="ml-2 bg-orange-500 rounded-lg px-3 py-1.5"
                      onPress={handleEditSave}
                    >
                      <Text className="text-white font-bold text-sm">
                        保存
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View className="flex-row items-center flex-1">
                      <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center mr-3">
                        <Ionicons
                          name="shield-outline"
                          size={16}
                          color="#6b7280"
                        />
                      </View>
                      <Text className="text-base text-gray-800">
                        {item.name}
                      </Text>
                    </View>
                    <View className="flex-row">
                      <TouchableOpacity
                        className="p-2"
                        onPress={() =>
                          handleEditStart(item.id, item.name)
                        }
                      >
                        <Ionicons
                          name="pencil"
                          size={18}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="p-2"
                        onPress={() => handleDelete(item.id, item.name)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
