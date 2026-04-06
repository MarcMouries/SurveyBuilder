# How the Rule Engine Reasons

The rule engine has three distinct modes of reasoning. Each one answers a different kind of question, and understanding when to use which is the key to getting the most out of the system.

---

## The Short Version (Non-Technical)

Imagine you're a doctor, a detective, and an engineer — three very different jobs that all involve figuring something out.

**The doctor** looks at symptoms and applies knowledge to reach a diagnosis. You have facts in front of you, and you work forward to a conclusion. *"The patient has a fever, a rash, and joint pain. Those three together suggest lupus."* You didn't go looking for lupus — the facts led you there.

**The detective** works the other way. You already have a suspect or a theory, and you work backward to see what evidence you'd need to prove it. *"If it was the butler, then he must have been in the library between 9 and 10. Was he?"* You're not reacting to facts — you're hunting for specific ones.

**The engineer** is solving a different problem entirely. There's no suspect and no diagnosis — there's an equation. *"I need this beam to support exactly 500kg. How thick does it need to be?"* You know the output you want; you're doing the math to find the input.

The rule engine gives you all three modes:

| Mode | Like... | Answers |
|---|---|---|
| **Forward chaining** (`RuleEngine`) | The doctor | "Given what I know, what follows?" |
| **Backward chaining** (`BackwardChainer`) | The detective | "What do I still need to prove this?" |
| **Constraint solving** (`ConstraintSolver`) | The engineer | "What number makes this equation balance?" |

They are not three versions of the same thing. They solve three genuinely different kinds of problems that happen to appear in the same systems.

---

## A Bit of History

### Forward Chaining — Production Systems (1970s)

Forward chaining comes from **production system** research at Carnegie Mellon in the 1970s, most famously the **OPS5** language and the **RETE algorithm** (1979), developed by Charles Forgy. The idea was to model human expert knowledge as a collection of IF–THEN rules and let a machine fire them automatically in response to incoming data.

This became the backbone of commercial **expert systems** in the 1980s — programs like MYCIN (medical diagnosis), XCON (computer configuration at DEC), and R1. These systems encoded thousands of rules written by domain experts and used forward chaining to derive conclusions from patient data or order specifications.

The core insight: instead of writing a program that says *"first check this, then check that"*, you write independent rules and let the engine decide which ones are relevant. This made knowledge easy to add incrementally — you just add more rules.

Modern descendants include **Drools** (Java), **CLIPS** (NASA), and business rule engines embedded in banking, insurance, and healthcare systems worldwide. The pattern is also central to React's state model and spreadsheet recalculation: change a fact, and everything that depends on it updates automatically.

### Backward Chaining — Logic Programming (1960s–70s)

Backward chaining has deeper roots in **formal logic** and **theorem proving**. The mathematical foundation is **SLD resolution**, developed by Robert Kowalski and others in the early 1970s. The most famous implementation is **Prolog** (1972), created by Alain Colmerauer and Philippe Roussel in Marseille.

The key idea: a rule like `turtle :- has_shell, cold_blooded, lays_eggs` should be readable both ways. Forward: *"if these things are true, then it's a turtle."* Backward: *"to prove it's a turtle, prove these three things."*

Prolog and its descendants powered much of the **AI research boom of the 1980s**, including natural language processing, planning systems, and expert systems that needed to explain their reasoning. Medical diagnosis systems like CADUCEUS used backward chaining to generate explanations: not just "this is the diagnosis" but "here is why, and here is what you'd need to rule out the alternatives."

The technique is also central to **type inference** in programming languages (Hindley–Milner), **dependency resolution** in package managers, and **query planning** in databases — all of which work backward from a goal to figure out what steps are needed.

### Constraint Solving — Numerical Methods (antiquity → 1960s)

Numerical root-finding is one of the oldest problems in mathematics. **Newton's method** (1669) and **bisection** (known since antiquity, formalized by Bolzano in 1817) predate computers entirely. The idea is simple: if you can evaluate `f(x)` but can't solve `f(x) = 0` algebraically, you can still find the root by searching.

