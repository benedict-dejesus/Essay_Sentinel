import { SYSTEM_DEFAULT_RULE_SET, type AssignmentRuleSet } from "./rule-sets";

export type FollowUpLevel = "few" | "some" | "more";

export type MarkerFinding = {
  id: string;
  label: string;
  rationale: string;
  excerpt: string;
  start: number;
  phrase: string;
  question: string;
  count: number;
  matchPositions: number[];
};

export type ReviewStatistics = {
  markerCategories: number;
  markerInstances: number;
  paragraphCount: number;
  flaggedParagraphs: number;
  flaggedParagraphRate: number;
  templateLanguageRate: number;
  mechanicsSignals: { sentenceEndingObservations: number; lowercaseSentenceStarts: number; total: number };
};

export type RevisionRecommendation = { id: string; title: string; detail: string };

export type EssayReview = {
  wordCount: number;
  level: FollowUpLevel;
  findings: MarkerFinding[];
  statistics: ReviewStatistics;
  revisionGuidanceSuggested: boolean;
  recommendations: RevisionRecommendation[];
  ruleSetId: string;
  ruleSetName: string;
  checkedAt: string;
};

type PhraseRule = { id: string; label: string; phrases: string[]; threshold?: number; rationale: string; question: string };

const STOCK_PHRASES: PhraseRule = {
  id: "stock-academic-phrasing",
  label: "Stock academic phrasing",
  phrases: [
    "it is important to note",
    "in today's rapidly evolving world",
    "plays a pivotal role",
    "a myriad of",
    "delve into",
    "underscores the importance of",
    "it is crucial to",
    "at its core",
    "serves as a reminder",
    "cannot be overstated",
    "fosters a deeper understanding",
    "in an increasingly",
  ],
  rationale: "This wording closely follows a broadly reusable academic phrase template.",
  question: "How would the student explain this idea in their own everyday words?",
};

const GENERIC_ABSTRACTION: PhraseRule = {
  id: "generic-abstraction-frames",
  label: "Generic abstraction frame",
  phrases: [
    "the complexities of",
    "the multifaceted nature of",
    "a testament to the",
    "the ever-changing landscape of",
    "a compelling case for",
    "in the grand scheme of things",
  ],
  rationale: "This phrase introduces a broad rhetorical frame rather than a specific claim or example.",
  question: "What concrete example or source could the student use to make this claim more specific?",
};

const CONCLUSION_TEMPLATE: PhraseRule = {
  id: "conclusion-template",
  label: "Conclusion template",
  phrases: ["in conclusion", "to conclude", "ultimately, it is clear", "all things considered", "as we have seen", "to sum up"],
  rationale: "The ending uses a common conclusion template.",
  question: "Why did the student choose this closing, and how does it connect to their strongest evidence?",
};

const TRANSITIONS = ["moreover", "furthermore", "additionally", "consequently", "thus", "therefore"];
const BALANCE_PATTERNS = ["not only", "whether", "on the one hand"];

function countWords(text: string) {
  return text.trim().match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*/g)?.length ?? 0;
}

function positionsFor(text: string, phrase: string) {
  const positions: number[] = [];
  let start = text.indexOf(phrase);
  while (start !== -1) {
    positions.push(start);
    start = text.indexOf(phrase, start + phrase.length);
  }
  return positions;
}

function makeExcerpt(text: string, start: number, phrase: string) {
  const left = Math.max(0, start - 70);
  const right = Math.min(text.length, start + phrase.length + 100);
  return `${left > 0 ? "…" : ""}${text.slice(left, right).replace(/\s+/g, " ").trim()}${right < text.length ? "…" : ""}`;
}

function makeFinding(input: Omit<MarkerFinding, "excerpt"> & { sourceText: string }) {
  const { sourceText, ...finding } = input;
  return { ...finding, excerpt: makeExcerpt(sourceText, finding.start, finding.phrase) };
}

function findPhraseRule(text: string, lowerText: string, rule: PhraseRule): MarkerFinding | null {
  const matches = rule.phrases.flatMap((phrase) => positionsFor(lowerText, phrase).map((start) => ({ phrase, start })));
  if (matches.length < (rule.threshold ?? 1)) return null;
  const first = matches.sort((a, b) => a.start - b.start)[0];
  return makeFinding({ id: rule.id, label: rule.label, rationale: rule.rationale, sourceText: text, start: first.start, phrase: first.phrase, question: rule.question, count: matches.length, matchPositions: matches.map((match) => match.start) });
}

