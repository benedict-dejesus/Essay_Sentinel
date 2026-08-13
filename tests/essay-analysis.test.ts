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
});