**Bisection** is the simplest and most robust approach: if `f(a) < 0` and `f(b) > 0`, there must be a root between `a` and `b`. Pick the midpoint, check which half contains the root, repeat. It converges slowly but reliably.

In the computer era, constraint solving became central to **CAD systems** (making geometric shapes satisfy dimension constraints), **circuit simulation** (SPICE, 1973), **physics engines** in games, and — directly relevant here — **music engraving software** like LilyPond, which uses constraint propagation to position notes so they don't overlap.

The `ConstraintSolver` in this package uses bisection specifically because it is simple, predictable, and requires no symbolic understanding of the expression — it just evaluates it numerically.

---

## The Technical Explanation

### `evaluate()` — One-Shot Expression Evaluation

Before reaching for a full orchestrator, check whether you only need to evaluate a single expression. The top-level `evaluate()` function is the simplest entry point — no classes, no wiring:

```ts
import { evaluate } from "@surveybuilder/rule-engine";

evaluate("age >= 18", { age: 25 });              // true
evaluate("name == 'Alice'", { name: 'Alice' });  // true
evaluate("x * 2 + 1", { x: 5 });                // 11
evaluate("2 + 2");                               // 4  (no facts needed)
```

Use `evaluate()` when you have a single expression and a plain object of variables. Use the orchestrators (`RuleEngine`, `BackwardChainer`, `ConstraintSolver`) when you need multiple rules, proof tracking, or numeric solving.

---

### The problem with one mode

Most rule engines only offer forward chaining. That works well when you're reacting to events — a user submits a form, a sensor fires, a price changes. But two situations break it:

1. **"What would I need?"** — You want to know which facts to gather, not which rules fired. Forward chaining gives you the output; it doesn't tell you what inputs are still missing.

2. **"What value satisfies this?"** — You have a numeric constraint and you need a number that satisfies it. No amount of rule-firing produces that — you need a search.

The three modes address these gaps directly.

---

### `RuleEngine` — Forward Chaining

**Direction:** facts → conclusions  
**Mechanism:** evaluate conditions, fire actions, update state  
**Output:** side effects on a mutable context

Each rule is an independent `IF condition THEN action` pair. The engine sorts rules by priority and evaluates each one in order. When a condition is true, the action fires. Rules are stateless — the engine doesn't remember what fired before.

```ts
const engine = new RuleEngine<LayoutContext>();

engine.addRule({
  name:      'stem-direction-correction',
  priority:  10,
  condition: 'prevStemUp == true and curStemUp == false',
  action:    (ctx, env) => {
    // Compress spacing when stem flips up→down
    ctx.noteXs[ctx.i] -= (env.get('LINE_SPACING') as number) * 0.3;
  },
});

engine.addRule({
  name:      'dot-clearance-rod',
  priority:  100,   // rods must fire before optical corrections
  condition: 'prevDotted == true and noteSpacing < dotRodMin',
  action:    (ctx, env) => {
    ctx.noteXs[ctx.i] = ctx.noteXs[ctx.i - 1] + (env.get('dotRodMin') as number);
  },
});

const fired = engine.evaluate(ctx);
// ['dot-clearance-rod', 'stem-direction-correction'] — in priority order
```

**Priority** is critical when rules interact. A rod constraint (hard minimum spacing) must fire before an optical correction (soft adjustment) or the correction might push the note back inside the rod. Higher priority = fires first.

**`evaluateWithTrace()`** returns the full result for every rule — fired, not fired, or errored — without crashing on partial data:

```ts
const trace = engine.evaluateWithTrace(ctx);
// [
//   { name: 'dot-clearance-rod',        priority: 100, fired: false },
//   { name: 'stem-direction-correction', priority: 10,  fired: true  },
// ]
```