function findTransitionMarker(text: string, lowerText: string, wordCount: number): MarkerFinding | null {
  const matches = TRANSITIONS.flatMap((transition) => Array.from(lowerText.matchAll(new RegExp(`\\b${transition}\\b`, "g"))).map((match) => ({ transition, start: match.index ?? 0 })));
  const threshold = Math.max(4, Math.ceil(wordCount / 250) * 4);
  if (matches.length < threshold) return null;
  const first = matches.sort((a, b) => a.start - b.start)[0];
  return makeFinding({
    id: "formulaic-transitions",
    label: "Formulaic transitions",
    rationale: `The text uses formal linking terms ${matches.length} times, above the configured review threshold for this length.`,
    sourceText: text,
    start: first.start,
    phrase: first.transition,
    question: "Are these transitions helping the argument, or could the student make the relationship between ideas more directly?",
    count: matches.length,
    matchPositions: matches.map((match) => match.start),
  });
}

function findBalanceMarker(text: string, lowerText: string): MarkerFinding | null {
  const matches = BALANCE_PATTERNS.flatMap((phrase) => Array.from(lowerText.matchAll(new RegExp(`\\b${phrase.replaceAll(" ", "\\s+")}\\b`, "g"))).map((match) => ({ phrase, start: match.index ?? 0 })));
  if (matches.length < 2) return null;
  const first = matches.sort((a, b) => a.start - b.start)[0];
  return makeFinding({ id: "paired-balance-templates", label: "Repeated balance template", rationale: "The same balanced sentence scaffold appears more than once.", sourceText: text, start: first.start, phrase: first.phrase, question: "Was this repetition a deliberate rhetorical choice, and does it fit the student’s usual writing voice?", count: matches.length, matchPositions: matches.map((match) => match.start) });
}

function findRepeatedSequence(text: string): MarkerFinding | null {
  const tokens = Array.from(text.matchAll(/[A-Za-zÀ-ÖØ-öø-ÿ]{3,}/g)).map((match) => ({ word: match[0].toLowerCase(), start: match.index ?? 0 }));
  const sequences = new Map<string, { count: number; start: number; phrase: string }>();
  for (let index = 0; index <= tokens.length - 5; index += 1) {
    const window = tokens.slice(index, index + 5);
    const phrase = window.map((item) => item.word).join(" ");
    const existing = sequences.get(phrase);
    sequences.set(phrase, existing ? { ...existing, count: existing.count + 1 } : { count: 1, start: window[0].start, phrase });
  }
  const repeated = Array.from(sequences.values()).find((sequence) => sequence.count >= 3);
  if (!repeated) return null;
  return makeFinding({ id: "repeated-phrase-sequence", label: "Repeated phrase sequence", rationale: "The same five-word sequence appears three or more times in the text.", sourceText: text, start: repeated.start, phrase: repeated.phrase, question: "Is this repeated sequence intentional, drawn from assignment language, or an opportunity for revision?", count: repeated.count, matchPositions: [repeated.start] });
}

function findCustomPhrases(text: string, lowerText: string, phrases: string[]): MarkerFinding | null {
  const matches = phrases.flatMap((phrase) => positionsFor(lowerText, phrase.toLowerCase()).map((start) => ({ phrase, start })));
  if (!matches.length) return null;
  const first = matches.sort((a, b) => a.start - b.start)[0];
  return makeFinding({ id: "custom-assignment-phrases", label: "Custom assignment phrases", rationale: "This exact phrase was added by the educator to the active assignment rule set.", sourceText: text, start: first.start, phrase: first.phrase, question: "Does this phrase fit the assignment and the student’s intended voice, or could it be replaced with more assignment-specific detail?", count: matches.length, matchPositions: matches.map((match) => match.start) });
}

