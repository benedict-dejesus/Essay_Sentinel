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
const ELEVATED_ACADEMIC_TERMS = ["ambiguous", "articulate", "compelling", "comprehensive", "consequently", "contextualize", "crucial", "delineate", "elucidate", "emphasize", "fundamental", "inherently", "intricate", "multifaceted", "nuanced", "paradigm", "prevalent", "profound", "sophisticated", "substantiate", "ubiquitous", "underscores"];
const ORDERED_COHESION_CUES = ["firstly", "secondly", "thirdly", "finally", "moreover", "furthermore", "additionally", "in conclusion", "to conclude", "ultimately"];
const CLASSIC_LLM_BUZZWORDS: PhraseRule = {
  id: "classic-llm-buzzword-cluster",
  label: "Classic LLM buzzword cluster",
  phrases: ["linguistic odyssey", "delving into", "fostering greater appreciation", "bridging historical theological concepts with contemporary scholarly discourse", "embark on a journey", "testament to the enduring", "interplay between", "profoundly resonates"],
  threshold: 2,
  rationale: "The writing combines multiple configured, highly reusable buzzword phrases associated with generically polished LLM-style prose.",
  question: "Can the student paraphrase these phrases in assignment-specific language and explain where each idea came from?",
};
const TAPESTRY_IMAGERY: PhraseRule = {
  id: "tapestry-odyssey-imagery",
  label: "Tapestry and odyssey imagery",
  phrases: ["vast tapestry", "rich tapestry", "tapestry of insights", "amidst this rich tapestry", "tapestries of language and symbolism", "linguistic odyssey"],
  rationale: "The writing uses a configured broad visual or journey metaphor that can substitute for assignment-specific explanation.",
  question: "What concrete evidence, source, or observation could replace this broad metaphor?",
};
const SECTION_DEFINITIONS = [
  { label: "Abstract", mode: "descriptive", core: false }, { label: "Overview", mode: "descriptive", core: false }, { label: "Summary", mode: "descriptive", core: false }, { label: "Descriptive Essay", mode: "descriptive", core: false },
  { label: "Methodology", mode: "method", core: true }, { label: "Research Design", mode: "method", core: true }, { label: "Data Collection", mode: "method", core: true }, { label: "Analysis Plan", mode: "method", core: true },
  { label: "Research Questions", mode: "proposal", core: true }, { label: "Literature Review", mode: "proposal", core: true }, { label: "Theoretical Framework", mode: "proposal", core: true }, { label: "Expected Outcomes", mode: "proposal", core: true }, { label: "Timeline", mode: "proposal", core: false },
  { label: "Example Section", mode: "sample", core: false }, { label: "Sample Section", mode: "sample", core: false }, { label: "Mock Section", mode: "sample", core: false }, { label: "Sample Draft", mode: "sample", core: false },
  { label: "Appendix", mode: "appendix", core: false }, { label: "Proof Texts", mode: "appendix", core: false }, { label: "Scriptural References", mode: "appendix", core: false }, { label: "Supporting Texts", mode: "appendix", core: false },
  { label: "Introduction", mode: "general", core: false }, { label: "Conclusion", mode: "general", core: false }, { label: "References", mode: "general", core: false },
] as const;

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

function findElevatedVocabularyDensity(sourceText: string, lowerText: string): MarkerFinding | null {
  const matches = ELEVATED_ACADEMIC_TERMS.flatMap((term) => Array.from(lowerText.matchAll(new RegExp(`\\b${term}\\b`, "g"))).map((match) => ({ term, start: match.index ?? 0 })));
  const uniqueTerms = new Set(matches.map((match) => match.term));
  if (matches.length < 5 || uniqueTerms.size < 4) return null;
  const first = matches.sort((a, b) => a.start - b.start)[0];
  return makeFinding({ id: "elevated-academic-vocabulary", label: "Elevated academic vocabulary density", rationale: `The essay uses ${matches.length} configured elevated academic terms across ${uniqueTerms.size} distinct words.`, sourceText, start: first.start, phrase: first.term, question: "Can the student define or paraphrase the selected vocabulary and explain why each term fits the evidence?", count: matches.length, matchPositions: matches.map((match) => match.start) });
}

function findOrderedCohesionScaffold(sourceText: string): MarkerFinding | null {
  const matches = ORDERED_COHESION_CUES.flatMap((cue) => Array.from(sourceText.toLowerCase().matchAll(new RegExp(`(?:^|\\n\\s*\\n|\\n)\\s*${cue.replaceAll(" ", "\\s+")}\\b`, "g"))).map((match) => ({ cue, start: (match.index ?? 0) + match[0].toLowerCase().lastIndexOf(cue) })));
  if (matches.length < 3) return null;
  const first = matches.sort((a, b) => a.start - b.start)[0];
  return makeFinding({ id: "ordered-cohesion-scaffold", label: "Ordered cohesion scaffold", rationale: `The writing begins ${matches.length} sections with formal sequencing or cohesion cues.`, sourceText, start: first.start, phrase: first.cue, question: "How did the student decide on this sequence of claims and evidence, and which transition is most important to the argument?", count: matches.length, matchPositions: matches.map((match) => match.start) });
}