**When to use forward chaining:**
- Reacting to events or incoming data
- Applying transformations, corrections, or mutations in a defined order
- Updating visibility, enabling/disabling UI elements, triggering effects
- When you don't know in advance which rules are relevant — just run them all

**When not to use it:**
- When you want to know *why* a rule didn't fire, or what would make it fire
- When you need a specific numeric output rather than a side effect

---

### `BackwardChainer` — Backward Chaining

**Direction:** goal → required conditions  
**Mechanism:** find rules whose conclusion matches the goal, evaluate their conditions  
**Output:** which conditions are satisfied, which are missing, and a score

The chainer does not fire actions. It does not mutate anything. It purely *reasons* about what is known and what would be needed.

```ts
const chainer = new BackwardChainer();

chainer.addRule({
  name:       'is-turtle',
  conclusion: 'turtle',
  conditions: [
    'has_shell == true',
    'cold_blooded == true',
    'lays_eggs == true',
  ],
});

chainer.addRule({
  name:       'is-bird',
  conclusion: 'bird',
  conditions: [
    'has_feathers == true',
    'lays_eggs == true',
    'has_beak == true',
  ],
});
```

**`prove(goal, facts)`** — ask whether a specific conclusion can be proved right now, and if not, what is still missing. Pass a plain object:

```ts
chainer.prove('turtle', { has_shell: true, cold_blooded: true });
// {
//   proved: false,
//   candidates: [{
//     rule:      'is-turtle',
//     satisfied: ['has_shell == true', 'cold_blooded == true'],
//     missing:   ['lays_eggs == true'],
//     score:     0.67
//   }]
// }
```

**`bestMatch(facts)`** — given current facts, which conclusion fits best? Useful when you don't know which goal to aim for:

```ts
chainer.bestMatch({ has_shell: true, cold_blooded: true, lays_eggs: false });
// { conclusion: 'turtle', score: 0.67, satisfied: [...], missing: [...] }
// (turtle scores 2/3; bird scores 0/3; so turtle wins)
```

**Multiple rules per conclusion** implement OR semantics — the goal is proved when *any* rule for it fires:

```ts
// A platypus satisfies 'mammal' via the egg-laying rule, not the live-birth rule
chainer.addRule({ name: 'mammal-standard', conclusion: 'mammal',
  conditions: ['has_fur == true', 'warm_blooded == true', 'gives_birth_live == true'] });

chainer.addRule({ name: 'mammal-platypus', conclusion: 'mammal',
  conditions: ['has_fur == true', 'warm_blooded == true', 'lays_eggs == true'] });

chainer.prove('mammal', { has_fur: true, warm_blooded: true, lays_eggs: true }).proved;   // true — via mammal-platypus
```

**When to use backward chaining:**
- Classification: "is this a turtle, bird, fish, or mammal?"
- Eligibility: "does this application qualify for plan X?"
- Diagnosis: "given these symptoms, what conditions could explain them?"
- Guidance: "what information does the user still need to provide?"
- Progressive narrowing: show `bestMatch()` updating in real time as facts are added

**When not to use it:**
- When you need side effects — the chainer mutates nothing
- When the answer is a number, not a logical conclusion

---

### `ConstraintSolver` — Numeric Root-Finding