function findMarkdownHeadingArtifacts(sourceText: string): MarkerFinding | null {
  const matches = Array.from(sourceText.matchAll(/^(#{1,6})\s+([^\n]+)/gm));
  if (!matches.length) return null;
  const first = matches[0];
  const phrase = first[0].trim();
  return makeFinding({ id: "markdown-heading-artifacts", label: "Markdown heading artifacts", rationale: `The submission contains ${matches.length} Markdown-style heading${matches.length === 1 ? "" : "s"} beginning with # characters.`, sourceText, start: first.index ?? 0, phrase, question: "Was this copied from a drafting tool or publishing format, and should the heading style be revised for this assignment?", count: matches.length, matchPositions: matches.map((match) => match.index ?? 0) });
}

function findMarkdownListArtifacts(sourceText: string): MarkerFinding | null {
  const matches = Array.from(sourceText.matchAll(/^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[ xX]\]\s+)([^\n]+)/gm));
  if (matches.length < 2) return null;
  const first = matches[0];
  const phrase = first[0].trim();
  return makeFinding({ id: "markdown-list-artifacts", label: "Markdown list artifacts", rationale: `The submission contains ${matches.length} Markdown-style list items.`, sourceText, start: first.index ?? 0, phrase, question: "Does this list formatting fit the assignment, or should the student revise it into the requested essay structure?", count: matches.length, matchPositions: matches.map((match) => match.index ?? 0) });
}

function findRegularParagraphMarker(sourceText: string): MarkerFinding | null {
  const paragraphs = sourceText.split(/\n\s*\n/).map((paragraph) => ({ text: paragraph.trim(), start: sourceText.indexOf(paragraph.trim()) })).filter((paragraph) => countWords(paragraph.text) >= 45);
  if (paragraphs.length < 4) return null;
  const counts = paragraphs.map((paragraph) => countWords(paragraph.text));
  const average = counts.reduce((total, count) => total + count, 0) / counts.length;
  const spread = Math.max(...counts) - Math.min(...counts);
  if (spread > Math.max(18, average * 0.2)) return null;
  const first = paragraphs[0];
  const phrase = first.text.slice(0, Math.min(48, first.text.length));
  return makeFinding({ id: "highly-regular-paragraphs", label: "Highly regular paragraphs", rationale: `${paragraphs.length} substantive paragraphs have a narrow word-count range (${Math.min(...counts)}–${Math.max(...counts)} words).`, sourceText, start: first.start, phrase, question: "Was the even paragraph structure deliberate, and can the student describe how they planned and revised each section?", count: paragraphs.length, matchPositions: paragraphs.map((paragraph) => paragraph.start) });
}

function findUniformSentenceCadence(sourceText: string): MarkerFinding | null {
  const sentences = Array.from(sourceText.matchAll(/[^.!?\n]+[.!?]+/g)).map((match) => ({ text: match[0].trim(), start: match.index ?? 0 })).filter((sentence) => countWords(sentence.text) >= 6);
  if (sentences.length < 8) return null;
  const counts = sentences.map((sentence) => countWords(sentence.text));
  const average = counts.reduce((total, count) => total + count, 0) / counts.length;
  const variance = counts.reduce((total, count) => total + (count - average) ** 2, 0) / counts.length;
  const deviation = Math.sqrt(variance);
  if (deviation > Math.max(2.5, average * 0.22)) return null;
  const first = sentences[0];
  const phrase = first.text.slice(0, Math.min(52, first.text.length));
  return makeFinding({ id: "uniform-sentence-cadence", label: "Uniform sentence cadence", rationale: `${sentences.length} sentences have unusually similar word counts for the essay length.`, sourceText, start: first.start, phrase, question: "Can the student walk through how they drafted and revised the sentence structure in this section?", count: sentences.length, matchPositions: sentences.map((sentence) => sentence.start) });
}

function getStatistics(sourceText: string, normalizedText: string, findings: MarkerFinding[], wordCount: number): ReviewStatistics {
  const paragraphs = sourceText.split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\s+/g, " ").trim()).filter(Boolean);
  const effectiveParagraphs = paragraphs.length ? paragraphs : normalizedText ? [normalizedText] : [];
  const flaggedParagraphs = effectiveParagraphs.filter((paragraph) => {
    const lower = paragraph.toLowerCase();
    return findings.some((finding) => lower.includes(finding.phrase.toLowerCase()));
  }).length;
  const markerInstances = findings.reduce((total, finding) => total + finding.count, 0);
  const sentenceEndingObservations = normalizedText && !/[.!?][”"')\]]?$/.test(normalizedText) ? 1 : 0;
  const lowercaseSentenceStarts = Array.from(normalizedText.matchAll(/[.!?][”"')\]]?\s+([a-z])/g)).length;
  return { markerCategories: findings.length, markerInstances, paragraphCount: effectiveParagraphs.length, flaggedParagraphs, flaggedParagraphRate: effectiveParagraphs.length ? Math.round((flaggedParagraphs / effectiveParagraphs.length) * 100) : 0, templateLanguageRate: wordCount ? Math.round((markerInstances / wordCount) * 1000) / 10 : 0, mechanicsSignals: { sentenceEndingObservations, lowercaseSentenceStarts, total: sentenceEndingObservations + lowercaseSentenceStarts } };
}

function buildRecommendations(findings: MarkerFinding[], statistics: ReviewStatistics): RevisionRecommendation[] {
  const ids = new Set(findings.map((finding) => finding.id));
  const recommendations: RevisionRecommendation[] = [];
  if (ids.has("markdown-heading-artifacts") || ids.has("markdown-list-artifacts")) recommendations.push({ id: "remove-drafting-format", title: "Revise drafting-format artifacts", detail: "Replace copied Markdown headings or list markers with the format required by the assignment, and ask the student to describe the drafting process." });
  if (ids.has("stock-academic-phrasing") || ids.has("generic-abstraction-frames") || ids.has("conclusion-template") || ids.has("custom-assignment-phrases")) recommendations.push({ id: "make-language-specific", title: "Replace template language with precise detail", detail: "Choose one matched phrase and rewrite it using a concrete claim, example, source, or observation from the student’s own work." });
  if (ids.has("formulaic-transitions")) recommendations.push({ id: "vary-connections", title: "Make connections between ideas more direct", detail: "Keep only transitions that clarify the argument. Replace others by naming the relationship between the surrounding claims or evidence." });
  if (ids.has("paired-balance-templates") || ids.has("repeated-phrase-sequence") || ids.has("highly-regular-paragraphs") || ids.has("uniform-sentence-cadence")) recommendations.push({ id: "discuss-drafting-process", title: "Discuss the drafting and revision process", detail: "Ask the student to explain how they outlined, composed, and revised this section, then vary structure only where it does not serve the assignment." });
  if (statistics.mechanicsSignals.total > 0) recommendations.push({ id: "complete-editing-pass", title: "Complete a focused mechanics pass", detail: "Check sentence endings and the capitalization of sentences after terminal punctuation before resubmitting a revision." });
  if (!recommendations.length) recommendations.push({ id: "preserve-evidence", title: "Use context before drawing conclusions", detail: "No configured pattern matched. This does not verify human authorship or rule out writing assistance; compare the work with the assignment and the student’s process." });
  return recommendations.slice(0, 3);
}

export function analyzeEssay(text: string, ruleSet: AssignmentRuleSet = SYSTEM_DEFAULT_RULE_SET): EssayReview {
  const sourceText = text.trim();
  const normalizedText = sourceText.replace(/\s+/g, " ").trim();
  const lowerText = normalizedText.toLowerCase();
  const wordCount = countWords(normalizedText);
  const enabled = new Set(ruleSet.enabledBaseRuleIds);
  const findings = [
    enabled.has("stock-academic-phrasing") ? findPhraseRule(normalizedText, lowerText, STOCK_PHRASES) : null,
    enabled.has("formulaic-transitions") ? findTransitionMarker(normalizedText, lowerText, wordCount) : null,
    enabled.has("generic-abstraction-frames") ? findPhraseRule(normalizedText, lowerText, GENERIC_ABSTRACTION) : null,
    enabled.has("paired-balance-templates") ? findBalanceMarker(normalizedText, lowerText) : null,
    enabled.has("conclusion-template") ? findPhraseRule(normalizedText, lowerText, CONCLUSION_TEMPLATE) : null,
    enabled.has("repeated-phrase-sequence") ? findRepeatedSequence(normalizedText) : null,
    enabled.has("markdown-heading-artifacts") ? findMarkdownHeadingArtifacts(sourceText) : null,
    enabled.has("markdown-list-artifacts") ? findMarkdownListArtifacts(sourceText) : null,
    enabled.has("highly-regular-paragraphs") ? findRegularParagraphMarker(sourceText) : null,
    enabled.has("uniform-sentence-cadence") ? findUniformSentenceCadence(sourceText) : null,
    findCustomPhrases(sourceText, sourceText.toLowerCase(), ruleSet.customPhrases),
  ].filter((finding): finding is MarkerFinding => finding !== null);
  const containsRawFormatting = findings.some((finding) => finding.id === "markdown-heading-artifacts" || finding.id === "markdown-list-artifacts");
  const level: FollowUpLevel = findings.length <= 1 ? (containsRawFormatting ? "some" : "few") : findings.length <= 3 ? "some" : "more";
  const statistics = getStatistics(sourceText, normalizedText, findings, wordCount);
  const revisionGuidanceSuggested = findings.length >= 2 || statistics.mechanicsSignals.total >= 2 || containsRawFormatting;
  return { wordCount, level, findings, statistics, revisionGuidanceSuggested, recommendations: buildRecommendations(findings, statistics), ruleSetId: ruleSet.id, ruleSetName: ruleSet.name, checkedAt: new Date().toISOString() };
}

export const FOLLOW_UP_COPY: Record<FollowUpLevel, { title: string; detail: string }> = {
  few: { title: "Few markers", detail: "The checker found few of the configured patterns. This does not verify human authorship or rule out writing assistance." },
  some: { title: "Some markers", detail: "Configured patterns are worth reviewing in assignment context; they are not an authorship conclusion." },
  more: { title: "More markers to review", detail: "Several configured patterns appeared. Use them as educator conversation prompts, not a conclusion." },
};
