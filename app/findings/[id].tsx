import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

import { DeleteConfirmation } from "@/components/delete-confirmation";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { FOLLOW_UP_COPY } from "@/shared/essay-analysis";
import { getReview, removeReview, type SavedReview } from "@/lib/review-storage";

function Statistic({ value, label, detail }: { value: string; label: string; detail: string }) {
  return <View className="min-w-[46%] flex-1 rounded-2xl border border-border bg-surface p-4 md:min-w-0"><Text className="text-2xl font-bold text-foreground">{value}</Text><Text className="mt-1 text-sm font-semibold text-foreground">{label}</Text><Text className="mt-1 text-xs leading-4 text-muted">{detail}</Text></View>;
}

export default function FindingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [review, setReview] = useState<SavedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletePending, setDeletePending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => { if (!id) return; setLoading(true); setReview(await getReview(id)); setLoading(false); }, [id]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const deleteReview = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await removeReview(id);
      router.replace("/");
    } finally {
      setDeleting(false);
    }
  };
  if (loading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color={colors.primary} /></ScreenContainer>;
  if (!review) return <ScreenContainer className="items-center justify-center px-8"><Text className="text-center text-base text-muted">This saved review is no longer available.</Text><TouchableOpacity onPress={() => router.replace("/")} className="mt-5 rounded-xl bg-primary px-5 py-3"><Text className="font-semibold text-white">Return to queue</Text></TouchableOpacity></ScreenContainer>;

  const copy = FOLLOW_UP_COPY[review.level];
  const accent = review.level === "few" ? "border-success bg-surface" : review.level === "some" ? "border-warning bg-surface" : "border-error bg-surface";
  const statusTitle = review.revisionGuidanceSuggested ? "Revision guidance suggested" : "No configured revision threshold";
  const statusDetail = review.revisionGuidanceSuggested ? "The configured marker or mechanics threshold was reached. Use the suggestions below as revision prompts, not a failure grade or authorship conclusion." : "The current rules did not reach a revision threshold. This is not a pass, an authorship verification, or a grade.";

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}>
    <FlatList
      data={review.findings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, width: "100%", maxWidth: 920, alignSelf: "center" }}
      ListHeaderComponent={<View>
        <View className="pt-3 pb-6 flex-row items-center justify-between"><TouchableOpacity onPress={() => router.back()} className="rounded-full bg-surface px-4 py-2 active:opacity-70"><Text className="text-sm font-semibold text-foreground">Back</Text></TouchableOpacity><TouchableOpacity onPress={() => setDeletePending(true)} className="rounded-full px-3 py-2 active:opacity-70"><Text className="text-sm font-semibold text-error">Delete</Text></TouchableOpacity></View>
        {deletePending ? <View className="mb-5"><DeleteConfirmation title="Delete this review?" detail="This removes the saved text and findings from this browser." confirmLabel="Delete review" busy={deleting} onCancel={() => setDeletePending(false)} onConfirm={() => void deleteReview()} /></View> : null}
        <Text className="text-sm font-semibold text-muted">{review.sourceName}</Text><Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">{review.title}</Text>{review.studentReference ? <Text className="mt-1 text-base text-muted">{review.studentReference}</Text> : null}<View className="mt-3 self-start rounded-full bg-[#EEECFF] px-3 py-1"><Text className="text-xs font-bold text-primary">Profile: {review.ruleSetName}</Text></View>
        <View className={`mt-6 rounded-3xl border p-5 ${accent}`}><Text className="text-sm font-semibold text-primary">Deterministic review</Text><Text className="mt-1 text-2xl font-bold text-foreground">{copy.title}</Text><Text className="mt-2 text-sm leading-5 text-muted">{copy.detail}</Text><View className="mt-4 flex-row gap-6"><Text className="text-sm font-medium text-foreground">{review.wordCount} words</Text><Text className="text-sm font-medium text-foreground">{review.findings.length} categories</Text></View></View>
        <View className={`mt-4 rounded-2xl border bg-surface p-4 ${review.revisionGuidanceSuggested ? "border-warning" : "border-success"}`}><Text className="text-sm font-bold text-foreground">{statusTitle}</Text><Text className="mt-1 text-sm leading-5 text-muted">{statusDetail}</Text></View>
        <Text className="mt-7 mb-3 text-lg font-bold text-foreground">Review statistics</Text>
        <View className="flex-row flex-wrap gap-3 md:flex-nowrap"><Statistic value={String(review.statistics.markerCategories)} label="Marker categories" detail="Visible fixed-rule categories" /><Statistic value={String(review.statistics.markerInstances)} label="Marker instances" detail="Exact configured matches" /><Statistic value={`${review.statistics.flaggedParagraphRate}%`} label="Paragraph coverage" detail={`${review.statistics.flaggedParagraphs} of ${review.statistics.paragraphCount} paragraphs`} /><Statistic value={String(review.statistics.mechanicsSignals.total)} label="Mechanics signals" detail="Editing cues, not a grammar grade" /></View>
        <View className="mt-3 rounded-2xl border border-primary bg-background p-4"><Text className="text-sm font-semibold text-foreground">Template-language rate</Text><Text className="mt-1 text-2xl font-bold text-foreground">{review.statistics.templateLanguageRate} per 100 words</Text><Text className="mt-1 text-xs leading-4 text-muted">Configured marker instances normalized for essay length; not an AI score or academic-integrity measure.</Text></View>
        <Text className="mt-7 mb-3 text-lg font-bold text-foreground">Deterministic revision guidance</Text>
        <View className="gap-3">{review.recommendations.map((item, index) => <View key={item.id} className="rounded-3xl border border-border bg-surface p-5"><View className="flex-row gap-3"><View className="h-7 w-7 items-center justify-center rounded-full bg-primary"><Text className="text-sm font-bold text-onPrimary">{index + 1}</Text></View><View className="flex-1"><Text className="text-base font-bold text-foreground">{item.title}</Text><Text className="mt-1 text-sm leading-5 text-muted">{item.detail}</Text></View></View></View>)}</View>
        <View className="mt-7 rounded-2xl border border-border bg-surface p-4"><Text className="text-sm font-semibold text-foreground">Use this as a starting point</Text><Text className="mt-1 text-sm leading-5 text-muted">These are fixed language, formatting, structure, and mechanics observations. They can surface follow-up questions but are not proof of authorship. Review assignment context and speak with the student before making any decision.</Text></View>
        <Text className="mt-7 mb-3 text-lg font-bold text-foreground">Matched marker categories</Text>
      </View>}
      ListEmptyComponent={<View className="rounded-3xl border border-dashed border-border bg-surface p-5"><Text className="text-base font-semibold text-foreground">No configured patterns matched</Text><Text className="mt-2 text-sm leading-5 text-muted">This is not a pass or human-authorship verification. It only means the current configured rules did not find a pattern; review the assignment context and the student’s process.</Text></View>}
      renderItem={({ item }) => <View className="mb-4 rounded-3xl border border-border bg-surface p-5"><View className="flex-row items-start justify-between gap-3"><Text className="flex-1 text-base font-bold text-foreground">{item.label}</Text><View className="rounded-full border border-primary bg-background px-3 py-1"><Text className="text-xs font-bold text-primary">{item.count} match{item.count === 1 ? "" : "es"}</Text></View></View><Text className="mt-2 text-sm leading-5 text-muted">{item.rationale}</Text><View className="mt-4 rounded-2xl border-l-4 border-primary bg-background p-4"><Text className="text-sm italic leading-5 text-foreground">“{item.excerpt}”</Text></View><Text className="mt-4 text-sm font-semibold text-foreground">Consider asking</Text><Text className="mt-1 text-sm leading-5 text-muted">{item.question}</Text></View>}
    />
  </ScreenContainer>;
}
