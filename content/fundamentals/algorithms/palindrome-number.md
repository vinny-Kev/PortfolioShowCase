## About this entry

This is a historical record. The code, submission times, results and performance figures below are exactly what LeetCode showed for my real submissions in 2025. Times are as displayed by LeetCode, and no time zone was recorded.

Sections headed **Retrospective analysis** were written later, from the submitted code and the recorded results. They are not notes from the time. Where a reason is inferred and not documented, the text says "inferred".

Nothing has been rewritten to look better: the code is unmodified, and no debugging sessions, compiler errors or intermediate attempts have been added.


## Attempt 01 — Wrong Answer [failed]

### Historical record

- **Submitted:** Mar 15, 2025 12:52
- **Result:** Wrong Answer
- **Test cases passed:** 11507 / 11511

```java title="Solution.java"
class Solution {
    public boolean isPalindrome(int x) {
        int reverse = 0;
        int num = x;
        while(x !=0){
            int digit = x % 10;
            reverse = reverse * 10 + digit;
            x /= 10;
        }
        return num == reverse;
    }
}
```

```text
Wrong Answer
11507 / 11511 testcases passed

Input
x = -121

Output
true

Expected
false
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

- **What happened.** The code reverses `x` and compares the result with the original. For `-121`, Java's `%` and `/` truncate toward zero, so every digit is negative: the loop builds `-1`, then `-12`, then `-121`. The reversed value equals the original, and the method returns `true`.
- **What was expected.** A negative number is not a palindrome, because the minus sign appears only at the front. Nothing in this implementation rejects negative numbers explicitly.
- **Scope of the record.** 11507 of 11511 test cases passed, so four failed. Only `-121` is in the record. The other three failing inputs are not known, so it cannot be said that all four were negative.

## Attempt 02 — Accepted [final]

### Historical record

- **Submitted:** Mar 15, 2025 13:13
- **Result:** Accepted
- **Test cases passed:** 11511 / 11511
- **Runtime:** 57 ms (beats 5.04%)
- **Memory:** 44.74 MB (beats 99.35%)

```java title="Solution.java"
class Solution {
    public boolean isPalindrome(int x) {
       int reverse = 0;
        int num = x;
        String sign = (x<0) ? "-" : "";
        while(x !=0){
            int digit = x % 10;
            reverse = reverse * 10 + digit;
            x /= 10;
        }
        int reversePos = Math.abs(reverse);
        String signedReverse =reversePos + sign;
        System.out.println(num);
        System.out.println(signedReverse);
        return String.valueOf(num).equals(signedReverse);
    }
}
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

- **Approach:** the same reversal, then compare as strings. It takes the absolute value of the reversed number and appends the sign to the end of that text. For `-121` the reversed text becomes `"121-"`, and the original is `"-121"`, so the comparison is `false`. For a non-negative number the sign is empty and the comparison is between the two digit strings.
- **Why this fixes the failing input.** A negative number's text can never equal its reversed text with the sign moved to the end, so negatives are always rejected. This was verified by tracing `-121` through the code.
- **Left in the submission:** two `System.out.println` calls print the original number and the reversed text.
- **Not interpreted:** the reported `57 ms (beats 5.04%)`. The record does not say why the runtime is where it is.

## Repeated submission

### Historical record

- **Submitted:** Mar 16, 2025 01:24
- **Result:** Accepted
- **Test cases passed:** 11511 / 11511
- **Runtime:** 53 ms (beats 5.04%)
- **Memory:** 44.52 MB (beats 99.78%)

The submitted code is identical to Attempt 02. It is the same implementation submitted again, so no code is repeated here.

### Retrospective analysis

*Written afterwards. Not a note from the time.*

- **This is not an algorithmic improvement.** The code did not change. Only LeetCode's reported measurements differ between the two submissions: runtime `57 ms` then `53 ms`, memory `44.74 MB` then `44.52 MB`, with the runtime percentile at `5.04%` in both.
- **What can be said:** the same code produced slightly different reported figures on a second run. The cause is not recorded. Run-to-run variation in how LeetCode measures a submission is the likely explanation, but that is inferred.

## Complexity Analysis

*Retrospective and analytical for the accepted solution. Nothing here was measured by me.*

- **Time:** O(d), where d is the number of digits, which is O(log n). The reversal loop runs once per digit, and building and comparing the strings is also linear in d.
- **Space:** O(d) for the strings. The reversal itself uses O(1).

## Beyond the Solution

*These are questions worth investigating, not work that has been done. No improvement below was implemented or benchmarked.*

### Where this solution stands

| Level | Status | Basis |
|---|---|---|
| Working | Yes | Accepted, 11511 / 11511 test cases. |
| Improved over the first attempt | In correctness | The first attempt accepted `-121`. The second rejects negatives. |
| Improved by the repeated submission | No | Identical code. Only the reported measurements differ. |
| Asymptotically optimal | Effectively | At most 10 digits for a 32-bit `int`. |
| Practically optimal | Unlikely | It builds strings and prints. Whether that is the main cost has not been measured. |

### Future explorations

- **Reject early.** A negative `x` can never be a palindrome, and a non-zero number ending in `0` can never be one either. Returning `false` for those before any work avoids the reversal entirely.
- **Half reversal.** Reverse only the second half of the digits and compare it with the first half. This avoids reversing the whole number, so it cannot overflow, and it needs no strings.
- **Two-pointer on digits.** Compare the leading and trailing digits and move inward. What does the cost of extracting digits do to this?
- **Overflow in the full reversal.** The submitted code reverses the entire number in an `int`. Reversing a ten-digit value can overflow. Whether that can ever make a non-palindrome compare equal has not been analysed.
- **Removing the prints.** The accepted code still prints two lines per call. How much of the reported 57 ms is due to that is unknown and worth measuring.
