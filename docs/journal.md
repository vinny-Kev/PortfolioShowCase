# Engineering journal

The journal is where problems are written up as they actually happened: what I tried, where my reasoning broke, how I found out, and what I changed. It is plain HTML, CSS and JavaScript, with no framework and no build step.

| Piece | File |
|---|---|
| Index and article page | `journal.html` |
| Listing, search, filters, routing | `scripts/journal.js` |
| Markdown to article (attempts, contents, code blocks, copy) | `scripts/journalArticle.js` |
| Styles | `style/journal.css` |
| Metadata for every entry | `data/problems.json` |
| The articles | `content/fundamentals/<category>/<slug>.md` |
| Markdown parser and highlighter | `vendor/marked/`, `vendor/highlightjs/` |

Addresses: `journal.html` is the index, and `journal.html?p=<slug>` is one article. This works on static hosting such as GitHub Pages with no server rules.

## Add a new problem

1. Copy `content/fundamentals/TEMPLATE.md` to `content/fundamentals/<category>/<slug>.md`. The category folder is `algorithms`, `sql` or `software-design`. Write the article.
2. Add an entry to `data/problems.json`:

```json
{
  "slug": "your-problem-slug",
  "title": "Your Problem Title",
  "platform": "LeetCode",
  "problemNumber": 0,
  "url": "https://leetcode.com/problems/your-problem-slug/",
  "difficulty": "Medium",
  "category": "Algorithms & Data Structures",
  "language": "C",
  "date": "2026-12-01",
  "status": "documented",
  "article": "your-problem-slug.md",
  "summary": "One or two sentences that appear on the index.",
  "tags": ["strings", "sliding-window"],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "attempts": 3
}
```

3. Run `node scripts/check-data.js`, then commit and push.

That is all. No script or style changes are needed.

### Fields

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | Lowercase words joined by hyphens. Used in the address. |
| `title`, `category`, `status` | yes | `category` is one of the three names in the example above, spelled exactly. `status` is `documented`, `in-progress` or `planned`. |
| `article` | for documented | A file name like `my-problem.md`, inside the category's folder. |
| `date` | for documented | `YYYY-MM-DD`. |
| `difficulty` | no | `Easy`, `Medium` or `Hard`. Leave it out for notes that have none. |
| `platform`, `problemNumber`, `url`, `language`, `summary`, `tags` | no | `url` must be https. |
| `timeComplexity`, `spaceComplexity` | no | Shown on the article. Write them yourself. |
| `attempts` | no | Shown on the index. If present, the check compares it with the number of `## Attempt NN` sections. |

### What the data check enforces

- A **documented** entry needs a date and an article file that exists, is not empty, has at least one `##` section, and contains no `TODO:` prompts left over from the template.
- A **planned** entry must not have an article or a date.
- `attempts`, when given, must match the article.
- Slugs are unique, and the field values are valid.
- A Markdown file that nobody lists in the index is reported as a note, not an error.

The page applies the same rules when it loads. A malformed entry is skipped with a console warning instead of breaking the index.

## Writing an article

Write normal Markdown. The page title comes from the index, so don't start with a `# Title`.

### Attempts and experiments

| You write | The page does |
|---|---|
| `## Attempt 01 — Brute force [failed]` | Starts an attempt block with a coloured rule and a label. |
| `## Attempt 02 — Hash map [revised]` | Same, in the "revised" style. |
| `## Final Working Solution [final]` | Marks the final solution. |
| `## Beyond the Solution` | Marks the further-optimisation section. |
| `### Experiment 01 — Bit set [kept]` | Starts an experiment block inside it. |

Attempt tags: `failed`, `partial`, `revised`, `optimized`, `final`, `abandoned`. Experiment tags: `kept`, `rejected`, `inconclusive`. The tag is optional. An untagged attempt is shown neutrally. Use `####` for the parts inside an experiment (hypothesis, results and so on), so each experiment stays one block. There is no limit on attempts.

The suggested structure for each attempt is in the template: my reasoning, implementation, what happened, why it failed, what I learned.

### Supported Markdown

Headings (`##` to `####`), paragraphs, ordered and unordered lists (nested), tables, inline code, fenced code, blockquotes, links, images, bold and italics, and horizontal rules.

- Raw HTML in an article is shown as text. It is never run.
- Links must be http, https, mailto, relative or `#` anchors. Others lose their link.
- External links open in a new tab.
- A table scrolls sideways on a narrow screen.

### Code blocks

````text
```c title="solution.c"
int add(int a, int b) { return a + b; }
```
````

The first word is the language. `title="..."` is optional and shows a file name. Each block gets a language label and a **Copy** button.

Terminal output, compiler errors and failing tests use `text` (also `console`, `terminal`, `output`). They are shown as a distinct "Output" block, without highlighting. Always paste real output.

**Highlighted languages** (the bundled "common" build of highlight.js): C, C++, Java, SQL, Shell (`bash`, `sh`), Python, JavaScript, TypeScript, JSON, Rust, Go, Kotlin, Makefile, Diff, YAML, XML, Markdown and more. A language it doesn't know is shown as plain monospace text.

## How syntax highlighting works

highlight.js reads the declared language and wraps tokens in classes such as `hljs-keyword` or `hljs-string`. `style/journal.css` then colours those classes using the portfolio palette. Nothing is coloured by hand, and there is no highlight theme file to maintain.

## Generated contents and reading time

The contents list is built from the `##` and `###` headings, with a sticky column on wide screens and a fold on phones. The current section is highlighted as you read. Reading time is the word count outside code blocks, at 200 words per minute.

## Search and filters

The index searches title, summary, tags, platform, language and category. It filters by category, difficulty and language. The state is kept in the address (`journal.html?category=...&q=...`), so a filtered view can be shared. Planned entries sit in a collapsed "Planned, not started" group.

## Missing or broken content

| Situation | What the visitor sees |
|---|---|
| Index file missing or invalid | "The journal couldn't load", with a link back. |
| Address has an unknown slug | "Entry not found", with a link to the index. |
| Entry exists but its Markdown file is missing or empty | The entry's header and "This article couldn't be loaded". |
| Entry is planned | The header and "No article yet". |
| Malformed entry in the index | Skipped, with a console warning. |

## Dependencies

Both are single files, loaded locally, with their licences alongside. There is no build step.

| Library | Version | Licence | Size |
|---|---|---|---|
| marked (Markdown parser) | 18.1.3 | MIT | 50 KB |
| highlight.js (syntax highlighting, common languages) | 11.12.0 | BSD-3-Clause | 129 KB |

Sources: `https://cdn.jsdelivr.net/npm/marked@18.1.3/lib/marked.umd.js` and `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.12.0/build/highlight.min.js`.
SHA-256: `c34a221dc89e91833a88822e7717b8a0cf27118f8c9a8779dffb48a6be31f97a` (marked) and `8ab71eb09c51f501e5e25157d9cff100e46cc29bcbfc744d0b746d451fca7f53` (highlight.js).

To upgrade, replace the file, update the version and checksum here, and re-test an article.

## Limitations

- Articles are rendered in the browser, so search engines index the page shell and metadata, not the article text. Each article's summary is set as its page description.
- There is no clean `/journal/slug` URL, because static hosting can't rewrite routes. Addresses use `?p=`.
- There is no server-side search across article bodies. Search covers the index fields only.
- Pages and articles need JavaScript.
- Code highlighting depends on the language bundled in highlight.js. Adding a rarer language means adding its file from the highlight.js distribution.
- The journal doesn't read your LeetCode account or your repository. Everything shown is what you write in the files.
