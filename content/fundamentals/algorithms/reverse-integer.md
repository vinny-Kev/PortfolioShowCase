## About this entry

This is a historical record. The code, submission times, results and performance figures below are exactly what LeetCode showed for my real submissions in 2025. Times are as displayed by LeetCode, and no time zone was recorded.

Sections headed **Retrospective analysis** were written later, from the submitted code and the recorded results. They are not notes from the time. Where a reason is inferred and not documented, the text says "inferred".

Nothing has been rewritten to look better: the code is unmodified, and no debugging sessions, compiler errors or intermediate attempts have been added.


## Attempt 01 — Wrong Answer [failed]

### Historical record

- **Submitted:** Mar 16, 2025 01:52
- **Result:** Wrong Answer
- **Test cases passed:** 1036 / 1045

```java title="Solution.java"
class Solution {
    public int reverse(int x) {
        int reverse = 0;
        while(x != 0){
            int digit = x % 10;
            reverse = reverse * 10 + digit;
            x/= 10;
        }
        System.out.println(reverse);
        return reverse;
    }
}
```

```text
Wrong Answer
1036 / 1045 testcases passed

Input
x = 1534236469

Stdout
1056389759

Output
1056389759

Expected
0
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

- **What happened.** The loop builds the reversed number with `reverse * 10 + digit` in Java's 32-bit `int`. Reversing `1534236469` gives `9646324351` mathematically, which is larger than `Integer.MAX_VALUE` (`2147483647`). Java does not raise an error on `int` overflow. It wraps around, and `9646324351` wraps to `1056389759`. That is exactly the value printed and returned in the record.
- **What was expected.** The problem asks for `0` when the reversed value falls outside the signed 32-bit range. This implementation had no check for that, so it returned the wrapped value.
- **The failing input shows the cause.** 1036 of 1045 test cases passed, so the plain reversal was correct for most inputs. Inferred, not recorded: the nine failing cases are the ones whose reversal overflows. Only one failing input is in the record.
- The debug `System.out.println(reverse)` produced the `Stdout`.

Not documented: whether the overflow was known when the code was written.

## Attempt 02 — Accepted [final]

### Historical record

- **Submitted:** Mar 16, 2025 01:58
- **Result:** Accepted
- **Test cases passed:** 1045 / 1045
- **Runtime:** 5 ms (beats 2.17%)
- **Memory:** 41.16 MB (beats 99.91%)

```java title="Solution.java"
class Solution {
    public int reverse(int x) {
    int reverse = 0;
        while(x != 0){
            int digit = x % 10;
           try{
               reverse = Math.multiplyExact(reverse, 10);
               reverse = Math.addExact(reverse, digit);
           }
           catch (ArithmeticException e){
               return 0;
           }
           x/=10;
        }
        System.out.println(reverse);
        return reverse;
    }                              
}
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

- **Approach:** the same digit-by-digit reversal, but the two risky operations use `Math.multiplyExact(reverse, 10)` and `Math.addExact(reverse, digit)`. These throw an `ArithmeticException` if the result does not fit in an `int`. The `catch` returns `0`.
- **How this addresses the failing test.** For `1534236469`, one of those two calls throws before the value can wrap, so the method returns `0`, which is the expected answer.
- **Why a check on every step is enough.** The reversed value only ever grows in size as digits are added. If an intermediate step overflows, the final value would be out of range too. If no step overflows, the final value fits.
- **Negative numbers.** Java's `%` and `/` truncate toward zero, so the digits of a negative number come out negative and the loop reverses it without a special case.
- **Purpose of the change.** The change fixed correctness, not speed. This is not a faster algorithm. It is the same loop with overflow detection added. The reported `5 ms (beats 2.17%)` is LeetCode's measurement and is not interpreted here.
- **Left in the submission:** the debug `System.out.println(reverse)` is still there in the accepted code.

Not documented: how the overflow was diagnosed and how `multiplyExact` and `addExact` were chosen. The record shows only the failing input and the next submission six minutes later.

## Complexity Analysis

*Retrospective and analytical for the accepted solution. Nothing here was measured by me.*

- **Time:** O(d), where d is the number of digits of `x`, which is O(log |x|). A 32-bit integer has at most 10 digits, so the loop runs at most 10 times.
- **Space:** O(1).

## Beyond the Solution

*These are questions worth investigating, not work that has been done. No improvement below was implemented or benchmarked.*

### Where this solution stands

| Level | Status | Basis |
|---|---|---|
| Working | Yes | Accepted, 1045 / 1045 test cases. |
| Improved over the first attempt | In correctness only | The first attempt returned a wrapped value. The second returns `0` on overflow. |
| Faster than the first attempt | No claim | The change was made for correctness. No timing comparison was made. |
| Asymptotically optimal | Effectively | At most 10 iterations for a 32-bit `int`, so the running time is bounded by a constant. |

### Future explorations

- **Precondition checks instead of exceptions.** Compare `reverse` with `Integer.MAX_VALUE / 10` and `Integer.MIN_VALUE / 10` before multiplying, and handle the boundary digit explicitly. This avoids exceptions as control flow. Is it clearer or less clear than `multiplyExact`?
- **Using `long`.** Reverse in a 64-bit value and range-check once at the end. What does that trade away?
- **Boundary inputs to test deliberately.** `Integer.MAX_VALUE`, `Integer.MIN_VALUE`, numbers ending in zeros, and `0`.
- **Cleanup.** The accepted code still contains a debug print. Removing it is a small change worth making in any version that is kept.
