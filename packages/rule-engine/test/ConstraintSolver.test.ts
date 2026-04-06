import { test, expect, describe } from "bun:test";
import { ConstraintSolver, NoSolutionError } from "../src/ConstraintSolver";
import { Environment } from "../src/Environment";
import { RuleEngineError, ParseError } from "../src/errors";

const solver = new ConstraintSolver();

function makeEnv(values: Record<string, unknown> = {}): Environment {
  return Environment.from(values);
}

// ── Linear equations ──────────────────────────────────────────────────────────

describe("ConstraintSolver — linear equations", () => {
  test("2*x + 1 == 11  →  x = 5", () => {
    const result = solver.solve("2*x + 1", "x", 11, makeEnv(), { min: 0, max: 20 });
    expect(result.found).toBe(true);
    expect(result.value!).toBeCloseTo(5, 6);
  });

  test("x == 0  →  x = 0", () => {
    const result = solver.solve("x", "x", 0, makeEnv(), { min: -10, max: 10 });
    expect(result.found).toBe(true);
    expect(result.value!).toBeCloseTo(0, 6);
  });

  test("x + 3 == 0  →  x = -3", () => {
    const result = solver.solve("x + 3", "x", 0, makeEnv(), { min: -10, max: 10 });
    expect(result.found).toBe(true);
    expect(result.value!).toBeCloseTo(-3, 6);
  });

  test("a * x == 20 with a=4  →  x = 5", () => {
    const env = makeEnv({ a: 4 });
    const result = solver.solve("a * x", "x", 20, env, { min: 0, max: 20 });
    expect(result.found).toBe(true);
    expect(result.value!).toBeCloseTo(5, 6);
    // env variable 'a' must be unchanged after solving
    expect(env.get("a")).toBe(4);
  });
});

// ── Non-linear equations ──────────────────────────────────────────────────────

describe("ConstraintSolver — non-linear equations", () => {
  test("x^2 == 9 over [0,10]  →  x ≈ 3", () => {
    const result = solver.solve("x^2", "x", 9, makeEnv(), { min: 0, max: 10 });
    expect(result.found).toBe(true);
    expect(result.value!).toBeCloseTo(3, 6);
  });

  test("x^2 == 9 over [-10,0]  →  x ≈ -3", () => {
    const result = solver.solve("x^2", "x", 9, makeEnv(), { min: -10, max: 0 });
    expect(result.found).toBe(true);
    expect(result.value!).toBeCloseTo(-3, 6);
  });

  test("x^3 == 8 over [0,10]  →  x ≈ 2", () => {
    const result = solver.solve("x^3", "x", 8, makeEnv(), { min: 0, max: 10 });
    expect(result.found).toBe(true);
    expect(result.value!).toBeCloseTo(2, 5);
  });
});

// ── No solution / not bracketed ───────────────────────────────────────────────

describe("ConstraintSolver — no solution in range", () => {
  test("returns found=false when root not bracketed", () => {
    // x^2 == 9 but range [4,10] → f(4)=7, f(10)=91, same sign
    const result = solver.solve("x^2", "x", 9, makeEnv(), { min: 4, max: 10 });
    expect(result.found).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.iterations).toBe(0);
  });

  test("returns found=false for x^2 == -1 (impossible)", () => {
    const result = solver.solve("x^2", "x", -1, makeEnv(), { min: -100, max: 100 });
    expect(result.found).toBe(false);
  });
});

// ── Environment isolation ─────────────────────────────────────────────────────

describe("ConstraintSolver — environment isolation", () => {
  test("pre-existing targetVar value is restored after solving", () => {
    const env = makeEnv({ x: 99 });
    solver.solve("x + 1", "x", 6, env, { min: 0, max: 10 });
    expect(env.get("x")).toBe(99);
  });

  test("other variables in env are unchanged", () => {
    const env = makeEnv({ x: 0, k: 7 });
    solver.solve("x + k", "x", 10, env, { min: 0, max: 20 });
    expect(env.get("k")).toBe(7);
  });

  test("solves expression that uses other env variables", () => {
    // gap + correction == minGap → solve for correction
    const env = makeEnv({ gap: 30, minGap: 35 });
    const result = solver.solve("gap + correction", "correction", 35, env, { min: 0, max: 20 });
    expect(result.found).toBe(true);
    expect(result.value!).toBeCloseTo(5, 6);
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe("ConstraintSolver — error handling", () => {
  test("throws when targetVar not in expression", () => {
    expect(() =>
      solver.solve("a + b", "x", 5, makeEnv({ a: 1, b: 2 }))
    ).toThrow("does not appear in expression");
  });

  test("throws when min >= max", () => {
    expect(() =>
      solver.solve("x", "x", 1, makeEnv(), { min: 10, max: 5 })
    ).toThrow(RuleEngineError);
  });

  test("throws ParseError for invalid expression", () => {
    expect(() =>
      solver.solve("(unclosed", "x", 1, makeEnv())
    ).toThrow(ParseError);
  });
});

// ── Tolerance and iterations ──────────────────────────────────────────────────

describe("ConstraintSolver — options", () => {
  test("respects custom tolerance", () => {
    const result = solver.solve("x", "x", 3.14159, makeEnv(), {
      min: 0, max: 10, tolerance: 1e-4,
    });
    expect(result.found).toBe(true);
    expect(Math.abs(result.value! - 3.14159)).toBeLessThan(1e-4);
  });

  test("reports iteration count > 0 when solution found", () => {
    const result = solver.solve("2*x", "x", 10, makeEnv(), { min: 0, max: 20 });
    expect(result.found).toBe(true);
    expect(result.iterations).toBeGreaterThan(0);
  });
});
