## About this entry

This is a historical record. The code, submission times, results and performance figures below are exactly what LeetCode showed for my real submissions in 2025. Times are as displayed by LeetCode, and no time zone was recorded.

Sections headed **Retrospective analysis** were written later, from the submitted code and the recorded results. They are not notes from the time. Where a reason is inferred and not documented, the text says "inferred".

Nothing has been rewritten to look better: the code is unmodified, and no debugging sessions, compiler errors or intermediate attempts have been added.


## Attempt 01 — Accepted [final]

### Historical record

- **Submitted:** Sep 06, 2025 20:29
- **Result:** Accepted
- **Test cases passed:** 1569 / 1569
- **Runtime:** 1 ms (beats 100.00%)
- **Memory:** 44.68 MB (beats 99.98%)

```java title="Solution.java"
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode result = new ListNode(0);
        ListNode ptr = result;
        int carry = 0;

        while(l1 != null || l2 != null){
            int sum = 0 + carry;
            if(l1 != null){
                sum += l1.val;
                l1 = l1.next;
            }
            if(l2 != null){
                sum += l2.val;
                l2 = l2.next;
            }
            carry = sum /10;
            sum = sum % 10;
            ptr.next = new ListNode(sum);
            ptr = ptr.next;
        }
        if (carry ==1) ptr.next = new ListNode(1);
        return result.next;
    }
}
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

- **Approach:** traverse both linked lists together, adding digit by digit and carrying into the next position. A dummy head node (`result`) keeps the code for the first output node the same as for every other. `ptr` always points at the last node built. The answer is `result.next`.
- **Unequal lengths.** The loop condition is `l1 != null || l2 != null`, so it runs until both lists are exhausted. Inside it, each list contributes only while it still has nodes, so a missing digit counts as zero. Once the shorter list ends, the remaining digits of the longer list are added together with any carry.
- **The final carry.** If the last addition produces a carry, the loop has already ended and no node exists for it. The line `if (carry ==1) ptr.next = new ListNode(1);` adds it. For example `99 + 1` needs a third node to hold the leading 1.
- **Why checking for exactly 1 is enough.** The largest possible sum in one step is 9 + 9 + 1 = 19, so the carry is always 0 or 1. This follows from the code and the digit range, and it was not something recorded at the time.
- **The input lists are not modified.** `l1` and `l2` are local references that move forward, and every output digit is a new node.

Not documented: the reasoning behind the first attempt being accepted, since there is no record of earlier tries on this problem.

## Complexity Analysis

*Retrospective and analytical. Nothing here was measured by me. The runtime and memory figures are LeetCode's.*

- **Time:** O(max(m, n)), where m and n are the list lengths. Each node is visited once.
- **Space:** O(max(m, n)) for the result list, plus one dummy node. No other storage grows with the input.

## Beyond the Solution

*These are questions worth investigating, not work that has been done. No improvement below was implemented or benchmarked.*

### Where this solution stands

| Level | Status | Basis |
|---|---|---|
| Working | Yes | Accepted, 1569 / 1569 test cases. |
| Asymptotically optimal | Plausibly, not proven here | Every node of both lists has to be read, so O(max(m, n)) time is a lower bound. |
| Practically optimal | Not assessed | No benchmark was run. The reported 1 ms and 44.68 MB are LeetCode's figures. |

### Future explorations

- **Carry invariant.** State the invariant explicitly: after each step the carry is 0 or 1. How would the code change if the digit base or the number of lists changed, so that a carry above 1 became possible?
- **Allocation.** The solution allocates one node per output digit and one dummy node. Could it reuse the longer input list's nodes, and what would that cost in clarity, and in mutating the caller's data?
- **Edge cases to test deliberately.** Lists of unequal length, both lists a single `0`, a carry out of the final digit (`99 + 1`), and a long run of nines.
- **Variants.** A recursive version, and a version that does not use a dummy head. What do they gain or lose in readability?
