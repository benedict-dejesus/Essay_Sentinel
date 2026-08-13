import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useThemeContext } from "@/lib/theme-provider";
import { deleteRuleSet, getActiveRuleSet, listRuleSets, saveRuleSet, setActiveRuleSet } from "@/lib/rule-set-storage";
import { ALL_BASELINE_RULE_IDS, BASELINE_MARKER_OPTIONS, SYSTEM_DEFAULT_RULE_SET, type AssignmentRuleSet, type AssignmentRuleSetDraft, type BaselineRuleId } from "@/shared/rule-sets";

const EMPTY_DRAFT: AssignmentRuleSetDraft = { name: "", description: "", enabledBaseRuleIds: ALL_BASELINE_RULE_IDS, customPhrases: [] };

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useThemeContext();
  const [ruleSets, setRuleSets] = useState<AssignmentRuleSet[]>([SYSTEM_DEFAULT_RULE_SET]);
  const [activeId, setActiveId] = useState(SYSTEM_DEFAULT_RULE_SET.id);
  const [draft, setDraft] = useState<AssignmentRuleSetDraft | null>(null);
  const [phrasesInput, setPhrasesInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [sets, active] = await Promise.all([listRuleSets(), getActiveRuleSet()]);
    setRuleSets(sets);
    setActiveId(active.id);
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const beginEdit = (set?: AssignmentRuleSet) => {
    const next = set ? { id: set.id, name: set.name, description: set.description, enabledBaseRuleIds: set.enabledBaseRuleIds, customPhrases: set.customPhrases } : { ...EMPTY_DRAFT, enabledBaseRuleIds: [...ALL_BASELINE_RULE_IDS] };
    setDraft(next);
    setPhrasesInput(next.customPhrases.join("\n"));
  };

  const toggleRule = (id: BaselineRuleId) => {
    if (!draft) return;
    const enabled = draft.enabledBaseRuleIds.includes(id) ? draft.enabledBaseRuleIds.filter((ruleId) => ruleId !== id) : [...draft.enabledBaseRuleIds, id];
    setDraft({ ...draft, enabledBaseRuleIds: enabled });
  };

  const saveDraft = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const saved = await saveRuleSet({ ...draft, customPhrases: phrasesInput.split(/\r?\n/) });
      await setActiveRuleSet(saved.id);
      setDraft(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const selectActive = async (id: string) => {
    await setActiveRuleSet(id);
    setActiveId(id);
  };

  const confirmDelete = (set: AssignmentRuleSet) => {
    Alert.alert(`Delete “${set.name}”?`, "This removes the local assignment profile. Existing saved reviews will retain their recorded rule-set name.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteRuleSet(set.id); setDraft(null); await load(); } },
    ]);
  };

  if (draft) {
    return <ScreenContainer className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 32, width: "100%", maxWidth: 820, alignSelf: "center" }}>
        <View className="flex-row items-center justify-between"><TouchableOpacity onPress={() => setDraft(null)} className="rounded-full bg-surface px-4 py-2 active:opacity-70"><Text className="text-sm font-semibold text-foreground">Cancel</Text></TouchableOpacity><Text className="text-sm font-semibold text-muted">Assignment profile</Text><View className="w-16" /></View>
        <Text className="mt-7 text-3xl font-bold tracking-tight text-foreground">{draft.id ? "Edit rule set" : "Create rule set"}</Text>
        <Text className="mt-2 text-base leading-6 text-muted">Choose visible baseline checks and add exact phrases relevant to this assignment. These remain fixed rules, not AI probabilities.</Text>
        <View className="mt-7 gap-5">
          <View className="gap-2"><Text className="text-sm font-semibold text-foreground">Assignment name</Text><TextInput value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} placeholder="e.g., Literary analysis essay" placeholderTextColor={colorScheme === "light" ? "#37636E" : "#B8D2D7"} className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-base text-foreground" /></View>
          <View className="gap-2"><Text className="text-sm font-semibold text-foreground">Description <Text className="font-normal text-muted">(optional)</Text></Text><TextInput value={draft.description} onChangeText={(description) => setDraft({ ...draft, description })} placeholder="What should this profile be used for?" placeholderTextColor={colorScheme === "light" ? "#37636E" : "#B8D2D7"} multiline className="min-h-[88px] rounded-2xl border border-border bg-surface px-4 py-3.5 text-base leading-6 text-foreground" /></View>
          <View><Text className="text-lg font-bold text-foreground">Baseline marker categories</Text><Text className="mt-1 text-sm leading-5 text-muted">Only enabled categories can create a finding, statistic, or revision prompt.</Text><View className="mt-4 gap-3">{BASELINE_MARKER_OPTIONS.map((option) => { const enabled = draft.enabledBaseRuleIds.includes(option.id); return <TouchableOpacity key={option.id} onPress={() => toggleRule(option.id)} className={`rounded-2xl border p-4 active:opacity-80 ${enabled ? "border-primary bg-background" : "border-border bg-surface"}`}><View className="flex-row items-center justify-between gap-3"><View className="flex-1"><Text className="text-base font-semibold text-foreground">{option.label}</Text><Text className="mt-1 text-sm leading-5 text-muted">{option.description}</Text></View><View className={`h-7 w-7 items-center justify-center rounded-full ${enabled ? "bg-primary" : "bg-border"}`}><Text className={`text-sm font-bold ${enabled ? "text-onPrimary" : "text-muted"}`}>{enabled ? "✓" : ""}</Text></View></View></TouchableOpacity>; })}</View></View>
          <View className="gap-2"><Text className="text-lg font-bold text-foreground">Custom assignment phrases</Text><Text className="text-sm leading-5 text-muted">Enter one exact phrase per line. Up to 20 phrases, 3–120 characters each. These are literal matches only.</Text><TextInput value={phrasesInput} onChangeText={setPhrasesInput} placeholder={"e.g.,\nthis proves that\naccording to the evidence"} placeholderTextColor={colorScheme === "light" ? "#37636E" : "#B8D2D7"} multiline textAlignVertical="top" className="min-h-[160px] rounded-3xl border border-border bg-surface px-4 py-4 text-base leading-6 text-foreground" /></View>
        </View>
        <TouchableOpacity onPress={saveDraft} disabled={saving} className={`mt-7 items-center rounded-2xl py-4 ${saving ? "bg-border" : "bg-primary active:opacity-85"}`}><Text className="text-base font-bold text-onPrimary">{saving ? "Saving…" : "Save and use this rule set"}</Text></TouchableOpacity>
      </ScrollView>
    </ScreenContainer>;
  }

  return <ScreenContainer className="px-5">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 32, width: "100%", maxWidth: 820, alignSelf: "center" }}>
      <Text className="text-3xl font-bold tracking-tight text-foreground">Assignment rules</Text>
      <Text className="mt-3 text-base leading-6 text-muted">Create fixed, assignment-specific language-marker profiles. They configure visible checks only; they never produce an AI-authorship score.</Text>
      <View className="mt-7 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Appearance</Text><Text className="mt-1 text-sm leading-5 text-muted">Choose the display setting that is most comfortable for reviewing student work.</Text><View className="mt-4 flex-row gap-3">{(["light", "dark"] as const).map((scheme) => { const active = colorScheme === scheme; return <TouchableOpacity key={scheme} onPress={() => setColorScheme(scheme)} className={`flex-1 rounded-2xl border p-4 active:opacity-80 ${active ? "border-primary bg-background" : "border-border bg-background"}`}><View className="flex-row items-center justify-between"><View><Text className="text-base font-bold text-foreground">{scheme === "light" ? "Light" : "Dark"}</Text><Text className="mt-1 text-xs leading-4 text-muted">{scheme === "light" ? "Soft rose canvas" : "Deep teal canvas"}</Text></View><View className={`h-7 w-7 items-center justify-center rounded-full ${active ? "bg-primary" : "bg-border"}`}><Text className="text-sm font-bold text-onPrimary">{active ? "✓" : ""}</Text></View></View></TouchableOpacity>; })}</View></View>
      <TouchableOpacity onPress={() => beginEdit()} className="mt-6 flex-row items-center justify-between rounded-3xl bg-primary px-5 py-5 active:opacity-85"><View><Text className="text-lg font-bold text-onPrimary">Create a rule set</Text><Text className="mt-1 text-sm text-onPrimary opacity-80">Pick categories and add exact phrases</Text></View><Text className="text-3xl text-onPrimary">＋</Text></TouchableOpacity>
      <Text className="mt-8 mb-3 text-lg font-bold text-foreground">Available profiles</Text>
      <View className="gap-3">{ruleSets.map((set) => { const active = set.id === activeId; return <View key={set.id} className={`rounded-3xl border p-5 ${active ? "border-primary bg-background" : "border-border bg-surface"}`}><TouchableOpacity onPress={() => void selectActive(set.id)} className="active:opacity-75"><View className="flex-row items-start justify-between gap-3"><View className="flex-1"><Text className="text-base font-bold text-foreground">{set.name}</Text><Text className="mt-1 text-sm leading-5 text-muted">{set.description || "No description added."}</Text></View><View className={`rounded-full px-3 py-1 ${active ? "bg-primary" : "bg-border"}`}><Text className={`text-xs font-bold ${active ? "text-onPrimary" : "text-muted"}`}>{active ? "Active" : "Use"}</Text></View></View><View className="mt-4 flex-row gap-4"><Text className="text-xs font-semibold text-muted">{set.enabledBaseRuleIds.length} baseline checks</Text><Text className="text-xs font-semibold text-muted">{set.customPhrases.length} custom phrases</Text></View></TouchableOpacity>{!set.isSystem ? <View className="mt-4 flex-row gap-3"><TouchableOpacity onPress={() => beginEdit(set)} className="rounded-xl border border-primary bg-background px-4 py-2.5 active:opacity-75"><Text className="text-sm font-semibold text-primary">Edit</Text></TouchableOpacity><TouchableOpacity onPress={() => confirmDelete(set)} className="rounded-xl border border-error bg-surface px-4 py-2.5 active:opacity-75"><Text className="text-sm font-semibold text-error">Delete</Text></TouchableOpacity></View> : <Text className="mt-4 text-xs leading-5 text-muted">The general profile remains available as a non-editable baseline.</Text>}</View>; })}</View>
    </ScrollView>
  </ScreenContainer>;
}
