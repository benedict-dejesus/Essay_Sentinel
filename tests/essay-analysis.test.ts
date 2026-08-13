import { describe, expect, it } from "vitest";
import { analyzeEssay } from "../shared/essay-analysis";
import { SYSTEM_DEFAULT_RULE_SET } from "../shared/rule-sets";

describe("deterministic essay marker analysis", () => {
  it("returns an explainable stock-phrase finding with the matched excerpt", () => {
    const result = analyzeEssay(
      "It is important to note that the local library offers free workshops for teenagers. " +
        "Students can learn research skills, meet community mentors, and find books that support their assignments. " +
        "The program also creates a quiet place to study after school when home is busy. " +
        "These services are useful because they make reliable information and patient help easier to access. " +
        "A student could describe one workshop, interview a librarian, and explain how the experience changed their approach to a project. " +
        "That concrete evidence would make the argument clearer for a reader.",
    );

    const finding = result.findings.find((item) => item.id === "stock-academic-phrasing");
    expect(finding?.phrase).toBe("it is important to note");
    expect(finding?.excerpt.toLowerCase()).toContain("important to note");
    expect(finding?.question).toContain("own everyday words");
  });

  it("only raises the transition marker when the fixed density threshold is reached", () => {
    const text = [
      "Moreover, students need time to practice research before a final project is due.",
      "Furthermore, teachers can model how to judge a source before asking students to work independently.",
      "Additionally, a shared planning sheet can help a class divide a large assignment into smaller steps.",
      "Therefore, deadlines become easier to understand because each task has a clear purpose.",
      "A student can then explain the evidence they chose and why it supports a particular claim.",
      "The final reflection should name one challenge and describe a change the student would make next time.",
      "These details keep the discussion grounded in the student’s own process and choices.",
      "This paragraph includes enough ordinary prose to make the marker a density-based check rather than a single-word match.",
      "An educator should still read the full submission and compare it with assignment expectations before drawing any conclusion.",
      "The pattern merely identifies formal transition language that may be worth discussing in context.",
    ].join(" ");

    const result = analyzeEssay(text);
    const finding = result.findings.find((item) => item.id === "formulaic-transitions");
    expect(finding?.count).toBeGreaterThanOrEqual(4);
    expect(finding?.rationale).toContain("review threshold");
  });

  it("does not treat an absence of configured markers as authorship verification", () => {
    const result = analyzeEssay(
      "My class planted tomatoes behind the science room in April. I measured the seedlings every Monday and wrote the height in a notebook. " +
        "When the weather turned cold, half the plants stopped growing. Our group moved the pots near a sunny wall and checked the soil before lunch. " +
        "By May, two plants had yellow flowers. The project taught me that a small change in light or water can affect an experiment. " +
        "Next time, I would label each pot more carefully so that our observations are easier to compare.",
    );

    expect(result.level).toBe("few");
    expect(result.findings.some((item) => item.label.toLowerCase().includes("authorship"))).toBe(false);
  });

  it("reports explainable review statistics and suggests revision guidance at the configured threshold", () => {
    const result = analyzeEssay(
      "It is important to note that the class should begin the project with a shared source list. " +
        "Moreover, students can explain why one source is reliable before they use it. " +
        "Furthermore, they can record a quotation and describe how it supports the main point. " +
        "Additionally, they can compare that evidence with an example from a local report. " +
        "Therefore, the final paragraph can connect the evidence to a specific conclusion. " +
        "The complexities of the project become easier to discuss when every group member has a clear job.\n\n" +
        "In conclusion, the team can revise the draft after checking each source and sentence. " +
        "A student should name the evidence they selected and explain the reason for their choice.",
    );

    expect(result.statistics.markerCategories).toBeGreaterThanOrEqual(3);
    expect(result.statistics.markerInstances).toBeGreaterThanOrEqual(result.statistics.markerCategories);
    expect(result.statistics.paragraphCount).toBe(2);
    expect(result.statistics.flaggedParagraphRate).toBeGreaterThan(0);
    expect(result.statistics.templateLanguageRate).toBeGreaterThan(0);
    expect(result.revisionGuidanceSuggested).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0].detail).not.toMatch(/AI score|authorship/i);
  });

  it("applies an educator’s selected categories and literal custom phrases without an AI score", () => {
    const ruleSet = {
      ...SYSTEM_DEFAULT_RULE_SET,
      id: "literary-analysis",
      name: "Literary analysis",
      enabledBaseRuleIds: [],
      customPhrases: ["the evidence clearly shows"],
    };
    const result = analyzeEssay(
      "The evidence clearly shows that the narrator changes after the final scene. " +
        "The paragraph explains how one image returns near the ending and why that detail matters. " +
        "The writer could add a quotation before connecting the image to the claim about change. " +
        "This approach keeps the interpretation grounded in a moment from the text rather than in a broad summary.",
      ruleSet,
    );

    expect(result.ruleSetName).toBe("Literary analysis");
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].id).toBe("custom-assignment-phrases");
    expect(result.findings[0].phrase).toBe("the evidence clearly shows");
  });

  it("surfaces raw Markdown heading artifacts left in a polished copied response", () => {
    const result = analyzeEssay(
      "### The Value of Community Gardens\n\n" +
        "It is crucial to recognize that community gardens create more than a space for vegetables. " +
        "At its core, the project connects neighbors through shared work and conversation.\n\n" +
        "### A Shared Responsibility\n\n" +
        "The garden serves as a reminder that public spaces improve when people contribute time and care. " +
        "Students can interview volunteers, observe a work day, and explain how one example supports the larger claim.",
    );

    const markdown = result.findings.find((item) => item.id === "markdown-heading-artifacts");
    expect(markdown?.count).toBe(2);
    expect(markdown?.phrase).toContain("###");
    expect(result.level).toBe("some");
    expect(result.revisionGuidanceSuggested).toBe(true);
    expect(result.recommendations[0].id).toBe("remove-drafting-format");
  });

  it("explains that a zero-match result does not verify human authorship", () => {
    const minimalRuleSet = { ...SYSTEM_DEFAULT_RULE_SET, enabledBaseRuleIds: [], customPhrases: [] };
    const result = analyzeEssay("A short original response can describe a class observation and name one change the writer would make after discussion.", minimalRuleSet);

    expect(result.findings).toHaveLength(0);
    expect(result.recommendations[0].detail).toMatch(/does not verify human authorship/i);
  });

  it("surfaces a transparent surface-polish cluster without declaring AI authorship", () => {
    const result = analyzeEssay(
      "Firstly, the nuanced proposal offers a comprehensive response to the neighborhood transit problem. The analysis identifies a fundamental connection between reliable buses and access to jobs. A sophisticated map of late routes gives residents a concrete example of the challenge. The writer can substantiate the claim by comparing travel times before and after the schedule change.\n\n" +
        "Secondly, the multifaceted evidence shows why a single policy cannot solve every concern. A compelling interview with a night-shift worker can contextualize the statistics for a public audience. The proposal may delineate which stops need lighting and which need more frequent service. Consequently, the argument remains focused on a practical outcome rather than a broad promise.\n\n" +
        "Finally, a profound conclusion can connect the recommendation to the city budget. The writer can emphasize that a transparent timeline helps people evaluate progress. The report can articulate how community feedback changes the next phase of planning. A clear final paragraph can explain why the selected evidence supports the proposed route changes.\n\n" +
        "In conclusion, the structured essay presents a coherent sequence of claims, examples, and revisions. The student should still be able to explain the sources, wording, and drafting decisions behind the polished final version. The reader can ask which paragraph changed most during revision and why that change improved the argument. The response remains a starting point for an educator conversation rather than an authorship decision.",
    );

    expect(result.findings.some((item) => item.id === "elevated-academic-vocabulary")).toBe(true);
    expect(result.findings.some((item) => item.id === "ordered-cohesion-scaffold")).toBe(true);
    expect(result.findings.some((item) => item.id === "high-surface-polish-cluster")).toBe(true);
    expect(result.revisionGuidanceSuggested).toBe(true);
    expect(result.recommendations.some((item) => item.id === "discuss-drafting-process")).toBe(true);
    expect(result.recommendations.every((item) => !/AI score|authorship conclusion/i.test(item.detail))).toBe(true);
  });

  it("flags configured tapestry imagery and classic LLM buzzword combinations", () => {
    const result = analyzeEssay(
      "In the vast tapestry of religious discourse, the text presents a rich tapestry of insights. " +
        "This linguistic odyssey involves delving into the sources and fostering greater appreciation for their meaning. " +
        "The discussion focuses on bridging historical theological concepts with contemporary scholarly discourse.",
    );

    expect(result.findings.some((item) => item.id === "tapestry-odyssey-imagery")).toBe(true);
    expect(result.findings.some((item) => item.id === "classic-llm-buzzword-cluster")).toBe(true);
    expect(result.recommendations.some((item) => item.id === "replace-llm-buzzwords")).toBe(true);
  });

  it("flags a rigid proposal scaffold and a fragmented mix of document modes", () => {
    const result = analyzeEssay(
      "# Abstract\nA brief description of the project.\n\n" +
        "# Research Questions\nWhat evidence supports the claim?\n\n" +
        "# Literature Review\nThe review summarizes the relevant sources.\n\n" +
        "# Theoretical Framework\nThe framework defines the central concepts.\n\n" +
        "# Methodology\nThe guide lists the proposed collection steps.\n\n" +
        "# Expected Outcomes\nThe proposal predicts a clear result.\n\n" +
        "# Example Section\nThis sample shows a possible final paragraph.\n\n" +
        "# Appendix\nProof Texts and supporting material appear here.",
    );

    expect(result.findings.some((item) => item.id === "rigid-academic-proposal-template")).toBe(true);
    expect(result.findings.some((item) => item.id === "fragmented-multi-document-format")).toBe(true);
    expect(result.recommendations.some((item) => item.id === "check-proposal-structure")).toBe(true);
    expect(result.recommendations.some((item) => item.id === "unify-document-form")).toBe(true);
  });
});
