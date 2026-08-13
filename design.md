# Essay Sentinel — Mobile Interface Design

## Product Intent

Essay Sentinel is a lightweight educator-facing companion for reviewing student-submitted writing. It imports a PDF or DOCX document, or accepts pasted text, then applies **deterministic language-marker rules**. The app does not use AI or make an authorship determination. Instead, it surfaces specific, explainable patterns that may be useful to discuss with a student alongside assignment context and the educator’s judgment.

## Mobile Principles

The interface is designed for a **9:16 portrait screen** and one-handed operation. Primary actions occupy the lower half of the screen, all controls meet a 44-point minimum target, and navigation follows familiar iOS tab conventions and stack transitions. Findings use plain language and progressive disclosure. Every review includes an explicit notice that language markers are not proof of AI use.

## Screen List

| Screen | Primary content and functionality |
| --- | --- |
| **Review Queue** | A calm dashboard showing saved local reviews, a prominent `Review an essay` action, a recent-review list, and a concise responsible-use notice. |
| **New Review** | Essay title and optional student reference fields; a large text area for pasting a submission; an `Import document` control that accepts PDF and DOCX files; document metadata and source selection; and a bottom-positioned `Check markers` action. |
| **Import Progress** | A focused state that reads the selected document locally and confirms what will be checked. If text cannot be extracted, it offers a clear route to paste text instead. |
| **Review Findings** | An overall follow-up level, a non-punitive review status, a compact statistics panel, plain-language marker cards with the exact matching excerpt, and deterministic revision recommendations. |
| **Review Detail** | A saved local review with document metadata, marker findings, notes, and an option to delete the local record. |
| **Guidance** | A concise explanation of the deterministic checks, statistics definitions, document limitations, privacy posture, and a responsible academic-integrity review process. |
| **Rule-set Settings** | An educator-only settings screen for selecting an active assignment profile, naming and describing a profile, choosing baseline marker categories, and adding exact custom language phrases. |

## Key User Flows

| User goal | Flow |
| --- | --- |
| Review pasted text | `Review Queue` → `Review an essay` → choose `Paste text` → add text on `New Review` → `Check markers` → `Review Findings`. |
| Review an uploaded document | `Review Queue` → `Review an essay` → choose `Import document` → select a PDF or DOCX → `Import Progress` → inspect extracted text preview → `Check markers` → `Review Findings`. |
| Act on revision guidance | `Review Findings` → inspect the statistics panel and review status → read the linked deterministic recommendations → use the suggestions in an educator–student revision conversation. |
| Understand a marker | `Review Findings` → tap a marker card → reveal the rule description, text excerpt, and suggested educator follow-up question. |
| Return to prior work | `Review Queue` → tap a recent review → `Review Detail` → revisit findings, edit an educator note, or delete the local record. |
| Learn safeguards | any screen → `Guidance` tab → read the limits of automated marker checks and a recommended human-review procedure. |
| Configure an assignment | `Settings` tab → select an existing profile or `Create rule set` → name the assignment type → enable baseline categories and add exact phrases → save → return to `New Review` with the profile shown as active. |

## Information Hierarchy

The **follow-up level** is an orienting cue only. It uses wording such as “Few markers,” “Some markers,” and “More markers to review,” never an “AI probability” or declaration of AI use. A review status of **“Revision guidance suggested”** appears when the configured review threshold is reached; it is not a failure grade or academic-integrity finding. Marker cards are ordered by how directly and clearly the matching language appears in the document. Each card includes the deterministic rule name, the matched excerpt, a neutral explanation, and a suggested conversation prompt before any action that could be interpreted as a punitive conclusion.

## Review Statistics

| Statistic | Definition | Use boundary |
| --- | --- | --- |
| **Marker categories** | The number of configured marker categories with at least one match. | A count of visible rules, not an AI score. |
| **Marker instances** | The total number of exact phrase or rule matches represented by the findings. | Helps prioritize review, but repeated assignment language can increase the count. |
| **Paragraph coverage** | The proportion of non-empty paragraphs containing at least one marker match. | Shows distribution of matched patterns; it does not measure authorship. |
| **Template-language rate** | Marker instances per 100 words. | Supports comparisons across essay lengths only within the same assignment context. |
| **Mechanics signals** | Deterministic counts of incomplete-ending punctuation and sentence-start capitalization observations. | A lightweight editing cue, not a grammar grade or measure of “perfection.” |

## Responsive Behavior

Mobile remains the primary canvas. On a desktop-width view, the review queue uses a centered readable column and the findings screen presents the statistics and status card alongside marker findings when room allows. The reading line length remains constrained, large action controls remain available, and all controls retain the mobile-first hierarchy rather than becoming a dense desktop dashboard.

