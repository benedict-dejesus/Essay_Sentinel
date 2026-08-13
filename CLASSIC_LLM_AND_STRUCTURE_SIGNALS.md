# Classic LLM and Document-Structure Signals

## Reliability Boundary

Essay Sentinel can be **reliable about reporting exact, configured patterns**. It cannot reliably infer who wrote a passage from those patterns alone. Each signal below records an observable phrase or document form, identifies the excerpt, and produces an educator follow-up prompt rather than an authorship verdict.

| Marker | Deterministic trigger | Rationale shown in the app |
| --- | --- | --- |
| **Classic LLM buzzword cluster** | At least two exact configured phrases, or three total configured phrase matches, from the visible buzzword list. | The text relies on multiple highly reusable, generically polished phrases associated with LLM-style academic prose. |
| **Tapestry and odyssey imagery** | Two or more matches to configured tapestry/odyssey metaphors, or one phrase with an explicit “rich tapestry” / “linguistic odyssey” construction. | The text repeatedly uses broad visual-journey imagery that may be rhetorical rather than assignment-specific. |
| **Rigid academic proposal template** | Five or more distinct recognized academic-proposal section headings, including at least three proposal-core headings. | The submission follows a highly standardized proposal scaffold that may require a process conversation. |
| **Fragmented multi-document format** | Recognized headings from three or more document-mode groups: descriptive/abstract, research method, thesis proposal, sample/mock content, or appendix/proof text. | The submission shifts across multiple document types instead of retaining one assignment-appropriate form. |

## Configured Phrase List

The classic buzzword list includes the user-requested phrases and close literal variants: `vast tapestry`, `rich tapestry`, `tapestry of insights`, `tapestries of language`, `linguistic odyssey`, `delving into`, `fostering greater appreciation`, and `bridging historical theological concepts with contemporary scholarly discourse`. It also includes related fixed phrase constructions such as `embark on a journey`, `testament to the enduring`, `interplay between`, and `profoundly resonates`.

## Proposal-Core Headings

The proposal-template marker recognizes headings such as **Abstract**, **Introduction**, **Research Questions**, **Literature Review**, **Theoretical Framework**, **Methodology**, **Research Design**, **Data Collection**, **Expected Outcomes**, **Timeline**, **Conclusion**, and **References**. A heading is counted only when it appears as a standalone line, Markdown heading, or short label line ending in a colon.

## Fragmented Document-Mode Groups

| Mode group | Representative headings |
| --- | --- |
| Descriptive or abstract | Abstract, Overview, Summary, Descriptive Essay |
| Research method guide | Methodology, Research Design, Data Collection, Analysis Plan |
| Thesis proposal | Research Questions, Literature Review, Theoretical Framework, Expected Outcomes |
| Sample or mock content | Example Section, Sample Section, Mock Section, Sample Draft |
| Appendix or proof-text | Appendix, Proof Texts, Scriptural References, Supporting Texts |

The settings screen exposes these as standard marker categories, so educators can disable them for assignments that legitimately use a proposal or appendix format.
