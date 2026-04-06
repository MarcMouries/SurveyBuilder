/**
 * Validates every code example from docs/reasoning-modes.md.
 * If any of these fail, the doc is wrong and must be fixed.
 */
import { test, expect, describe } from "bun:test";
import { RuleEngine } from "../src/RuleEngine";
import { BackwardChainer } from "../src/BackwardChainer";
import { ConstraintSolver } from "../src/ConstraintSolver";
import { Environment } from "../src/Environment";
import { RuleEngineError } from "../src/errors";

// ════════════════════════════════════════════════════════════════════════════
// FORWARD CHAINING — RuleEngine
// ════════════════════════════════════════════════════════════════════════════

describe("docs: RuleEngine (forward chaining)", () => {

  test("rule fires when condition is true", () => {
    const env = Environment.from({ temperature: 105 });
    const engine = new RuleEngine<{ alerts: string[] }>(env);

    engine.addRule({
      name:      'high-temp-alert',
      priority:  0,
      condition: 'temperature > 100',
      action:    (ctx) => ctx.alerts.push('HIGH_TEMP'),
    });

    const ctx = { alerts: [] as string[] };
    const fired = engine.evaluate(ctx);

    expect(fired).toEqual(['high-temp-alert']);
    expect(ctx.alerts).toContain('HIGH_TEMP');
  });

  test("rule does not fire when condition is false", () => {
    const env = Environment.from({ temperature: 98 });
    const engine = new RuleEngine<{ alerts: string[] }>(env);

    engine.addRule({
      name:      'high-temp-alert',
      priority:  0,
      condition: 'temperature > 100',
      action:    (ctx) => ctx.alerts.push('HIGH_TEMP'),
    });

    const ctx = { alerts: [] as string[] };
    engine.evaluate(ctx);

    expect(ctx.alerts).toHaveLength(0);
  });

  test("rules fire in descending priority order", () => {
    const env = Environment.from({ active: true });
    const engine = new RuleEngine<{ log: string[] }>(env);
    const log: string[] = [];

    engine.addRule({ name: 'low',  priority: 1,  condition: 'active == true', action: () => log.push('low')  });
    engine.addRule({ name: 'high', priority: 10, condition: 'active == true', action: () => log.push('high') });
    engine.addRule({ name: 'mid',  priority: 5,  condition: 'active == true', action: () => log.push('mid')  });

    engine.evaluate({});

    expect(log).toEqual(['high', 'mid', 'low']);
  });

  test("earlier rule can set a value used by a later rule", () => {
    const env = Environment.from({ x: 0 });
    const engine = new RuleEngine<{}>(env);
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
      condition: 'x == 42',
      action:    () => log.push('x-was-42'),
    });

    engine.evaluate({});

    expect(log).toContain('x-was-42');
  });

  test("evaluateWithTrace reports fired and not-fired rules", () => {
    const env = Environment.from({ score: 85 });
    const engine = new RuleEngine(env);

    engine.addRule({ name: 'pass',        priority: 10, condition: 'score >= 60', action: () => {} });
    engine.addRule({ name: 'distinction', priority: 5,  condition: 'score >= 90', action: () => {} });

    const trace = engine.evaluateWithTrace({});

    const pass        = trace.find(t => t.name === 'pass')!;
    const distinction = trace.find(t => t.name === 'distinction')!;

    expect(pass.fired).toBe(true);
    expect(distinction.fired).toBe(false);
  });

  test("evaluateWithTrace catches errors per-rule without crashing", () => {
    const env = Environment.from({});  // 'score' not defined
    const engine = new RuleEngine(env);

    engine.addRule({ name: 'check', priority: 0, condition: 'score > 50', action: () => {} });

    const trace = engine.evaluateWithTrace({});

    expect(trace[0].fired).toBe(false);
    expect(trace[0].error).toBeDefined();
  });

});

// ════════════════════════════════════════════════════════════════════════════
// BACKWARD CHAINING — BackwardChainer
// ════════════════════════════════════════════════════════════════════════════

