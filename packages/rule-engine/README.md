# @surveybuilder/rule-engine

A standalone, domain-agnostic expression evaluator and rule engine. Zero dependencies on any application framework. Designed to be reusable in any domain — including music notation layout, form validation, game logic, and more.

---

## Architecture

Three-stage pipeline, each stage independently usable:

```
"age > 18 and has_pet == 'Yes'"
        │
        ▼
   Tokenizer          → tokens
        │
        ▼
    Parser            → AST
        │
        ▼
  Interpreter         → result value
```

On top of the pipeline, two higher-level APIs:

- **`RuleEngine`** — manages a named, priority-ordered set of rules with actions
- **`ConstraintSolver`** — finds the numeric value of an unknown that satisfies an expression

---

## Installation

```bash
# Inside the monorepo — already linked as a workspace package
bun add @surveybuilder/rule-engine
```

---

## Expression Language

### Literals
| Syntax | Type |
|---|---|
| `42`, `3.14` | number |
| `'hello'`, `"world"` | string |
| `true`, `false` | boolean |
| `[1, 2, 3]` | array |
| `0.3ss`, `2px` | unit number — expands to `0.3 * ss` |

### Operators
| Category | Operators |
|---|---|
| Arithmetic | `+` `-` `*` `/` `^` |
| Comparison | `>` `>=` `<` `<=` |
| Equality | `==` `!=` `is` `is not` |
| Logical | `and` `or` `!` |
| Membership | `contains`, `in` |

### Variables and member access
```
age                   # variable from environment
person.age            # property access
noteXs[i]             # array index
noteXs[i+1]           # computed index
```

### Function calls
Built-in: `abs`, `min`, `max`, `round`, `floor`, `ceil`, `log2`

```
abs(-5)               # 5
min(x, y)             # smaller of x, y
max(a, b)             # larger of a, b
round(3.6)            # 4
```

Custom functions can be registered at runtime — see `Interpreter.registerFunction()`.

### Assignment
```
x = 10
person.age = 30
```

---

## Core API

### `Environment`

Stores variables available to expressions.

```ts
import { Environment } from '@surveybuilder/rule-engine';

// Create from a plain object
const env = Environment.from({ age: 25, name: 'Alice' });

// Create from a Map
const env = Environment.from(new Map([['x', 1], ['y', 2]]));

// Read / write
env.set('age', 26);
env.get('age');                    // 26 — throws UndefinedVarError if missing
env.getOrDefault('score', 0);     // 0 if 'score' not defined

// Debug snapshot
env.snapshot();                    // { age: 26, name: 'Alice' }
```

### `Parser` + `Interpreter`

Evaluate a one-off expression:

```ts
import { Parser, Interpreter, Environment } from '@surveybuilder/rule-engine';

const env = Environment.from({ age: 25, has_pet: 'Yes' });
const parser = new Parser();
const interpreter = new Interpreter(env);

const ast = parser.parse("age > 18 and has_pet == 'Yes'");
interpreter.interpret(ast);   // true
```

Register a custom function:

```ts
interpreter.registerFunction('clamp', (val, lo, hi) =>
  Math.min(Math.max(val as number, lo as number), hi as number)
);
interpreter.interpret(parser.parse("clamp(x, 0, 100)"));
```

Extract which variables an expression depends on (useful for dependency tracking):

```ts
const ast = parser.parse("age > 18 and has_pet == 'Yes'");
Interpreter.extractIdentifiers(ast);  // ['age', 'has_pet']
```

---

## `RuleEngine`

Manages a priority-ordered collection of named rules. Each rule pairs a condition expression with a TypeScript action callback.

```ts
import { RuleEngine, Environment } from '@surveybuilder/rule-engine';

const env = Environment.from({
  prevStemUp: true,
  curStemUp:  false,
  LINE_SPACING: 14,
});

const engine = new RuleEngine<{ noteXs: number[]; i: number }>(env);

engine.addRule({
  name:        'stem-up-to-down',
  priority:    10,
  condition:   'prevStemUp == true and curStemUp == false',
  description: 'Compress spacing when stem direction flips up→down',
  action: (ctx, e) => {
    ctx.noteXs[ctx.i] -= (e.get('LINE_SPACING') as number) * 0.3;
  },
});

engine.addRule({
  name:      'dot-rod',
  priority:  100,          // rods fire before optical corrections
  condition: 'prevDotted == true and noteSpacing < dotRodMin',
  action:    (ctx, e) => {
    ctx.noteXs[ctx.i] = ctx.noteXs[ctx.i - 1]! + (e.get('dotRodMin') as number);
  },
});

// Evaluate all rules — returns names of rules that fired, in priority order
const fired = engine.evaluate({ noteXs, i: 3 });

// Debug trace — catches errors per-rule without crashing
const trace = engine.evaluateWithTrace({ noteXs, i: 3 });
// [
//   { name: 'dot-rod',         priority: 100, fired: false },
//   { name: 'stem-up-to-down', priority: 10,  fired: true  },
// ]
```