function findHighSurfacePolishCluster(sourceText: string, wordCount: number, findings: MarkerFinding[], statistics: ReviewStatistics): MarkerFinding | null {
  const sentenceCount = Array.from(sourceText.matchAll(/[^.!?\n]+[.!?]+/g)).length;
  const ids = new Set(findings.map((finding) => finding.id));
  const hasPolishSignal = ids.has("elevated-academic-vocabulary") || ids.has("highly-regular-paragraphs") || ids.has("uniform-sentence-cadence") || ids.has("ordered-cohesion-scaffold");
  if (wordCount < 200 || sentenceCount < 10 || statistics.mechanicsSignals.total !== 0 || !hasPolishSignal) return null;
  const firstSentence = sourceText.match(/[^.!?\n]+[.!?]+/)?.[0]?.trim() ?? sourceText.slice(0, 60);
  return makeFinding({ id: "high-surface-polish-cluster", label: "High surface-polish cluster", rationale: `The essay combines ${wordCount} words, ${sentenceCount} complete sentences, no configured mechanics observations, and at least one elevated vocabulary or regularity signal.`, sourceText, start: sourceText.indexOf(firstSentence), phrase: firstSentence, question: "Can the student describe the drafting stages, revisions, tools, and source notes that produced this final level of polish?", count: 1, matchPositions: [sourceText.indexOf(firstSentence)] });
}

type SectionMatch = { label: string; mode: string; core: boolean; start: number; phrase: string };

