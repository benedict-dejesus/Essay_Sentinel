# Expanded Deterministic Review Signals

## Purpose

The original rules focused on a narrow list of reusable academic phrases. A polished generated response can avoid those exact phrases, so a zero-match result cannot be treated as a clean bill of authorship. The expanded rules add visible structural and formatting observations that are useful for an educator conversation while retaining the app’s non-authorship boundary.

| Signal | Deterministic trigger | Follow-up meaning |
| --- | --- | --- |
| **Markdown heading artifacts** | One or more lines begin with `#`, `##`, or `###` followed by text. | The submission still contains assistant-style or publishing-style formatting that may not fit the assignment format. |
| **Markdown list artifacts** | Two or more lines begin with a Markdown bullet, numbered list token, or task-list token. | The writing may contain response formatting that should be reviewed or revised for the assignment. |
| **Expanded template language** | Exact matches to a maintained public list of broad phrases such as “it is crucial to,” “at its core,” and “serves as a reminder.” | The writer used highly reusable rhetorical phrasing; ask for assignment-specific language or evidence. |
| **Highly regular paragraphs** | Four or more substantive paragraphs with tightly clustered word counts. | The paragraph cadence is unusually even. This can be intentional drafting or assistance, not proof of either. |
| **Uniform sentence cadence** | Eight or more sentences with low variation in sentence word count. | The sentence rhythm is unusually regular; ask the student about drafting, revision, and source use. |

## Status Rules

An educator receives **Revision guidance suggested** when two configured categories match, when mechanics signals reach the existing threshold, or when Markdown artifact formatting is present. Markdown artifacts are prioritized because a raw copied response can leave format clues even when the prose avoids the phrase list. A status is a prompt for review and revision, **not a declaration that the essay was AI-generated**.

## Zero-Match Result

When no configured marker matches, the result must state: “No configured pattern matched. This does not verify human authorship or rule out writing assistance.” The app should always show an educator conversation prompt rather than a reassuring “pass” label.
