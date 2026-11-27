## About this entry

This is a historical record. The code, submission times, results and performance figures below are exactly what LeetCode showed for my real submissions in 2025. Times are as displayed by LeetCode, and no time zone was recorded.

Sections headed **Retrospective analysis** were written later, from the submitted code and the recorded results. They are not notes from the time. Where a reason is inferred and not documented, the text says "inferred".

Nothing has been rewritten to look better: the code is unmodified, and no debugging sessions, compiler errors or intermediate attempts have been added.


## Attempt 01 — Accepted [final]

### Historical record

- **Submitted:** Mar 16, 2025 01:45
- **Result:** Accepted
- **Test cases passed:** 59 / 59
- **Runtime:** 0 ms (beats 100.00%)
- **Memory:** 41.88 MB (beats 99.45%)

```java title="Solution.java"
class Solution {
    public int lengthOfLastWord(String s) {
        String[] words = s.split(" ");
        int max = words.length - 1;
        return (words[max].length());
    }
}
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

- **Approach:** split the string on the single-space delimiter and return the length of the last token.
- **Trailing spaces.** Java's `String.split` removes trailing empty strings from the result, so a string ending in spaces still ends with the last real word.
- **Leading and repeated spaces.** These produce empty strings earlier in the array, but the code only reads the last element, so they do not matter.
- **Passed every test case.** There was no failing attempt on this problem, and none is claimed.

Not documented: any other approach tried before this one.

## Complexity Analysis

*Retrospective and analytical. Nothing here was measured by me.*

- **Time:** O(n). `split` scans the whole string.
- **Space:** O(n). `split` allocates an array of tokens, and each token is a new string.

## Beyond the Solution

*These are questions worth investigating, not work that has been done. No improvement below was implemented or benchmarked.*

### Where this solution stands

| Level | Status | Basis |
|---|---|---|
| Working | Yes | Accepted, 59 / 59 test cases. |
| Asymptotically optimal | No | The last word can be found without reading the whole string. |
| Practically optimal | Not assessed | It reported 0 ms. No further benchmark was run. |

### Future explorations

- **Reverse traversal without an array.** Walk backwards from the end of the string, skip trailing spaces, then count characters until the next space or the start. This allocates nothing, and the work is proportional to the last word and any trailing spaces, not the whole string.
- **Edge cases to test deliberately.** Trailing spaces, a single word with no spaces, leading spaces, and repeated spaces between words.
- **Input assumptions.** The solution reads `words[words.length - 1]`. A string made only of spaces splits into an empty array and would fail on that read. The problem statement guarantees at least one word in `s`, so that input does not occur. A version meant for general use would need to handle it.
- **Library alternatives.** `trim` and `lastIndexOf`: do they read more clearly, and what do they allocate?
