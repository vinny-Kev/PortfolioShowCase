# Engineering Fundamentals section

The "Engineering Fundamentals" section on `main-page.html` (nav label **Fundamentals**, anchor `#fundamentals`) shows two kinds of evidence, kept visibly separate:

1. **Exercises documented in the `engineering-fundamentals` repository** (algorithms in C, SQL, software design).
2. **A LeetCode snapshot**, copied by hand from the public profile and dated.

The section opens with a short statement of approach: I build with AI to increase my engineering leverage, not to replace my engineering judgment, and I keep working on the fundamentals alongside that. The copy lives in `main-page.html`. The work below it has to back it up, which is why the section only shows what exists.

Naming note: the section was first drafted as "Practice", so the internal files keep that name (`data/practice.json`, `scripts/practice.js`, `.practice-*` CSS classes, `#practice-content`). The old `#practice` link still works and redirects to `#fundamentals`.

Everything the section displays comes from one file, `data/practice.json`. The page code (`scripts/practice.js`) only renders it.

## What counts as what

| Label on the page | Meaning | Counted as completed? |
|---|---|---|
| **Documented** | The solution and write-up are published in the repository. Requires a completion date and a link into the repo. | Yes |
| **In progress** | Started, not finished. | No |
| **Planned, not started** | On the list. Shown in a collapsed fold, labelled as planned. | No |
| **LeetCode snapshot** | Numbers copied by hand from the profile on a stated date. The profile is the source of truth. | n/a, shown as a dated snapshot |

The per-area counts ("2 documented · 1 in progress") are computed from the exercise lists. They are never typed in, so they cannot run ahead of the work.

`node scripts/check-data.js` enforces these rules, so a dishonest entry fails before it can be committed:
- a `documented` exercise needs `completedOn`, and a `solutionUrl` inside the published repository;
- `in-progress` and `planned` exercises must not have a completion date or solution link;
- the LeetCode breakdown must add up (`easy + medium + hard = totalSolved`);
- `profileUrl` must match `username`.

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

### Record an exercise

Add an entry to the right area's `exercises` list.

```json
{
  "title": "Two Sum",
  "source": "LeetCode",
  "difficulty": "Easy",
  "topic": "Hash table",
  "status": "documented",
  "completedOn": "2026-12-01",
  "complexity": "O(n) time, O(n) space",
  "solutionUrl": "https://github.com/vinny-Kev/engineering-fundamentals/tree/main/algorithms/c/two-sum"
}
```

- Start an exercise as `"status": "in-progress"` (no date, no link).
- Move it to `documented` only when the write-up and code are pushed to the repository, then add `completedOn` and `solutionUrl`.
- Put things you only intend to do under `"status": "planned"`.

### Publish the repository link

Once `engineering-fundamentals` exists on GitHub and you are ready to link it, set `repository.url` to its URL. The area links ("Browse algorithms/c/ in the repository") appear on their own. Until then the page shows "Repository link coming soon", and `check-data.js` refuses documented exercises, because there is nowhere for them to point.

## LeetCode data source: what I found and why it is manual

- **There is no official public API that I could find.** The documentation and developer URLs I tried returned 403 to automated requests, so I cannot rule one out from the pages themselves.
- **The community approach uses LeetCode's own website GraphQL endpoint**, which is undocumented and can change without notice.
- **A browser on this site cannot call it.** A preflight request from the portfolio's origin returned `405` with no `Access-Control-Allow-Origin` header, so the browser would block it.
- **`robots.txt` disallows `/graphql` and `/api/`** for automated access. Syncing from a scheduled job would conflict with that.
- **Third-party stats proxies** are possible, but they are unofficial services that depend on the same endpoint. I would not put an uptime dependency on someone else's free service on a recruiter-facing page.

Because of that, the snapshot is maintained by hand and labelled as such (`"verification": "manual"`).

## Adding automated synchronisation later

The data file is the replaceable seam: anything that can produce valid `data/practice.json` content can replace the manual step.

1. **Exercises from the repository (reliable, recommended first).** Give each write-up in `engineering-fundamentals` front matter (`title`, `source`, `difficulty`, `topic`, `status`, `completedOn`, `complexity`). A small script in that repo, run by GitHub Actions on push, writes the `areas[].exercises` lists and commits them here (or publishes them as a JSON file). This is your own data, so there is nothing to scrape, and `check-data.js` keeps validating the result.
2. **LeetCode numbers (only if a permitted source appears).** If LeetCode publishes an official API or export, a scheduled workflow can write `leetcode.snapshot` with `"verification": "synced"`. `check-data.js` already accepts that value, and the page can then drop the "copied by hand" wording. I would not automate against the website GraphQL endpoint while `robots.txt` disallows it.
3. **Calendar and streak.** Add an optional `leetcode.calendar` field and a renderer only once a trustworthy source exists.