## Supported Sources and Boundaries

| Source | Planned treatment | Boundary communicated to the educator |
| --- | --- | --- |
| **Pasted text** | Processed directly by the deterministic marker engine. | Recommended for the clearest review and for any scan-based PDF. |
| **DOCX** | Text is extracted from the document body before analysis. | Tables, comments, footnotes, and complex formatting may not be represented. |
| **PDF** | Embedded selectable text is extracted when available. | Scan-only, protected, or unusually formatted PDFs may not yield usable text; the app directs the educator to paste text. |

## Assignment Rule Sets

Each rule set is stored locally and contains an educator-facing name, a short assignment description, an enabled subset of the app’s visible baseline categories, and up to 20 custom exact phrases. Custom entries are escaped as literal text; the app does not accept regular expressions, hidden weights, or external rule feeds. Selecting a rule set changes only the transparent deterministic checks used for a new review.

| Rule-set element | Educator control | Guardrail |
| --- | --- | --- |
| **Name and description** | Identify the assignment type, such as “Literary analysis” or “Lab reflection.” | Names describe an assignment workflow, not a student label. |
| **Baseline categories** | Enable or disable each visible deterministic category. | Disabled rules do not affect findings, statistics, or guidance. |
| **Custom phrases** | Add one exact language phrase per line. | Entries are normalized, shown back to the educator, limited in length, and are not treated as probabilistic AI evidence. |
| **Active profile** | Select the profile used for subsequent reviews. | Existing saved reviews retain the rule-set name applied when they were created. |

## Visual Direction and Color Choices

| Token | Color | Purpose |
| --- | --- | --- |
| **Ink Navy** | `#172033` | Primary text, navigation chrome, and institutional credibility. |
| **Paper** | `#F7F6F2` | Warm off-white base that suggests an annotated document rather than a generic dashboard. |
| **Indigo Mark** | `#4F46E5` | Primary action, active tab, and focus states. |
| **Soft Lavender** | `#EEECFF` | Gentle surfaces for educational guidance and selected states. |
| **Slate** | `#64748B` | Secondary copy, timestamps, and metadata. |
| **Follow-up Amber** | `#C56A12` | Markers that merit a discussion; never styled as an error. |
| **Calm Teal** | `#0F766E` | Few-marker and completed states. |
| **Rose** | `#B42318` | Destructive actions only, such as deleting a local review. |

## Final Teal-and-Rose Theme System

The final visual system applies the user-specified palette through a disciplined hierarchy. **Deep Teal `#002C39`** carries primary text and the dark-mode canvas. **Teal Blue `#015061`** anchors light-mode actions and navigation. **Signal Mint `#00C18E`** provides a high-attention accent only with Deep Teal text, avoiding low-contrast white-on-mint combinations. **Soft Rose `#FFF7F7`** is the light-mode canvas and warm neutral counterpart.

| Role | Light mode | Dark mode | Contrast and use |
| --- | --- | --- | --- |
| Canvas | `#FFF7F7` | `#002C39` | Provides clear figure–ground separation. |
| Primary action | `#015061` with white text | `#00C18E` with `#002C39` text | Keeps button labels legible at small mobile sizes. |
| Primary text | `#002C39` | `#FFF7F7` | Reserved for headings and body copy. |
| Secondary text | `#37636E` | `#B8D2D7` | Used only where secondary contrast is sufficient. |
| Surface | `#FFFFFF` | `#0A3D4A` | Separates cards from the canvas without unnecessary borders. |
| Selection / emphasis | `#D8F8EE` | `#0C5C60` | Supports active profiles, chips, and quiet callouts. |

## Appearance Preference

Educators may choose **Light** or **Dark** from Settings. The choice is stored locally and applied to the app’s token system, including background, card, text, border, action, and state colors. The current selection is visually explicit and does not rely on color alone: a check indicator and text label identify the active appearance.

## Principles of Design Applied

The interface uses **contrast** to distinguish actions from supporting information; **alignment** to maintain a single readable mobile column; **repetition** through consistent rounded cards, type scales, and status chips; **proximity** to group statistics with their explanations; and **hierarchy** to lead from assignment context to results, revision guidance, and supporting detail. On desktop, content remains constrained to readable widths instead of expanding into an unstructured dashboard.

## Accessibility and Tone

Body copy uses high-contrast Ink Navy on Paper. Color is never the sole carrier of meaning: every status includes an icon and descriptive text. Findings describe observable text patterns only. The `Guidance` screen makes clear that legitimate support, a student’s natural prose, or assignment conventions can produce markers, and that no automated result should be the sole basis for an academic consequence.
