import { Parser } from './Parser';
import { Interpreter } from './Interpreter';
import { Environment } from './Environment';
import { toEnvironment } from './utils';
import type { Facts } from './utils';
import { ParseError } from './errors';
import type { ASTNode } from './ast/ASTNode';

// ── Public types ──────────────────────────────────────────────────────────────

/**
 * A deductive rule: "IF all conditions are true THEN conclusion holds."
 *
 * Conditions are expression strings evaluated against an Environment.
 * Conclusion is a plain string identifier — the label this rule proves
 * (e.g. "turtle", "bird", "approved").
 *
 * Multiple rules may share the same conclusion (OR semantics between rules):
 * the goal is proved when *any* matching rule has all its conditions satisfied.
 */
export interface DeductiveRule {
  name:         string;
  conclusion:   string;
  conditions:   string[];
  description?: string;
}

/** Per-rule evaluation detail returned by prove() and bestMatch(). */
export interface CandidateResult {
  rule:        string;
  conclusion:  string;
  /** Condition strings that evaluated to true. */
  satisfied:   string[];
  /** Condition strings that evaluated to false or threw (variable missing, etc.). */
  missing:     string[];
  /**
   * Fraction of conditions satisfied: satisfied.length / conditions.length.
   * A rule with zero conditions always scores 1.
   */
  score:       number;
}

/** Result of a prove() call. */
export interface ProveResult {
  goal:      string;
  /** True when at least one rule for this goal has all conditions satisfied. */
  proved:    boolean;
  /** Name of the first rule that fully proved the goal (if proved). */
  rule?:     string;
  /**
   * All rules whose conclusion matches the goal, sorted by score descending.
   * Useful for showing "how close" each rule is when the goal is not proved.
   */
  candidates: CandidateResult[];
}

// ── BackwardChainer ───────────────────────────────────────────────────────────

/**
 * Backward-chaining inference engine.
 *
 * Given a *goal* (a conclusion string), BackwardChainer finds all rules whose
 * conclusion matches and evaluates their conditions against the current
 * environment. It reports which conditions are already satisfied and which are
 * still missing — i.e. it tells you *what needs to be true* to prove the goal.
 *
 * Rules are independent of each other. Multiple rules may share the same
 * conclusion; the goal is proved when any one of them fires (OR semantics).
 * Within a single rule all conditions must hold (AND semantics).
 *
 * @example
 * ```ts
 * const chainer = new BackwardChainer();
 *
 * chainer.addRule({
 *   name:       'is-turtle',
 *   conclusion: 'turtle',
 *   conditions: ['has_shell == true', 'cold_blooded == true', 'lays_eggs == true'],
 * });
 *
 * // What do we need to prove "turtle"?
 * const env = Environment.from({ has_shell: true, cold_blooded: false });
 * const result = chainer.prove('turtle', env);
 * // result.proved   → false
 * // result.candidates[0].satisfied → ['has_shell == true']
 * // result.candidates[0].missing   → ['cold_blooded == true', 'lays_eggs == true']
 *
 * // Given partial facts, which conclusion fits best?
 * chainer.bestMatch(env);
 * // → { conclusion: 'turtle', score: 0.33, ... }
 * ```
 */
export class BackwardChainer {
  private rules: DeductiveRule[] = [];
  private parser = new Parser();
  /** Pre-compiled ASTs keyed by condition string. */
  private conditionCache = new Map<string, ASTNode>();

  // ── Rule management ─────────────────────────────────────────────────────────

  /**
   * Register a rule. Conditions are compiled eagerly — a ParseError is thrown
   * immediately if any condition string is syntactically invalid.
   * Re-adding a rule with the same name replaces the old one.
   */
  addRule(rule: DeductiveRule): void {
    for (const cond of rule.conditions) {
      this.compile(cond); // throws ParseError on bad syntax
    }
    this.rules = this.rules.filter(r => r.name !== rule.name);
    this.rules.push(rule);
  }

  /** Remove a rule by name. No-op if not found. */
  removeRule(name: string): void {
    this.rules = this.rules.filter(r => r.name !== name);
  }

  /** All distinct conclusion labels known to this chainer. */
  conclusions(): string[] {
    return [...new Set(this.rules.map(r => r.conclusion))];
  }

  // ── Core inference ──────────────────────────────────────────────────────────

  /**
   * Try to prove `goal` using the facts currently in `env`.
   *
   * Returns a ProveResult with:
   * - `proved` — whether any rule fully satisfies the goal
   * - `rule`   — the name of the proving rule (when proved)
   * - `candidates` — every rule for this goal with per-condition detail,
   *   sorted by score descending so the "closest" rule is first
   */
  prove(goal: string, env: Facts): ProveResult {
    const interpreter = new Interpreter(toEnvironment(env));
    const matchingRules = this.rules.filter(r => r.conclusion === goal);

    const candidates: CandidateResult[] = matchingRules.map(rule =>
      this.evaluateRule(rule, interpreter)
    );

    candidates.sort((a, b) => b.score - a.score);

    const winner = candidates.find(c => c.missing.length === 0);
    return {
      goal,
      proved:     !!winner,
      rule:       winner?.rule,
      candidates,
    };
  }

  /**
   * Evaluate all known conclusions and return the one whose rule has the
   * highest score (most conditions satisfied as a fraction).
   *
   * Returns `null` when no rules are registered.
   *
   * When multiple conclusions tie on score, the one whose rule name comes
   * first alphabetically is returned (deterministic output).
   */
  bestMatch(env: Facts): CandidateResult | null {
    const interpreter = new Interpreter(toEnvironment(env));
    let best: CandidateResult | null = null;

    for (const rule of this.rules) {
      const candidate = this.evaluateRule(rule, interpreter);
      if (!best || candidate.score > best.score ||
          (candidate.score === best.score && candidate.rule < best.rule)) {
        best = candidate;
      }
    }

    return best;
  }

  /**
   * For every known conclusion, return a ProveResult.
   * Useful for dashboards that show the full inference state at once.
   */
  proveAll(env: Facts): ProveResult[] {
    return this.conclusions().map(goal => this.prove(goal, env));
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private compile(condition: string): ASTNode {
    if (!this.conditionCache.has(condition)) {
      this.conditionCache.set(condition, this.parser.parse(condition));
    }
    return this.conditionCache.get(condition)!;
  }

  private evaluateRule(rule: DeductiveRule, interpreter: Interpreter): CandidateResult {
    const satisfied: string[] = [];
    const missing: string[]   = [];

    for (const cond of rule.conditions) {
      try {
        const result = interpreter.interpret(this.compile(cond));
        (result === true ? satisfied : missing).push(cond);
      } catch {
        missing.push(cond);   // undefined variable, type error, etc.
      }
    }

    const total = rule.conditions.length;
    const score = total === 0 ? 1 : satisfied.length / total;

    return { rule: rule.name, conclusion: rule.conclusion, satisfied, missing, score };
  }
}
