# Engineering Fundamentals section

The "Engineering Fundamentals" section on `main-page.html` (nav label **Fundamentals**, anchor `#fundamentals`) shows two kinds of evidence, kept visibly separate:

1. **Entries in the engineering journal** (algorithms, SQL, software design), each a written account of how a problem was worked through. See [journal.md](journal.md).
2. **A LeetCode snapshot**, copied by hand from the public profile and dated.

The section opens with a short statement of approach: I build with AI to increase my engineering leverage, not to replace my engineering judgment, and I keep working on the fundamentals alongside that. The copy lives in `main-page.html`. The work below it has to back it up, which is why the section only shows what exists.

Naming note: the section was first drafted as "Practice", so the internal files keep that name (`data/practice.json`, `scripts/practice.js`, `.practice-*` CSS classes, `#practice-content`). The old `#practice` link still works and redirects to `#fundamentals`.

The section reads two files: `data/practice.json` (the LeetCode snapshot, the repository link and the area descriptions) and the journal index `data/problems.json`. The page code (`scripts/practice.js`) only renders them.

## What counts as what

| Label on the page | Meaning | Counted as completed? |
|---|---|---|
| **Documented** | The full write-up is published as an article in the engineering journal. Requires a date and an article file. | Yes |
| **In progress** | Started, not finished. | No |
| **Planned, not started** | On the list. Shown in a collapsed fold, labelled as planned. | No |
| **LeetCode snapshot** | Numbers copied by hand from the profile on a stated date. The profile is the source of truth. | n/a, shown as a dated snapshot |

The per-area counts ("2 documented · 1 in progress") are computed from the journal index. They are never typed in, so they cannot run ahead of the work.

`node scripts/check-data.js` enforces these rules, so a dishonest entry fails before it can be committed. The journal rules (articles must exist, documented articles can't contain template prompts, planned entries can't have dates) are listed in [journal.md](journal.md). For this section it also checks that the LeetCode breakdown adds up (`easy + medium + hard = totalSolved`) and that `profileUrl` matches `username`.

## How to update your activity

### Refresh the LeetCode snapshot (about two minutes)

1. Open <https://leetcode.com/u/Kevinisity/>.
2. In `data/practice.json`, update `leetcode.snapshot`:
   - `asOf`: today's date (`YYYY-MM-DD`)
   - `totalSolved`, `easy`, `medium`, `hard`: the numbers on the profile
   - `recent`: up to a few recently solved problems, each with `title`, `url` (a `https://leetcode.com/problems/...` link) and `difficulty`
3. Run `node scripts/check-data.js`.
4. Commit and push.

The streak and activity calendar are deliberately not shown. They are not available from any source I can read reliably, and a streak of 1 or 2 days says little.

### Record a problem

Write it up as a journal article and add its entry to `data/problems.json`. The steps are in [journal.md](journal.md). The Fundamentals section picks it up on its own, including the counts.

### Publish the repository link

The journal does not depend on the repository. Once `engineering-fundamentals` exists on GitHub and you are ready to link it, set `repository.url` to its URL. The area links ("Browse algorithms/c/ in the repository") then appear on their own. Until then no repository link is shown.

## LeetCode data source: what I found and why it is manual

- **There is no official public API that I could find.** The documentation and developer URLs I tried returned 403 to automated requests, so I cannot rule one out from the pages themselves.
- **The community approach uses LeetCode's own website GraphQL endpoint**, which is undocumented and can change without notice.
- **A browser on this site cannot call it.** A preflight request from the portfolio's origin returned `405` with no `Access-Control-Allow-Origin` header, so the browser would block it.
- **`robots.txt` disallows `/graphql` and `/api/`** for automated access. Syncing from a scheduled job would conflict with that.
- **Third-party stats proxies** are possible, but they are unofficial services that depend on the same endpoint. I would not put an uptime dependency on someone else's free service on a recruiter-facing page.

Because of that, the snapshot is maintained by hand and labelled as such (`"verification": "manual"`).

## Adding automated synchronisation later

The data file is the replaceable seam: anything that can produce valid `data/practice.json` content can replace the manual step.

1. **Journal metadata from the articles (reliable, recommended first).** Give each article front matter and let a small script regenerate `data/problems.json` from the Markdown files, so the index can never drift from the articles. This is your own data, so there is nothing to scrape, and `check-data.js` keeps validating the result.
2. **LeetCode numbers (only if a permitted source appears).** If LeetCode publishes an official API or export, a scheduled workflow can write `leetcode.snapshot` with `"verification": "synced"`. `check-data.js` already accepts that value, and the page can then drop the "copied by hand" wording. I would not automate against the website GraphQL endpoint while `robots.txt` disallows it.
3. **Calendar and streak.** Add an optional `leetcode.calendar` field and a renderer only once a trustworthy source exists.