describe("docs: BackwardChainer (backward chaining)", () => {

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

  test("proves 'premium' when all conditions are met", () => {
    const chainer = makeChainer();
    const env = Environment.from({
      account_age_days: 400,
      total_spend:      750,
      no_chargebacks:   true,
    });

    const result = chainer.prove('premium', env);

    expect(result.proved).toBe(true);
    expect(result.rule).toBe('premium-eligible');
    expect(result.candidates[0].missing).toHaveLength(0);
  });

  test("not proved when one condition is missing, reports which one", () => {
    const chainer = makeChainer();
    const env = Environment.from({
      account_age_days: 400,
      total_spend:      750,
      // no_chargebacks not provided
    });

    const result = chainer.prove('premium', env);

    expect(result.proved).toBe(false);
    expect(result.candidates[0].missing).toEqual(['no_chargebacks == true']);
    expect(result.candidates[0].satisfied).toContain('account_age_days >= 365');
    expect(result.candidates[0].satisfied).toContain('total_spend >= 500');
  });

  test("a known-false condition appears in missing, not satisfied", () => {
    const chainer = makeChainer();
    const env = Environment.from({
      account_age_days: 400,
      total_spend:      750,
      no_chargebacks:   false,
    });

    const result = chainer.prove('premium', env);

    expect(result.proved).toBe(false);
    expect(result.candidates[0].missing).toContain('no_chargebacks == true');
    expect(result.candidates[0].satisfied).not.toContain('no_chargebacks == true');
  });

  test("score is 2/3 when 2 of 3 conditions are satisfied", () => {
    const chainer = makeChainer();
    const env = Environment.from({ account_age_days: 400, total_spend: 750 });

    const result = chainer.prove('premium', env);

    expect(result.candidates[0].score).toBeCloseTo(2 / 3);
  });

  test("bestMatch returns 'basic' when only basic conditions are met", () => {
    const chainer = makeChainer();
    const env = Environment.from({
      account_age_days: 60,
      email_verified:   true,
    });

    const match = chainer.bestMatch(env);

    expect(match!.conclusion).toBe('basic');
    expect(match!.score).toBe(1);
  });

  test("bestMatch returns best partial match when nothing is fully proved", () => {
    const chainer = makeChainer();
    const env = Environment.from({ account_age_days: 400 }); // 1/3 premium, 1/2 basic

    const match = chainer.bestMatch(env);

    // basic scores 1/2 = 0.5; premium scores 1/3 ≈ 0.33
    expect(match!.conclusion).toBe('basic');
    expect(match!.score).toBeCloseTo(0.5);
  });

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

    const env = Environment.from({ credit_score: 620, income: 30000, has_guarantor: true });
    const result = chainer.prove('approved', env);

    expect(result.proved).toBe(true);
    expect(result.rule).toBe('with-guarantor');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// CONSTRAINT SOLVER
// ════════════════════════════════════════════════════════════════════════════

describe("docs: ConstraintSolver", () => {

  const solver = new ConstraintSolver();

  test("solves 2*x + 1 == 11  →  x = 5", () => {
    const result = solver.solve('2*x + 1', 'x', 11, Environment.from({}), { min: 0, max: 20 });

    expect(result.found).toBe(true);
    expect(result.value).toBeCloseTo(5, 6);
  });

  test("solves x^2 == 9  →  x ≈ 3 (positive range)", () => {
    const result = solver.solve('x^2', 'x', 9, Environment.from({}), { min: 0, max: 10 });

    expect(result.found).toBe(true);
    expect(result.value).toBeCloseTo(3, 5);
  });

  test("solves x^2 == 9  →  x ≈ -3 (negative range)", () => {
    const result = solver.solve('x^2', 'x', 9, Environment.from({}), { min: -10, max: 0 });

    expect(result.found).toBe(true);
    expect(result.value).toBeCloseTo(-3, 5);
  });

  test("returns found: false when root is not bracketed (impossible equation)", () => {
    const result = solver.solve('x^2', 'x', -1, Environment.from({}), { min: -100, max: 100 });

    expect(result.found).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.iterations).toBe(0);
  });

  test("returns found: false when solution is outside the search range", () => {
    const result = solver.solve('x', 'x', 50, Environment.from({}), { min: 0, max: 10 });

    expect(result.found).toBe(false);
  });

  test("original value of targetVar is restored after solving", () => {
    const env = Environment.from({ correction: 99 });
    solver.solve('correction', 'correction', 5, env, { min: 0, max: 20 });

    expect(env.get('correction')).toBe(99);
  });

  test("other variables in env are not modified", () => {
    const env = Environment.from({ gap: 30, correction: 0 });
    solver.solve('gap + correction', 'correction', 35, env, { min: 0, max: 20 });

    expect(env.get('gap')).toBe(30);
  });

  test("throws when targetVar does not appear in the expression", () => {
    expect(() =>
      solver.solve('a + b', 'x', 10, Environment.from({ a: 3, b: 4 }))
    ).toThrow("does not appear in expression");
  });

  test("result is within default tolerance of 1e-9", () => {
    const result = solver.solve('x', 'x', 3.14159, Environment.from({}), { min: 0, max: 10 });

    expect(result.found).toBe(true);
    expect(Math.abs(result.value! - 3.14159)).toBeLessThan(1e-9);
  });

  test("custom tolerance is respected and needs fewer iterations", () => {
    const result = solver.solve('x', 'x', 3.14159, Environment.from({}), {
      min: 0, max: 10, tolerance: 0.01,
    });

    expect(result.found).toBe(true);
    expect(Math.abs(result.value! - 3.14159)).toBeLessThan(0.01);
    expect(result.iterations).toBeLessThan(20);
  });

  test("real-world: finds the correction that produces the required note gap", () => {
    const env = Environment.from({ baseSpacing: 28 });

    const result = solver.solve(
      'baseSpacing + correction',
      'correction',
      35,
      env,
      { min: 0, max: 20 },
    );

    expect(result.found).toBe(true);
    expect(result.value).toBeCloseTo(7, 6);
  });

});

// ════════════════════════════════════════════════════════════════════════════
// INTEGRATION — all three modes in sequence
// ════════════════════════════════════════════════════════════════════════════

describe("docs: integration — forward → backward → solve", () => {

  test("full pipeline: forward chaining derives facts, backward checks eligibility, solver finds threshold", () => {
    // Step 1: forward chaining derives final_score from raw inputs
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

    expect(env.get('final_score')).toBe(80);

    // Step 2: backward chaining checks scholarship eligibility
    const chainer = new BackwardChainer();
    chainer.addRule({
      name:       'merit-scholarship',
      conclusion: 'scholarship',
      conditions: ['final_score >= 80', 'attendance >= 90'],
    });

    const eligibility = chainer.prove('scholarship', env);

    expect(eligibility.proved).toBe(false);
    expect(eligibility.candidates[0].satisfied).toContain('final_score >= 80');
    expect(eligibility.candidates[0].missing).toContain('attendance >= 90');

    // Step 3: constraint solver — what raw_score would produce final_score == 90?
    const solver = new ConstraintSolver();
    const solveEnv = Environment.from({ bonus_points: 8 });
    const result = solver.solve(
      'raw_score + bonus_points',
      'raw_score',
      90,
      solveEnv,
      { min: 0, max: 100 },
    );

    expect(result.found).toBe(true);
    expect(result.value).toBeCloseTo(82, 6);
  });

});
