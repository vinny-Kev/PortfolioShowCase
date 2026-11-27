## About this entry

This is a historical record. The code, submission times, results and performance figures below are exactly what LeetCode showed for my real submissions in 2025. Times are as displayed by LeetCode, and no time zone was recorded.

Sections headed **Retrospective analysis** were written later, from the submitted code and the recorded results. They are not notes from the time. Where a reason is inferred and not documented, the text says "inferred".

Nothing has been rewritten to look better: the code is unmodified, and no debugging sessions, compiler errors or intermediate attempts have been added.


## Attempt 01 — Wrong Answer [failed]

### Historical record

- **Submitted:** Aug 28, 2025 23:49
- **Result:** Wrong Answer
- **Test cases passed:** 0 / 63

```java title="Solution.java"
class Solution {
    public int[] twoSum(int[] nums, int target) {
        int[] answer = new int[1];
        for(int i =0; i < nums.length -1; i ++){
            for(int j = 1;j < nums.length - 1; j++){
                System.out.println(nums[i] + nums[j]);
                if (nums[i] + nums[j] == target){
                    return answer = new int[]{nums[i], nums[j]};
                }
            }
        }
    
        return null;
    }
}
```

```text
Wrong Answer
0 / 63 testcases passed

Input
nums = [2,7,11,15]
target = 9

Stdout
9

Output
[2,7]

Expected
[0,1]
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

Reading the code against the recorded output:

- **It returns values, not indices.** `return answer = new int[]{nums[i], nums[j]};` returns the two numbers themselves. For `[2,7,11,15]` with target `9` it returned `[2,7]`, and the expected answer was the indices `[0,1]`. This is the failure shown in the record.
- **The inner loop has the wrong bounds.** `j` starts at `1` instead of `i + 1`, so the same element can be paired with itself and pairs are re-checked in both orders. Both loops stop at `nums.length - 1`, so the last element is never considered at all.
- **Debug output is left in.** The `System.out.println` inside the inner loop produced the `Stdout` of `9`, the first sum it computed.

> My own comment, added later when collecting these submissions: "that one was just blatantly wrong".

Not documented: what I was thinking when I wrote it. Passing 0 of 63 test cases is consistent with the values-versus-indices mistake, since a correct answer for any test would need indices.

## Attempt 02 — Output Limit Exceeded [failed]

### Historical record

- **Submitted:** Aug 29, 2025 00:00
- **Result:** Output Limit Exceeded
- **Test cases passed:** 37 / 63

```java title="Solution.java"
class Solution {
    public int[] twoSum(int[] nums, int target) {
        int[] answer = new int[1];
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                System.out.println(nums[i] + nums[j]);
                if (nums[i] + nums[j] == target) {
                    answer = new int[]{i, j};
                    
                }
            }
        }
        return answer;
    }
}
```

```text
Output Limit Exceeded
37 / 63 testcases passed

Last Executed Input
nums = [9704892,6437174,4722802,-5177827,-7176777,-5534858,1405791,7189078,-7447773,3027390,9942865,-9807039,-9119466,4513674,8539991,-3030349,9573328,-9510716,-6608836,9190123,9139156,-1167056,9850912,7909566,1000522,3000163,6835120,-7210877,933049,-7883403,-7669300,6326053,9830340,6729997,9928680,90372,3531759,-721562,-7540161,827628,5601929,5086972,-3258591,-6212386,6884322,8529272,1266036,9034349,3846644,-7694425,3906240,-8486064,8657125,4824260,-6829000,3023225,-6656533,-6278763,405941,4077863,-2934485,6246780,-9925318,1779833,918211,1885791,-1377435,-9225555,-7051237,-9551152,-2803778,7769707,-2079470,-8301432,87597,4131785,-4394323,8066453,-7807255,-8510899,8220249,4082471,5225240,442886,-330979]
target = 16142066
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

The recorded input is shown in LeetCode's page with a "View more" link, so the array above may be truncated.

- **The pair search is correct this time.** `j` starts at `i + 1`, every pair is visited once, and the result is the indices `{i, j}`. This is a brute-force approach with nested loops.
- **It prints the sum of every pair it examines.** The `System.out.println` runs for each pair, and the number of pairs grows quadratically with the array length. On the recorded large input this exceeded LeetCode's output limit, which is the verdict `Output Limit Exceeded`.
- **It does not return when it finds the pair.** It assigns `answer` and keeps scanning to the end. By the problem statement each input has exactly one solution, so this does not change the answer, but it keeps doing work after the answer is known.

Inferred, not documented: 37 of 63 passing suggests the smaller inputs finished inside the output limit and the larger ones did not.

## Attempt 03 — Accepted [final]

### Historical record

- **Submitted:** Aug 29, 2025 00:32
- **Result:** Accepted
- **Test cases passed:** 63 / 63
- **Runtime:** 2 ms (beats 99.42%)
- **Memory:** 45.36 MB (beats 99.91%)

```java title="Solution.java"
class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        int complement;
        for(int i =0; i < nums.length ; i++){
            complement = target - nums[i];
            if(map.containsKey(complement)){
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return null;
    }
}
```

### Retrospective analysis

*Written afterwards from the submitted code and the recorded result. Not a note from the time.*

- **Approach:** a `HashMap` from each number to its index. For each element, compute `complement = target - nums[i]`. If the complement is already in the map, return its stored index and `i`. Otherwise store the current number and index.
- **The lookup happens before the insert.** An element is therefore never paired with itself.
- **It returns on the first match.** The two earlier problems, printing every pair and not returning early, are both gone.
- **The progression across the three submissions,** read from the code: values changed to indices, then the loop bounds corrected with `j = i + 1`, then the nested loops replaced by a single pass with a hash lookup. The reasons behind each change are inferred from the code. No notes from the time exist.

## Complexity Analysis

*Retrospective and analytical for the accepted solution. Nothing here was measured by me. The runtime and memory figures above are the only measurements, and they are LeetCode's.*

- **Time:** O(n) on average. One pass, with an expected O(1) hash lookup and insert per element.
- **Space:** O(n). In the worst case the map holds one entry per element.
- **The two earlier attempts:** the brute force is O(n²) time, and with the per-pair print it also produces O(n²) lines of output.

## Beyond the Solution

*These are questions worth investigating, not work that has been done. No improvement below was implemented or benchmarked.*

### Where this solution stands

| Level | Status | Basis |
|---|---|---|
| Working | Yes | Accepted, 63 / 63 test cases. |
| Improved over earlier attempts | Yes, by the recorded results | Moved from a wrong answer, to an output-limit failure, to accepted. |
| Asymptotically optimal | Plausibly, not proven here | Every element has to be read, so O(n) time is a lower bound. The expected O(1) hash cost is an average, not a guarantee. |
| Practically optimal | Not assessed | No benchmark was run. |

### Future explorations

- **HashMap behaviour.** Collisions degrade a lookup. How bad can it get, and how does Java's treeification of long buckets change the worst case?
- **Memory trade-offs.** Boxed `Integer` keys and values cost more than primitives. Would a presized map or a primitive-keyed structure be better for large inputs?
- **Alternatives.** Sorting with a two-pointer scan uses less extra memory but costs O(n log n), and it has to track original indices. Is that ever the better choice?
- **Behaviour under input shape.** How does the single pass behave on duplicates, negative numbers and values near the integer limits?
- **Reading the percentile.** The accepted submission is reported as beating 99.42% of runtimes. Those figures come from LeetCode and have not been reproduced here.
