import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { FOLLOW_UP_COPY } from "@/shared/essay-analysis";
import { listReviews, type SavedReview } from "@/lib/review-storage";

export default function HomeScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<SavedReview[]>([]);

  const loadReviews = useCallback(async () => setReviews(await listReviews()), []);
  useFocusEffect(useCallback(() => { void loadReviews(); }, [loadReviews]));

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 28, width: "100%", maxWidth: 760, alignSelf: "center" }}
        ListHeaderComponent={
          <View>
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-primary">Essay Sentinel</Text>
            <Text className="mt-2 text-3xl font-bold tracking-tight text-foreground">Review writing with context.</Text>
            <Text className="mt-3 text-base leading-6 text-muted">Use transparent language markers to guide an educator conversation — never as an AI verdict.</Text>
            <TouchableOpacity onPress={() => router.push("/review" as never)} className="mt-6 flex-row items-center justify-between rounded-3xl bg-primary px-5 py-5 active:opacity-85">
              <View><Text className="text-lg font-bold text-onPrimary">Review an essay</Text><Text className="mt-1 text-sm text-onPrimary opacity-80">Paste text or import DOCX</Text></View><Text className="text-3xl text-onPrimary">＋</Text>
            </TouchableOpacity>
            <View className="mt-5 flex-row gap-3"><View className="flex-1 rounded-2xl border border-border bg-surface p-4"><Text className="text-2xl font-bold text-foreground">{reviews.length}</Text><Text className="mt-1 text-sm text-muted">Saved reviews</Text></View><View className="flex-1 rounded-2xl border border-success bg-surface p-4"><Text className="text-sm font-bold text-success">No AI</Text><Text className="mt-1 text-sm text-muted">Fixed-rule checks</Text></View></View>
            <View className="mt-7 mb-3 flex-row items-center justify-between"><Text className="text-lg font-bold text-foreground">Recent reviews</Text>{reviews.length > 0 ? <Text className="text-sm text-muted">On this device</Text> : null}</View>
          </View>
        }
        ListEmptyComponent={<View className="rounded-3xl border border-dashed border-border bg-surface p-6"><Text className="text-base font-semibold text-foreground">Your review queue is empty</Text><Text className="mt-2 text-sm leading-5 text-muted">Start with a pasted submission or import a DOCX file. Results are saved locally in this browser.</Text></View>}
        renderItem={({ item }) => {
          const copy = FOLLOW_UP_COPY[item.level];
          return <TouchableOpacity onPress={() => router.push({ pathname: "/findings/[id]", params: { id: item.id } } as never)} className="mb-3 rounded-3xl border border-border bg-surface p-5 active:opacity-75"><View className="flex-row items-start justify-between gap-3"><View className="flex-1"><Text numberOfLines={1} className="text-base font-bold text-foreground">{item.title}</Text><Text numberOfLines={1} className="mt-1 text-sm text-muted">{item.studentReference || item.sourceName}</Text></View><Text className="text-2xl text-muted">›</Text></View><View className="mt-4 flex-row items-center justify-between"><View className="rounded-full border border-primary bg-background px-3 py-1"><Text className="text-xs font-bold text-primary">{copy.title}</Text></View><Text className={`text-xs font-bold ${item.revisionGuidanceSuggested ? "text-warning" : "text-success"}`}>{item.revisionGuidanceSuggested ? "Guidance suggested" : "No revision threshold"}</Text></View></TouchableOpacity>;
        }}
      />
    </ScreenContainer>
  );
}
