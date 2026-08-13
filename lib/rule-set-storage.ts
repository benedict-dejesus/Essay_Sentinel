import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeRuleSetDraft, SYSTEM_DEFAULT_RULE_SET, type AssignmentRuleSet, type AssignmentRuleSetDraft } from "../shared/rule-sets";

const RULE_SETS_KEY = "essay-sentinel.assignment-rule-sets.v1";
const ACTIVE_RULE_SET_KEY = "essay-sentinel.active-assignment-rule-set.v1";

function createId() {
  return `assignment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listRuleSets(): Promise<AssignmentRuleSet[]> {
  try {
    const stored = await AsyncStorage.getItem(RULE_SETS_KEY);
    const custom = stored ? (JSON.parse(stored) as AssignmentRuleSet[]) : [];
    return [SYSTEM_DEFAULT_RULE_SET, ...custom.filter((set) => set.id !== SYSTEM_DEFAULT_RULE_SET.id && !set.isSystem)];
  } catch {
    return [SYSTEM_DEFAULT_RULE_SET];
  }
}

export async function getActiveRuleSet(): Promise<AssignmentRuleSet> {
  const [ruleSets, activeId] = await Promise.all([listRuleSets(), AsyncStorage.getItem(ACTIVE_RULE_SET_KEY)]);
  return ruleSets.find((set) => set.id === activeId) ?? SYSTEM_DEFAULT_RULE_SET;
}

export async function setActiveRuleSet(id: string): Promise<void> {
  const ruleSets = await listRuleSets();
  if (!ruleSets.some((set) => set.id === id)) throw new Error("That assignment rule set is no longer available.");
  await AsyncStorage.setItem(ACTIVE_RULE_SET_KEY, id);
}

export async function saveRuleSet(draft: AssignmentRuleSetDraft): Promise<AssignmentRuleSet> {
  const normalized = normalizeRuleSetDraft(draft);
  const existing = await listRuleSets();
  const custom = existing.filter((set) => !set.isSystem);
  const prior = custom.find((set) => set.id === normalized.id);
  const saved: AssignmentRuleSet = {
    ...normalized,
    id: prior?.id ?? createId(),
    createdAt: prior?.createdAt ?? new Date().toISOString(),
    isSystem: false,
  };
  const next = prior ? custom.map((set) => (set.id === saved.id ? saved : set)) : [saved, ...custom];
  await AsyncStorage.setItem(RULE_SETS_KEY, JSON.stringify(next));
  if (!prior) await AsyncStorage.setItem(ACTIVE_RULE_SET_KEY, saved.id);
  return saved;
}

export async function deleteRuleSet(id: string): Promise<void> {
  if (id === SYSTEM_DEFAULT_RULE_SET.id) throw new Error("The general essay review rule set cannot be deleted.");
  const ruleSets = await listRuleSets();
  await AsyncStorage.setItem(RULE_SETS_KEY, JSON.stringify(ruleSets.filter((set) => !set.isSystem && set.id !== id)));
  const activeId = await AsyncStorage.getItem(ACTIVE_RULE_SET_KEY);
  if (activeId === id) await AsyncStorage.setItem(ACTIVE_RULE_SET_KEY, SYSTEM_DEFAULT_RULE_SET.id);
}