**Direction:** equation + target → unknown value  
**Mechanism:** interval bisection  
**Output:** a number (or `found: false` if the root isn't bracketed in the range)

The solver has no concept of rules. It takes an expression string, a target value, and a range, and searches for the value of one variable that makes `expression == target`.

```ts
const solver = new ConstraintSolver();

// Find 'correction' such that gap + correction == 35
solver.solve('gap + correction', 'correction', 35, { gap: 30 }, { min: 0, max: 20 });
// { found: true, value: 5.0, iterations: 47 }

// Non-linear — still works:
solver.solve('x^2', 'x', 9, {}, { min: 0, max: 10 });
// { found: true, value: 3.0000..., iterations: 60 }
```

**How bisection works:**

```
f(x) = expression(x) - target

1. Evaluate f(min) and f(max).
2. If they have the same sign, the root isn't bracketed → return found: false.
3. Otherwise, pick midpoint m = (min + max) / 2.
4. Evaluate f(m).
5. If |f(m)| < tolerance → done, return m.
6. Replace min or max with m, keeping opposite signs on both ends.
7. Repeat from step 3.
```

The key limitation: bisection finds exactly **one** root per call, and only if you've provided a range that contains it. `x^2 == 9` has roots at both `+3` and `-3`. To find `-3`, search `[-10, 0]`; to find `+3`, search `[0, 10]`.

**Environment isolation** — the solver temporarily sets `targetVar` to its search value during iteration, then restores the original value when done. To inspect the environment afterwards, pass an `Environment` object directly:

```ts
import { Environment } from "@surveybuilder/rule-engine";

const env = Environment.from({ gap: 30, correction: 99 });
solver.solve('gap + correction', 'correction', 35, env, { min: 0, max: 20 });
env.get('correction');   // still 99 — restored after solving
```

**When to use the constraint solver:**
- Music engraving: "position this note so the spacing constraint is satisfied"
- Layout: "find the font size that makes this text fit exactly N lines"
- Physics: "find the force that produces this acceleration given these masses"
- Any situation where you know the desired output of a formula but not one input

**When not to use it:**
- When the answer is a category or a logical conclusion, not a number
- When the function is not monotonic and you need all roots (bisection finds one)
- When you have multiple unknowns (the solver handles one at a time)

---

## Direction of Reasoning — Visual Summary

```
FORWARD CHAINING (RuleEngine)
─────────────────────────────────────────────────────────────────►
  Known facts                Rules fire                 Effects
  age = 25          →   IF age > 18 THEN ...    →   show_content = true
  has_pet = 'Yes'   →   IF has_pet THEN ...     →   show_pet_section = true


BACKWARD CHAINING (BackwardChainer)
◄─────────────────────────────────────────────────────────────────
  Goal              ←   What rules prove it?    ←   What facts needed?
  "turtle"          ←   is-turtle rule          ←   has_shell ✓
                                                    cold_blooded ✗
                                                    lays_eggs ✗


CONSTRAINT SOLVING (ConstraintSolver)
  ──────────────────── numerical search ────────────────────────
  gap + correction == 35        gap = 30 (known)
  [search correction in 0..20]  → correction = 5
```

---

## Choosing the Right Mode

| Situation | Mode |
|---|---|
| A user submits a form — update the UI in response | `RuleEngine` |
| Apply music engraving corrections in priority order | `RuleEngine` |
| Check whether an insurance application qualifies | `BackwardChainer.prove()` |
| Show a user what information they still need to provide | `BackwardChainer` — inspect `missing` |
| Given partial symptoms, which diagnosis fits best? | `BackwardChainer.bestMatch()` |
| Classify an animal from observed traits | `BackwardChainer` |
| Find the note position that satisfies a spacing constraint | `ConstraintSolver` |
| Invert a complex formula you can't solve algebraically | `ConstraintSolver` |
| React to sensor data and trigger actions | `RuleEngine` |
| Prove that a user meets eligibility criteria | `BackwardChainer.prove()` |
| Calculate a correction offset for music layout | `ConstraintSolver` |
| Update visibility of survey questions on every answer | `RuleEngine` |

---

## Testing Each Mode

Testing the three modes requires different strategies because they produce different kinds of outputs: side effects, logical proof results, and numbers. Here is a pattern for each.

---

### Testing Forward Chaining (`RuleEngine`)

The core pattern is: set up facts in the environment, call `evaluate()`, assert the side effects on your context object.

**What to test:**

1. A rule fires when its condition is true
2. A rule does not fire when its condition is false
3. Priority — higher-priority rules execute before lower ones
4. Rules can read from and write back to the environment
5. `evaluateWithTrace()` captures what fired and what didn't, without crashing

```ts
import { test, expect, describe } from "bun:test";
import { RuleEngine } from "@surveybuilder/rule-engine";

// ── 1. A rule fires when its condition is true ────────────────────────────────

test("rule fires when condition is true", () => {
  const engine = new RuleEngine<{ alerts: string[] }>({ temperature: 105 });

  engine.addRule({
    name:      'high-temp-alert',
    priority:  0,
    condition: 'temperature > 100',
    action:    (ctx) => ctx.alerts.push('HIGH_TEMP'),
  });

  const ctx = { alerts: [] };
  const fired = engine.evaluate(ctx);

  expect(fired).toEqual(['high-temp-alert']);
  expect(ctx.alerts).toContain('HIGH_TEMP');
});

// ── 2. A rule does not fire when condition is false ───────────────────────────

test("rule does not fire when condition is false", () => {
  const engine = new RuleEngine<{ alerts: string[] }>({ temperature: 98 });

  engine.addRule({
    name:      'high-temp-alert',
    priority:  0,
    condition: 'temperature > 100',
    action:    (ctx) => ctx.alerts.push('HIGH_TEMP'),
  });

  const ctx = { alerts: [] };
  engine.evaluate(ctx);

  expect(ctx.alerts).toHaveLength(0);
});

// ── 3. Priority order ─────────────────────────────────────────────────────────

test("rules fire in descending priority order", () => {
  const engine = new RuleEngine<{ log: string[] }>({ active: true });
  const log: string[] = [];

  engine.addRule({ name: 'low',  priority: 1,  condition: 'active == true', action: () => log.push('low')  });
  engine.addRule({ name: 'high', priority: 10, condition: 'active == true', action: () => log.push('high') });
  engine.addRule({ name: 'mid',  priority: 5,  condition: 'active == true', action: () => log.push('mid')  });

  engine.evaluate({});

  expect(log).toEqual(['high', 'mid', 'low']);
});

// ── 4. A rule's action can update the environment for later rules ─────────────

test("earlier rule can set a value used by a later rule", () => {
  const engine = new RuleEngine<{}>({ x: 0 });
  const log: string[] = [];

  engine.addRule({
    name:      'set-x',
    priority:  10,
    condition: 'x == 0',
    action:    (_ctx, e) => e.set('x', 42),
  });
  engine.addRule({
    name:      'read-x',
    priority:  5,
    condition: 'x == 42',        // only true after 'set-x' fires
    action:    () => log.push('x-was-42'),
  });

  engine.evaluate({});

  expect(log).toContain('x-was-42');
});

// ── 5. evaluateWithTrace() captures all outcomes ──────────────────────────────

test("evaluateWithTrace reports fired and not-fired rules", () => {
  const engine = new RuleEngine({ score: 85 });

  engine.addRule({ name: 'pass',         priority: 10, condition: 'score >= 60',  action: () => {} });
  engine.addRule({ name: 'distinction',  priority: 5,  condition: 'score >= 90',  action: () => {} });

  const trace = engine.evaluateWithTrace({});

  const pass        = trace.find(t => t.name === 'pass')!;
  const distinction = trace.find(t => t.name === 'distinction')!;

  expect(pass.fired).toBe(true);
  expect(distinction.fired).toBe(false);
});

// ── 6. evaluateWithTrace() does not crash on undefined variables ──────────────

test("evaluateWithTrace catches errors per-rule without crashing", () => {
  const engine = new RuleEngine({});       // 'score' not defined

  engine.addRule({ name: 'check', priority: 0, condition: 'score > 50', action: () => {} });

  const trace = engine.evaluateWithTrace({});

  expect(trace[0].fired).toBe(false);
  expect(trace[0].error).toBeDefined();   // reports the error, doesn't throw
});
```

**Common mistakes:**
- Forgetting that `evaluate()` runs rules in priority order — if a rule modifies the environment, later rules see the updated value, not the original
- Testing the action's side effect on `ctx` without first checking that `fired` contains the rule name — test both, they should agree

---

### Testing Backward Chaining (`BackwardChainer`)

The core pattern is: define rules, give the chainer partial facts, assert on `proved`, `satisfied`, `missing`, and `score`.

**What to test:**

1. All conditions met → `proved: true`
2. Some conditions missing → `proved: false`, correct items in `missing`
3. A false fact (not just absent) appears in `missing`
4. `score` reflects the correct fraction
5. `bestMatch()` returns the highest-scoring conclusion
6. Multiple rules for the same conclusion — proved when any one fires

```ts
import { test, expect, describe } from "bun:test";
import { BackwardChainer } from "@surveybuilder/rule-engine";

function makeChainer() {
  const chainer = new BackwardChainer();

  chainer.addRule({
    name:       'premium-eligible',
    conclusion: 'premium',
    conditions: [
      'account_age_days >= 365',
      'total_spend >= 500',
      'no_chargebacks == true',
    ],
  });

  chainer.addRule({
    name:       'basic-eligible',
    conclusion: 'basic',
    conditions: [
      'account_age_days >= 30',
      'email_verified == true',
    ],
  });

  return chainer;
}

// ── 1. All conditions met → proved ───────────────────────────────────────────

test("proves 'premium' when all conditions are met", () => {
  const chainer = makeChainer();
  const result = chainer.prove('premium', {
    account_age_days: 400,
    total_spend:      750,
    no_chargebacks:   true,
  });

  expect(result.proved).toBe(true);
  expect(result.rule).toBe('premium-eligible');
  expect(result.candidates[0].missing).toHaveLength(0);
});

// ── 2. Partial facts → not proved, correct missing list ──────────────────────

test("not proved when one condition is missing, reports which one", () => {
  const chainer = makeChainer();
  const result = chainer.prove('premium', {
    account_age_days: 400,
    total_spend:      750,
    // no_chargebacks not provided
  });

  expect(result.proved).toBe(false);
  expect(result.candidates[0].missing).toEqual(['no_chargebacks == true']);
  expect(result.candidates[0].satisfied).toContain('account_age_days >= 365');
  expect(result.candidates[0].satisfied).toContain('total_spend >= 500');
});

// ── 3. A false fact also appears in missing ───────────────────────────────────

test("a known-false condition appears in missing, not satisfied", () => {
  const chainer = makeChainer();
  const result = chainer.prove('premium', {
    account_age_days: 400,
    total_spend:      750,
    no_chargebacks:   false,    // known, but wrong
  });

  expect(result.proved).toBe(false);
  expect(result.candidates[0].missing).toContain('no_chargebacks == true');
  expect(result.candidates[0].satisfied).not.toContain('no_chargebacks == true');
});

// ── 4. Score reflects fraction of conditions met ──────────────────────────────

test("score is 2/3 when 2 of 3 conditions are satisfied", () => {
  const chainer = makeChainer();
  const result = chainer.prove('premium', { account_age_days: 400, total_spend: 750 }); // 2 of 3

  expect(result.candidates[0].score).toBeCloseTo(2 / 3);
});

// ── 5. bestMatch returns the highest-scoring conclusion ───────────────────────

test("bestMatch returns 'basic' when only basic conditions are met", () => {
  const chainer = makeChainer();
  const match = chainer.bestMatch({
    account_age_days: 60,
    email_verified:   true,
    // premium conditions not met
  });

  expect(match!.conclusion).toBe('basic');
  expect(match!.score).toBe(1);
});

test("bestMatch returns best partial match when nothing is fully proved", () => {
  const chainer = makeChainer();
  const match = chainer.bestMatch({ account_age_days: 400 }); // matches 1/3 premium, 1/2 basic

  // basic scores 1/2 = 0.5; premium scores 1/3 ≈ 0.33
  expect(match!.conclusion).toBe('basic');
  expect(match!.score).toBeCloseTo(0.5);
});

// ── 6. Multiple rules for same conclusion — OR semantics ──────────────────────

test("conclusion proved via second rule when first rule fails", () => {
  const chainer = new BackwardChainer();

  chainer.addRule({
    name:       'standard',
    conclusion: 'approved',
    conditions: ['credit_score >= 700', 'income >= 50000'],
  });
  chainer.addRule({
    name:       'with-guarantor',
    conclusion: 'approved',
    conditions: ['has_guarantor == true', 'income >= 25000'],
  });

  // Doesn't meet standard requirements but has a guarantor
  const result = chainer.prove('approved', { credit_score: 620, income: 30000, has_guarantor: true });

  expect(result.proved).toBe(true);
  expect(result.rule).toBe('with-guarantor');
});
```

**Common mistakes:**
- Asserting `proved: false` without also checking `missing` — the failure reason is the useful part
- Forgetting that an absent variable and a `false` variable both end up in `missing` (both prevent the condition from being satisfied)
- Not testing `bestMatch()` with partial facts — this is the most useful mode in practice

---

### Testing the Constraint Solver (`ConstraintSolver`)

The core pattern is: call `solve()`, assert `found: true`, and use `toBeCloseTo()` rather than exact equality — the solver converges to within a tolerance, not exactly.

**What to test:**

1. Solves a linear equation correctly
2. Solves a non-linear equation correctly
3. Returns `found: false` when root is not bracketed in the range
4. Restores the original environment value after solving
5. Throws when `targetVar` is not in the expression
6. The result is within the specified tolerance

```ts
import { test, expect, describe } from "bun:test";
import { ConstraintSolver, Environment, RuleEngineError } from "@surveybuilder/rule-engine";

const solver = new ConstraintSolver();

// ── 1. Linear equation ────────────────────────────────────────────────────────

test("solves 2*x + 1 == 11  →  x = 5", () => {
  const result = solver.solve('2*x + 1', 'x', 11, {}, { min: 0, max: 20 });

  expect(result.found).toBe(true);
  expect(result.value).toBeCloseTo(5, 6);    // correct to 6 decimal places
});

// ── 2. Non-linear equation ────────────────────────────────────────────────────

test("solves x^2 == 9  →  x ≈ 3 (searching positive range)", () => {
  const result = solver.solve('x^2', 'x', 9, {}, { min: 0, max: 10 });

  expect(result.found).toBe(true);
  expect(result.value).toBeCloseTo(3, 5);
});

test("solves x^2 == 9  →  x ≈ -3 (searching negative range)", () => {
  const result = solver.solve('x^2', 'x', 9, {}, { min: -10, max: 0 });

  expect(result.found).toBe(true);
  expect(result.value).toBeCloseTo(-3, 5);
});

// ── 3. No solution in range → found: false ────────────────────────────────────

test("returns found: false when root is not bracketed", () => {
  // x^2 is always >= 0, so x^2 == -1 has no real solution
  const result = solver.solve('x^2', 'x', -1, {}, { min: -100, max: 100 });

  expect(result.found).toBe(false);
  expect(result.value).toBeUndefined();
  expect(result.iterations).toBe(0);
});

test("returns found: false when solution is outside the search range", () => {
  // x == 50, but we only search 0..10
  const result = solver.solve('x', 'x', 50, {}, { min: 0, max: 10 });

  expect(result.found).toBe(false);
});

// ── 4. Environment is restored after solving ──────────────────────────────────

test("original value of targetVar is restored after solving", () => {
  const env = Environment.from({ correction: 99 });
  solver.solve('correction', 'correction', 5, env, { min: 0, max: 20 });

  expect(env.get('correction')).toBe(99);   // restored, not left at 5
});

test("other variables in env are not modified", () => {
  const env = Environment.from({ gap: 30, correction: 0 });
  solver.solve('gap + correction', 'correction', 35, env, { min: 0, max: 20 });

  expect(env.get('gap')).toBe(30);   // unchanged
});

// ── 5. Error when targetVar is not in the expression ─────────────────────────

test("throws when targetVar does not appear in the expression", () => {
  expect(() =>
    solver.solve('a + b', 'x', 10, { a: 3, b: 4 })
  ).toThrow("does not appear in expression");
});

// ── 6. Tolerance is respected ─────────────────────────────────────────────────

test("result is within default tolerance of 1e-9", () => {
  const result = solver.solve('x', 'x', 3.14159, {}, { min: 0, max: 10 });

  expect(result.found).toBe(true);
  expect(Math.abs(result.value! - 3.14159)).toBeLessThan(1e-9);
});

test("custom tolerance is respected", () => {
  const result = solver.solve('x', 'x', 3.14159, {}, {
    min: 0, max: 10, tolerance: 0.01,
  });

  expect(result.found).toBe(true);
  expect(Math.abs(result.value! - 3.14159)).toBeLessThan(0.01);
  // Fewer iterations needed with looser tolerance
  expect(result.iterations).toBeLessThan(20);
});

// ── Real-world example: music note spacing ────────────────────────────────────

test("finds the correction that produces exactly the required note gap", () => {
  // noteXs[i] = noteXs[i-1] + baseSpacing + correction
  // We want the total spacing to equal minGap (35 staff spaces)
  const result = solver.solve(
    'baseSpacing + correction',
    'correction',
    35,
    { baseSpacing: 28 },
    { min: 0, max: 20 },
  );

  expect(result.found).toBe(true);
  expect(result.value).toBeCloseTo(7, 6);
});
```

**Common mistakes:**
- Using `toBe()` instead of `toBeCloseTo()` — the solver converges to within tolerance, so exact equality will fail at floating-point precision
- Testing only the happy path — always add a test for the case where `found: false` to confirm your range bounds are correct
- Forgetting to test that the environment is restored — a solver that leaks its search variable into the environment will corrupt later evaluations

---

### Testing the Three Modes Together

Some scenarios exercise all three modes in sequence. This is a good integration test pattern: use forward chaining to build up facts, backward chaining to check what conclusions are reachable, and the constraint solver to fill in numeric gaps.

```ts
import { RuleEngine, BackwardChainer, ConstraintSolver, Environment } from "@surveybuilder/rule-engine";

test("full pipeline: forward → backward → numeric solve", () => {
  // Step 1: forward chaining derives facts from raw inputs.
  // We use Environment here so we can read derived values back after evaluate().
  const env = Environment.from({ raw_score: 72, bonus_points: 8 });
  const forwardEngine = new RuleEngine(env);

  forwardEngine.addRule({
    name:      'apply-bonus',
    priority:  10,
    condition: 'raw_score >= 70',
    action:    (_ctx, e) => e.set('final_score', (e.get('raw_score') as number) + (e.get('bonus_points') as number)),
  });
  forwardEngine.evaluate({});
  // env now has final_score = 80

  // Step 2: backward chaining checks eligibility using derived facts
  const chainer = new BackwardChainer();
  chainer.addRule({
    name:       'merit-scholarship',
    conclusion: 'scholarship',
    conditions: ['final_score >= 80', 'attendance >= 90'],
  });

  const eligibility = chainer.prove('scholarship', env);
  // final_score condition is now satisfied (= 80), attendance is still missing

  expect(eligibility.proved).toBe(false);
  expect(eligibility.candidates[0].satisfied).toContain('final_score >= 80');
  expect(eligibility.candidates[0].missing).toContain('attendance >= 90');

  // Step 3: numeric solve — what raw_score would produce final_score == 90?
  const solver = new ConstraintSolver();
  const result = solver.solve('raw_score + bonus_points', 'raw_score', 90, { bonus_points: 8 }, { min: 0, max: 100 });

  expect(result.found).toBe(true);
  expect(result.value).toBeCloseTo(82, 6);
  // Answer: a raw score of 82 would produce final_score = 90
});
```
