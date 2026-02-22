import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "@/stores/gameStore";
import { useTeamStore } from "@/stores/teamStore";
import { getDatabase } from "@/db/database";

import StepGameType from "@/components/game/StepGameType";
import StepDetails from "@/components/game/StepDetails";
import StepStarters from "@/components/game/StepStarters";
import StepScrimmageTeams from "@/components/game/StepScrimmageTeams";
import StepConfirm from "@/components/game/StepConfirm";

// ステップの定義
// 通常試合: 0=種別/相手, 1=詳細, 2=スターター, 3=確認
// 紅白戦:   0=種別,       1=詳細, 2=振り分け,     3=確認

const STEP_LABELS_NORMAL = ["種別", "詳細", "先発", "確認"];
const STEP_LABELS_SCRIMMAGE = ["種別", "詳細", "振分", "確認"];

export default function GameCreateScreen() {
  const router = useRouter();
  const {
    currentStep,
    gameType,
    opponentTeamId,
    newOpponentName,
    isHome,
    nextStep,
    prevStep,
    resetWizard,
    createNewGame,
  } = useGameStore();

  const {
    ownTeam,
    opponents,
    loadTeams,
    loadPlayers,
    addOpponent,
  } = useTeamStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    resetWizard();
    (async () => {
      await getDatabase();
      await loadTeams();
      await loadPlayers();
      setIsReady(true);
    })();
  }, []);

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
        <Text className="text-lg font-bold text-gray-800 text-center">
          チームが未登録です
        </Text>
        <Text className="mt-2 text-sm text-gray-500 text-center">
          先にチーム画面でチームを登録してください
        </Text>
      </View>
    );
  }

  const isScrimmage = gameType === "scrimmage";
  const stepLabels = isScrimmage ? STEP_LABELS_SCRIMMAGE : STEP_LABELS_NORMAL;

  // 対戦相手の名前を解決
  const resolveOpponentName = (): string => {
    if (opponentTeamId) {
      const t = opponents.find((o) => o.id === opponentTeamId);
      return t?.name ?? "";
    }
    return newOpponentName.trim();
  };

  // 試合開始ハンドラ
  const handleStartGame = async () => {
    let awayTeamId = opponentTeamId;

    if (!isScrimmage && !awayTeamId && newOpponentName.trim()) {
      // 新しいチームを作成
      await addOpponent(newOpponentName.trim());
      // 最後に追加されたチームを取得
      await loadTeams();
      const updated = useTeamStore.getState().opponents;
      const created = updated.find(
        (t) => t.name === newOpponentName.trim()
      );
      awayTeamId = created?.id ?? null;
    }

    const homeTeamId = isScrimmage
      ? ownTeam.id
      : isHome
        ? ownTeam.id
        : (awayTeamId ?? ownTeam.id);

    const finalAwayTeamId = isScrimmage
      ? ownTeam.id
      : isHome
        ? (awayTeamId ?? ownTeam.id)
        : ownTeam.id;

    const game = await createNewGame(homeTeamId, finalAwayTeamId);

    // 試合一覧に戻る（将来的にはここで試合記録画面に遷移）
    resetWizard();
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* プログレスバー */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          {stepLabels.map((label, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            return (
              <View key={idx} className="flex-1 items-center">
                <View className="flex-row items-center w-full">
                  {idx > 0 && (
                    <View
                      className={`flex-1 h-0.5 ${
                        isDone ? "bg-orange-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center ${
                      isActive
                        ? "bg-orange-500"
                        : isDone
                          ? "bg-orange-400"
                          : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isActive || isDone ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </Text>
                  </View>
                  {idx < stepLabels.length - 1 && (
                    <View
                      className={`flex-1 h-0.5 ${
                        isDone ? "bg-orange-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </View>
                <Text
                  className={`text-xs mt-1 ${
                    isActive
                      ? "font-bold text-orange-500"
                      : isDone
                        ? "text-orange-400"
                        : "text-gray-400"
                  }`}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ステップコンテンツ */}
      {currentStep === 0 && <StepGameType onNext={nextStep} />}
      {currentStep === 1 && (
        <StepDetails onNext={nextStep} onBack={prevStep} />
      )}
      {currentStep === 2 &&
        (isScrimmage ? (
          <StepScrimmageTeams onNext={nextStep} onBack={prevStep} />
        ) : (
          <StepStarters onNext={nextStep} onBack={prevStep} />
        ))}
      {currentStep === 3 && (
        <StepConfirm
          opponentName={resolveOpponentName()}
          onBack={prevStep}
          onStart={handleStartGame}
        />
      )}
    </View>
  );
}
