<!--
  Template for an engineering journal article. Copy it to content/fundamentals/<category>/<slug>.md,
  where <category> is algorithms, sql or software-design, then replace every TODO: with your own words.
  Delete any section that doesn't apply. Add as many attempts and experiments as the real history needs.

  The page title comes from data/problems.json, so don't start with a "# Title" heading.
  A documented article can't be listed while it still contains "TODO:" (run: node scripts/check-data.js).

  Conventions:
    ## Attempt 01 — Name [failed]     tags: failed, partial, revised, optimized, final, abandoned
    ### Experiment 01 — Name [kept]   tags: kept, rejected, inconclusive   (inside "Beyond the Solution")
    ```c title="solution.c"           language plus an optional file name
    ```text                           terminal output, compiler errors, failing test results
  Write only what actually happened. Paste real output.
-->

## The Problem

TODO: the original statement in your own words, with a link to the source in the metadata.

- **Input and output:** TODO
- **Constraints:** TODO
- **Edge cases that matter:** TODO

## Understanding the Problem

TODO: what you noticed first, which concepts you thought might apply, the assumptions you made, and your initial reasoning.

## Attempt 01 — TODO approach name [failed]

### My reasoning

TODO: why you thought this would work.

### Implementation

```c title="attempt-01.c"
/* TODO: the code you actually wrote */
```

### What happened?

TODO: the real result. Paste real output.

```text
TODO: failing test, compiler error, wrong output, time limit exceeded...
```

### Why it failed

TODO: the actual technical reason.

### What I learned

TODO: what the failure taught you, and how it shaped Attempt 02.

## Attempt 02 — TODO approach name [revised]

### My reasoning

TODO

### Implementation

```c title="attempt-02.c"
/* TODO */
```

### What happened?

TODO

## Final Working Solution [final]

### The implementation

```c title="solution.c"
/* TODO: the final code */
```

### Why this works

TODO: the algorithm, and why it is correct.

### What changed?

TODO: what is different from the earlier attempts, and why that mattered.

## Complexity Analysis

- **Time:** TODO, with the reasoning
- **Space:** TODO, with the reasoning

## Testing and Edge Cases

| Case | Input | Expected | Result |
|---|---|---|---|
| TODO | TODO | TODO | TODO |

```text
TODO: real test output
```

## Reflection

- **What I misunderstood at first:** TODO
- **The concept that made it click:** TODO
- **What I would recognise faster next time:** TODO
- **What I learned about problem-solving:** TODO

## Beyond the Solution

Working is the requirement. Excellence is the pursuit. This section asks whether the solution can be better, and whether it is worth making it so.

### Where this solution stands

| Level | Is this solution there? | Why |
|---|---|---|
| Working | TODO | TODO |
| Improved over the first attempt | TODO | TODO |
| Asymptotically optimal | TODO | TODO |
| Practically optimal for the stated constraints | TODO | TODO |

Passing every test does not make it optimal. Say which row is true, and why.

### Questions to explore

- **Algorithmic optimisation:** TODO: can time or space improve, is there a better data structure, is this already asymptotically optimal?
- **Implementation quality:** TODO: readability, unnecessary allocations or copies, memory safety, language-specific improvements.
- **Scalability and constraints:** TODO: much larger inputs, different input distributions, practical bottlenecks, different constraints.
- **Alternative approaches:** TODO: other valid ways, their trade-offs, what you would choose in production and why.

### Experiment 01 — TODO name [kept]

#### Hypothesis

TODO

#### Proposed improvement

TODO

#### Implementation

```c title="experiment-01.c"
/* TODO */
```

#### Benchmark or analysis

TODO: real measurements only. State the machine, the inputs and how you measured. If you did not measure, say the comparison is analytical.

#### Results

TODO

#### Trade-offs

TODO

#### Conclusion

TODO

### Final reflection

- **The strongest implementation I arrived at:** TODO
- **What was actually measurable or demonstrable:** TODO
- **Trade-offs I accepted:** TODO
- **What I would investigate next:** TODO
