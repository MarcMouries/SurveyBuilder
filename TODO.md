# TASK LIST

## TODO

### Rule Engine (`packages/rule-engine/`)

- ~~**Rule priority system**~~ ✅
  - ~~`RuleEngine` executes rules sorted by descending `priority` field~~
  - ~~`evaluate()` returns fired rule names in priority order~~
  - ~~`evaluateWithTrace()` includes priority in each trace entry~~
  - ~~Tests: verify execution order across 3+ priorities, equal-priority tie-breaking, priority re-sort on incremental `addRule()`~~

- ~~**Math built-ins: `min`, `max`, `abs`, `log2`**~~ ✅
  - ~~Register as callable functions in `Interpreter` (via `registerFunction` mechanism)~~
  - ~~Parser already supports call expressions `fn(args…)` — wire up the four functions~~
  - ~~Tests: `abs(-5) == 5`, `min(3, 7) == 3`, `max(3, 7) == 7`, `log2(8) == 3`, composed expressions like `abs(x - y) < threshold`~~

- ~~**Array index access: `noteXs[i]`**~~ ✅
  - ~~Extend `Tokenizer` to emit `LBRACKET` / `RBRACKET` (already tokenized)~~
  - ~~Extend `Parser.parsePrimary()`: after identifier, check for `[` → parse `IndexExpression(object, index)`~~
  - ~~Add `IndexExpression` AST node and `visitIndexExpression` to visitor/interpreter~~
  - ~~Index expression must support arbitrary index sub-expressions: `arr[i+1]`, `arr[i-1]`~~
  - ~~Tests: read `arr[0]`, `arr[i]`, `arr[i+1]`; out-of-bounds throws `EvalError`; works inside larger expressions like `noteXs[i] - noteXs[i-1] < gap`~~

- ~~**Bidirectional constraint solving**~~ ✅
  - `ConstraintSolver` — numeric bisection: `solver.solve('2*x+1', 'x', 11, env)` → `x=5`
  - `BackwardChainer` — logical inference: given a goal, find what facts are needed

- ~~**Backward chaining ("what needs to be true for animal == turtle?")**~~ ✅
  - ~~New class `ConstraintSolver` in `packages/rule-engine/src/ConstraintSolver.ts`~~
  - ~~API: `solver.solve(expression, targetVar, targetValue, env)` — finds the value of `targetVar` that makes `expression == targetValue`~~
  - ~~Initial approach: interval bisection (binary search) for numeric unknowns over a caller-supplied `[min, max]` range~~
  - ~~Separate from `RuleEngine` — the solver operates on a single expression, not a rule set~~
  - ~~Tests: solve linear `2*x + 1 == 11` → `x = 5`; solve non-linear `x^2 == 9` over `[0,10]` → `x ≈ 3`; throws when no solution exists in range; throws when target variable not found in expression~~

### Survey Builder
- clean last page of survey
- Make creation of Survey easy
- input field validation ( number, email, date)
- save survey result in a table.
    1.  user creates a survey with a name and content
    2.  



## DONE
- StarRating 
- Rename  one-choice => type: "single-choice
- NPS Question
- Use custom parser
- Use SurveyModel
- Remove dependency between SurveyBuilder and the components