### Priority

Higher `priority` values execute first. Rules with the same priority execute in the order they were added.

### Serialization

`action` callbacks cannot be serialized. Everything else can:

```ts
// Save rule definitions to a database / config file
const serialized = engine.toJSON();
// [{ name: 'stem-up-to-down', priority: 10, condition: '...', description: '...' }]

// Reconstruct from stored rules + a map of action callbacks
const engine = RuleEngine.fromJSON(serialized, {
  'stem-up-to-down': (ctx, env) => { /* ... */ },
  'dot-rod':         (ctx, env) => { /* ... */ },
}, env);
```

---

## `ConstraintSolver`

Finds the numeric value of a single unknown variable that makes an expression equal to a target value. Uses interval bisection — no symbolic math required.

```ts
import { ConstraintSolver, Environment } from '@surveybuilder/rule-engine';

const solver = new ConstraintSolver();
const env = Environment.from({});

// Linear: 2*x + 1 == 11  →  x = 5
const r1 = solver.solve('2*x + 1', 'x', 11, env, { min: 0, max: 20 });
// { found: true, value: 5.000000..., iterations: 52 }

// Non-linear: x^2 == 9  →  x ≈ 3
const r2 = solver.solve('x^2', 'x', 9, env, { min: 0, max: 10 });
// { found: true, value: 2.999999..., iterations: 60 }

// With other variables in the environment
const env2 = Environment.from({ gap: 30, minGap: 35 });
const r3 = solver.solve('gap + correction', 'correction', 35, env2, { min: 0, max: 20 });
// { found: true, value: 5.0, iterations: 47 }
```

### Options

| Option | Default | Description |
|---|---|---|
| `min` | `-1e6` | Lower bound of the search range |
| `max` | `1e6` | Upper bound of the search range |
| `tolerance` | `1e-9` | Convergence threshold — stops when `\|f(x)\| < tolerance` |
| `maxIterations` | `100` | Maximum bisection steps |

### Result

| Field | Type | Description |
|---|---|---|
| `found` | `boolean` | `true` when a solution was found within tolerance |
| `value` | `number \| undefined` | The solved value (present when `found` is `true`) |
| `iterations` | `number` | Number of bisection steps performed |

**Important:** Bisection requires the root to be *bracketed* — `f(min)` and `f(max)` must have opposite signs. If they don't, `found` is `false`. Supply a range that you know contains the solution.

### Isolation guarantee

`ConstraintSolver` temporarily overwrites `targetVar` in the environment during the search. The original value is always restored when `solve()` returns, whether it succeeds or throws.

---

## Error Types

All errors extend `RuleEngineError` so you can catch them as a group or individually:

```ts
import {
  RuleEngineError,   // base class for all engine errors
  ParseError,        // invalid expression syntax; has .line and .col
  EvalError,         // runtime evaluation failure
  UndefinedVarError, // variable not in environment; has .varName
  NoSolutionError,   // ConstraintSolver found no bracketed root
} from '@surveybuilder/rule-engine';

try {
  interpreter.interpret(ast);
} catch (err) {
  if (err instanceof UndefinedVarError) {
    console.warn(`Missing variable: ${err.varName}`);
  }
}
```

---

## AST Utilities

The parser produces a typed AST. Two visitor implementations are included for debugging:

```ts
import { Parser, ASTtoString, ASTtoJSON } from '@surveybuilder/rule-engine';

const ast = new Parser().parse("age >= 13 and age <= 19");

ASTtoString.toString(ast);
// "age AND age"  (logical expression)

ASTtoJSON.toJson(ast);
// { type: 'LogicalExpression', operator: 'AND', left: {...}, right: {...} }
```

Extract all variable identifiers from an expression without evaluating it:

```ts
import { Parser, Interpreter } from '@surveybuilder/rule-engine';

const ast = new Parser().parse("age > 18 and has_pet == 'Yes' and pet_type in ['dog', 'cat']");
Interpreter.extractIdentifiers(ast);
// ['age', 'has_pet', 'pet_type']
```

This is used internally by `SurveyModel` to build dependency graphs for reactive visibility updates.

---

## Running Tests

```bash
# From the monorepo root
bun test packages/rule-engine/

# Just the rule engine and constraint solver
bun test packages/rule-engine/test/RuleEngine.test.ts
bun test packages/rule-engine/test/ConstraintSolver.test.ts
```
