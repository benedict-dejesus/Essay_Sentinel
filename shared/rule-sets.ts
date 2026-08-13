export const BASELINE_MARKER_OPTIONS = [
  { id: "stock-academic-phrasing", label: "Stock academic phrasing", description: "Reusable academic template phrases, including expanded broad wording." },
  { id: "formulaic-transitions", label: "Formulaic transitions", description: "High density of formal linking language." },
  { id: "generic-abstraction-frames", label: "Generic abstraction frames", description: "Broad rhetorical frames without specific detail." },
  { id: "paired-balance-templates", label: "Repeated balance templates", description: "Repeated paired sentence scaffolds." },
  { id: "conclusion-template", label: "Conclusion templates", description: "Common concluding formulae." },
  { id: "repeated-phrase-sequence", label: "Repeated phrase sequences", description: "Five-word sequences repeated three or more times." },
  { id: "markdown-heading-artifacts", label: "Markdown heading artifacts", description: "Raw #, ##, or ### headings left in submitted text." },
  { id: "markdown-list-artifacts", label: "Markdown list artifacts", description: "Raw bullet, task, or numbered Markdown formatting." },
  { id: "highly-regular-paragraphs", label: "Highly regular paragraphs", description: "Four or more substantive paragraphs with tightly clustered lengths." },
  { id: "uniform-sentence-cadence", label: "Uniform sentence cadence", description: "Eight or more sentences with unusually similar lengths." },
  { id: "elevated-academic-vocabulary", label: "Elevated academic vocabulary", description: "Dense use of a visible list of highly formal academic terms." },
  { id: "ordered-cohesion-scaffold", label: "Ordered cohesion scaffold", description: "Repeated formal sequence cues at the start of sections." },
  { id: "high-surface-polish-cluster", label: "High surface-polish cluster", description: "A transparent combination of length, mechanics, and other polished-writing signals." },
  { id: "classic-llm-buzzword-cluster", label: "Classic LLM buzzword cluster", description: "Multiple configured generic phrases such as linguistic odyssey or delving into." },
  { id: "tapestry-odyssey-imagery", label: "Tapestry and odyssey imagery", description: "Configured broad visual or journey metaphors, including rich tapestry wording." },
  { id: "rigid-academic-proposal-template", label: "Rigid academic proposal template", description: "Five or more recognized proposal headings with at least three proposal-core sections." },
  { id: "fragmented-multi-document-format", label: "Fragmented multi-document format", description: "Recognized headings spanning three or more distinct document-mode groups." },
] as const;

export type BaselineRuleId = (typeof BASELINE_MARKER_OPTIONS)[number]["id"];

export type AssignmentRuleSet = {
  id: string;
  name: string;
  description: string;
  enabledBaseRuleIds: BaselineRuleId[];
  customPhrases: string[];
  createdAt: string;
  isSystem: boolean;
};

export type AssignmentRuleSetDraft = Pick<AssignmentRuleSet, "name" | "description" | "enabledBaseRuleIds" | "customPhrases"> & { id?: string };
export const ALL_BASELINE_RULE_IDS = BASELINE_MARKER_OPTIONS.map((option) => option.id) as BaselineRuleId[];
export const SYSTEM_DEFAULT_RULE_SET: AssignmentRuleSet = { id: "general-essay", name: "General essay review", description: "All visible baseline marker categories for a general academic essay.", enabledBaseRuleIds: ALL_BASELINE_RULE_IDS, customPhrases: [], createdAt: "system", isSystem: true };

export function normalizeCustomPhrases(value: string[] | string): string[] {
  const entries = Array.isArray(value) ? value : value.split(/\r?\n/);
  const unique = new Map<string, string>();
  entries.forEach((entry) => { const phrase = entry.replace(/\s+/g, " ").trim(); if (phrase.length >= 3 && phrase.length <= 120) unique.set(phrase.toLocaleLowerCase(), phrase); });
  return Array.from(unique.values()).slice(0, 20);
}

export function normalizeRuleSetDraft(draft: AssignmentRuleSetDraft): AssignmentRuleSetDraft {
  const enabled = draft.enabledBaseRuleIds.filter((id): id is BaselineRuleId => ALL_BASELINE_RULE_IDS.includes(id));
  return { id: draft.id, name: draft.name.replace(/\s+/g, " ").trim().slice(0, 60) || "Untitled assignment", description: draft.description.replace(/\s+/g, " ").trim().slice(0, 180), enabledBaseRuleIds: enabled, customPhrases: normalizeCustomPhrases(draft.customPhrases) };
}