function findRecognizedSectionHeadings(sourceText: string): SectionMatch[] {
  const matches: SectionMatch[] = [];
  let cursor = 0;
  for (const line of sourceText.split("\n")) {
    const trimmed = line.trim();
    const candidate = trimmed.replace(/^#{1,6}\s+/, "").replace(/:$/, "").trim();
    const normalized = candidate.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const definition = SECTION_DEFINITIONS.find((item) => item.label.toLowerCase().replace(/[^a-z0-9]+/g, " ") === normalized);
    if (definition && candidate.length <= 60 && (trimmed.startsWith("#") || trimmed.endsWith(":") || candidate.length <= 28)) {
      matches.push({ ...definition, start: cursor + line.indexOf(trimmed), phrase: trimmed });
    }
    cursor += line.length + 1;
  }
  return matches;
}

function findRigidProposalTemplate(sourceText: string): MarkerFinding | null {
  const headings = findRecognizedSectionHeadings(sourceText);
  const distinct = new Map(headings.map((heading) => [heading.label, heading]));
  const proposalCore = Array.from(distinct.values()).filter((heading) => heading.core).length;
  if (distinct.size < 5 || proposalCore < 3) return null;
  const first = Array.from(distinct.values()).sort((a, b) => a.start - b.start)[0];
  return makeFinding({ id: "rigid-academic-proposal-template", label: "Rigid academic proposal template", rationale: `The document contains ${distinct.size} distinct recognized section headings, including ${proposalCore} proposal-core headings.`, sourceText, start: first.start, phrase: first.phrase, question: "Does this assignment require a formal proposal structure, and can the student explain how each section was drafted for this specific task?", count: distinct.size, matchPositions: Array.from(distinct.values()).map((heading) => heading.start) });
}

function findFragmentedDocumentFormat(sourceText: string): MarkerFinding | null {
  const headings = findRecognizedSectionHeadings(sourceText);
  const distinct = new Map(headings.map((heading) => [heading.label, heading]));
  const modes = new Set(Array.from(distinct.values()).filter((heading) => heading.mode !== "general").map((heading) => heading.mode));
  if (distinct.size < 5 || modes.size < 3) return null;
  const first = Array.from(distinct.values()).sort((a, b) => a.start - b.start)[0];
  return makeFinding({ id: "fragmented-multi-document-format", label: "Fragmented multi-document format", rationale: `The document combines ${modes.size} recognized document modes across ${distinct.size} section labels.`, sourceText, start: first.start, phrase: first.phrase, question: "Which single document form does the assignment require, and which sections should be removed, moved, or rewritten to fit it?", count: modes.size, matchPositions: Array.from(distinct.values()).map((heading) => heading.start) });
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
  if (ids.has("classic-llm-buzzword-cluster") || ids.has("tapestry-odyssey-imagery")) recommendations.push({ id: "replace-llm-buzzwords", title: "Replace broad buzzwords with assignment evidence", detail: "Rewrite each matched buzzword or broad metaphor using a concrete source, observation, quotation, or claim from the assignment." });
  if (ids.has("rigid-academic-proposal-template")) recommendations.push({ id: "check-proposal-structure", title: "Check whether the proposal template fits", detail: "Keep only the sections required by the assignment and ask the student to explain how the remaining structure was developed." });
  if (ids.has("fragmented-multi-document-format")) recommendations.push({ id: "unify-document-form", title: "Unify the document form", detail: "Choose the assignment’s intended genre, then remove or rewrite unrelated abstract, methodology, sample, or appendix sections." });
  if (ids.has("stock-academic-phrasing") || ids.has("generic-abstraction-frames") || ids.has("conclusion-template") || ids.has("custom-assignment-phrases") || ids.has("elevated-academic-vocabulary")) recommendations.push({ id: "make-language-specific", title: "Replace template language with precise detail", detail: "Choose one matched phrase and rewrite it using a concrete claim, example, source, or observation from the student’s own work." });
  if (ids.has("formulaic-transitions")) recommendations.push({ id: "vary-connections", title: "Make connections between ideas more direct", detail: "Keep only transitions that clarify the argument. Replace others by naming the relationship between the surrounding claims or evidence." });
  if (ids.has("paired-balance-templates") || ids.has("repeated-phrase-sequence") || ids.has("highly-regular-paragraphs") || ids.has("uniform-sentence-cadence") || ids.has("ordered-cohesion-scaffold") || ids.has("high-surface-polish-cluster")) recommendations.push({ id: "discuss-drafting-process", title: "Discuss the drafting and revision process", detail: "Ask the student to explain how they outlined, composed, and revised this section, then vary structure only where it does not serve the assignment." });
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
  const baseFindings = [
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
    enabled.has("elevated-academic-vocabulary") ? findElevatedVocabularyDensity(sourceText, lowerText) : null,
    enabled.has("ordered-cohesion-scaffold") ? findOrderedCohesionScaffold(sourceText) : null,
    enabled.has("classic-llm-buzzword-cluster") ? findPhraseRule(sourceText, sourceText.toLowerCase(), CLASSIC_LLM_BUZZWORDS) : null,
    enabled.has("tapestry-odyssey-imagery") ? findPhraseRule(sourceText, sourceText.toLowerCase(), TAPESTRY_IMAGERY) : null,
    enabled.has("rigid-academic-proposal-template") ? findRigidProposalTemplate(sourceText) : null,
    enabled.has("fragmented-multi-document-format") ? findFragmentedDocumentFormat(sourceText) : null,
    findCustomPhrases(sourceText, sourceText.toLowerCase(), ruleSet.customPhrases),
  ].filter((finding): finding is MarkerFinding => finding !== null);
  const preliminaryStatistics = getStatistics(sourceText, normalizedText, baseFindings, wordCount);
  const polishCluster = enabled.has("high-surface-polish-cluster") ? findHighSurfacePolishCluster(sourceText, wordCount, baseFindings, preliminaryStatistics) : null;
  const findings = [...baseFindings, polishCluster].filter((finding): finding is MarkerFinding => finding !== null);
  const containsRawFormatting = findings.some((finding) => finding.id === "markdown-heading-artifacts" || finding.id === "markdown-list-artifacts");
  const containsSurfacePolish = findings.some((finding) => finding.id === "high-surface-polish-cluster");
  const containsStrongPattern = findings.some((finding) => ["classic-llm-buzzword-cluster", "tapestry-odyssey-imagery", "rigid-academic-proposal-template", "fragmented-multi-document-format"].includes(finding.id));
  const level: FollowUpLevel = findings.length <= 1 ? (containsRawFormatting || containsSurfacePolish || containsStrongPattern ? "some" : "few") : findings.length <= 3 ? "some" : "more";
  const statistics = getStatistics(sourceText, normalizedText, findings, wordCount);
  const revisionGuidanceSuggested = findings.length >= 2 || statistics.mechanicsSignals.total >= 2 || containsRawFormatting || containsSurfacePolish || containsStrongPattern;
  return { wordCount, level, findings, statistics, revisionGuidanceSuggested, recommendations: buildRecommendations(findings, statistics), ruleSetId: ruleSet.id, ruleSetName: ruleSet.name, checkedAt: new Date().toISOString() };
}

export const FOLLOW_UP_COPY: Record<FollowUpLevel, { title: string; detail: string }> = {
  few: { title: "Few markers", detail: "The checker found few of the configured patterns. This does not verify human authorship or rule out writing assistance." },
  some: { title: "Some markers", detail: "Configured patterns are worth reviewing in assignment context; they are not an authorship conclusion." },
  more: { title: "More markers to review", detail: "Several configured patterns appeared. Use them as educator conversation prompts, not a conclusion." },
};
