# Deterministic Marker Policy

## Purpose and Boundary

Essay Sentinel applies fixed, inspectable pattern checks. It does **not** classify authorship, estimate an “AI percentage,” identify a person, call a language model, or use a statistical model. A match records only that a defined pattern appeared in the submitted text. Educators must consider assignment expectations, prior student work, accessibility needs, permitted support, and the student’s explanation before reaching any conclusion.

## Text Eligibility

The checker requires at least 80 words. It normalizes whitespace and compares a lowercase copy of the text while retaining the original text for excerpts. Any document text that cannot be reliably extracted is not scored; the app instead requests pasted text.

## Marker Set

| Marker | Deterministic rule | Result explanation |
| --- | --- | --- |
| **Stock academic phrasing** | Matches an exact phrase from a maintained, visible phrase list, such as “it is important to note,” “in today’s rapidly evolving world,” or “plays a pivotal role.” | The writing contains a broadly reusable academic template phrase. Review whether it fits the student’s usual voice and the assignment’s expectations. |
| **Formulaic transitions** | Counts transition phrases such as “moreover,” “furthermore,” “additionally,” and “in conclusion.” A marker is raised only when the normalized count is at least 4 per 250 words. | The text relies heavily on formal linking language. This can be a writing-style choice, not evidence of authorship. |
| **Generic abstraction frames** | Matches constructions such as “the complexities of,” “the multifaceted nature of,” and “a testament to the.” | The text uses a generalized rhetorical frame that can obscure a concrete claim. Consider asking for examples or evidence. |
| **Paired balance templates** | Matches repeated “not only … but also” or “whether … or” patterns. It is flagged only after two or more occurrences. | The text repeats a balanced sentence scaffold. Discuss whether the repetition supports the writer’s intended voice. |
| **Conclusion template** | Matches a closing template including “in conclusion,” “to conclude,” “ultimately, it is clear,” or “all things considered.” | The essay closes with a common template. This is a prompt for context, not an integrity conclusion. |
| **Repeated phrase sequence** | Finds a four-to-eight word sequence repeated at least three times after removing punctuation and common stop words. | The same phrase sequence repeats unusually often. Review whether it reflects an intentional refrain, assignment language, or unedited duplication. |

## Scoring and Findings

Each marker category can contribute at most one finding. The app’s follow-up label is intentionally limited to **Few markers** (0–1 categories), **Some markers** (2–3 categories), or **More markers to review** (4+ categories). The label does not represent likelihood, certainty, or a diagnostic score. A separate **Revision guidance suggested** status appears when the review has two or more marker categories or mechanics signals; it indicates that the app has generated specific editing prompts, not that the work has “failed” an authorship test.

## Statistics

The app reports marker categories, total marker instances, paragraph coverage, template-language rate per 100 words, and two basic mechanics signals: sentence-ending punctuation observations and lowercase starts after terminal punctuation. These measures are derived directly from the text and fixed rules. They must not be presented as an AI score, likelihood of cheating, grade, or measure of writing quality.

## Document Handling

| Source | Processing rule | Limit communicated in product |
| --- | --- | --- |
| Pasted text | Sent directly to the deterministic checker. | Best option when a document has no selectable text. |
| DOCX | The document body text is extracted; layout and non-body material are ignored. | Comments, footnotes, tables, and complex formatting may not be represented. |
| PDF | Embedded text is extracted from readable PDFs. | Image-only, password-protected, or unusually formatted PDFs may not yield usable text. |

## Data Model

Each completed review contains a local identifier, source metadata, word count, creation date, the review label, and a list of marker findings. A finding includes a stable rule identifier, marker label, neutral rationale, excerpt, excerpt start position, matched phrase, and educator follow-up prompt. The source file is not retained after text extraction; saved reviews retain extracted text only when the educator chooses to keep the review locally.

## Assignment-Specific Controls

The active local rule set filters the visible baseline categories and may append a single **Custom assignment phrases** category. This category reports exact literal phrases supplied by the educator; it does not infer intent or use a model. A custom entry must be between three and 120 characters, and duplicate entries are removed during saving. Rule sets are selected before a review and their names are preserved with saved findings for auditability.
