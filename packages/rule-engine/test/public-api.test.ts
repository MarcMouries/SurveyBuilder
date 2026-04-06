/**
 * Tests for the top-level public API:
 *   - evaluate() one-liner
 *   - RuleEngine, BackwardChainer, ConstraintSolver all accepting plain objects
 *   - Named exports from the package index
 */
import { test, expect, describe } from "bun:test";
import {
  evaluate,
  RuleEngine,
  BackwardChainer,
  ConstraintSolver,
  Environment,
  RuleEngineError,
  ParseError,
  EvalError,
  UndefinedVarError,
  NoSolutionError,
} from "../src/index";

// ── evaluate() ────────────────────────────────────────────────────────────────

describe("evaluate()", () => {
  test("arithmetic with plain object facts", () => {
    expect(evaluate("x * 2 + 1", { x: 5 })).toBe(11);
  });

  test("boolean comparison", () => {
    expect(evaluate("age >= 18", { age: 21 })).toBe(true);
    expect(evaluate("age >= 18", { age: 16 })).toBe(false);
  });

  test("string equality", () => {
    expect(evaluate("name == 'Alice'", { name: "Alice" })).toBe(true);
    expect(evaluate("name == 'Alice'", { name: "Bob" })).toBe(false);
  });

  test("no facts needed for literal expressions", () => {
    expect(evaluate("2 + 2")).toBe(4);
    expect(evaluate("true or false")).toBe(true);
  });

  test("accepts an Environment directly", () => {
    const env = Environment.from({ score: 95 });
    expect(evaluate("score > 90", env)).toBe(true);
  });

  test("throws ParseError on invalid expression", () => {
    expect(() => evaluate("2 +* 3")).toThrow(ParseError);
  });
});

// ── RuleEngine with plain objects ─────────────────────────────────────────────

describe("RuleEngine plain-object API", () => {
  test("constructor accepts plain facts", () => {
    const engine = new RuleEngine({ score: 80 });
    let fired = false;
    engine.addRule({
      name: "pass",
      priority: 0,
      condition: "score >= 60",
      action: () => { fired = true; },
    });
    engine.evaluate({});
    expect(fired).toBe(true);
  });

  test("fromJSON accepts plain facts", () => {
    const serialized = [{ name: "r1", priority: 0, condition: "x > 0" }];
    let fired = false;
    const engine = RuleEngine.fromJSON(
      serialized,
      { r1: () => { fired = true; } },
      { x: 5 },
    );
    engine.evaluate({});
    expect(fired).toBe(true);
  });
});

// ── BackwardChainer with plain objects ────────────────────────────────────────

describe("BackwardChainer plain-object API", () => {
  test("prove() accepts plain object", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({
      name: "is-adult",
      conclusion: "adult",
      conditions: ["age >= 18"],
    });
    const result = chainer.prove("adult", { age: 25 });
    expect(result.proved).toBe(true);
  });

  test("prove() with missing variable returns not proved", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({
      name: "is-adult",
      conclusion: "adult",
      conditions: ["age >= 18"],
    });
    const result = chainer.prove("adult", {});
    expect(result.proved).toBe(false);
    expect(result.candidates[0].missing).toContain("age >= 18");
  });

  test("bestMatch() accepts plain object", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({
      name: "dog-rule",
      conclusion: "dog",
      conditions: ["has_fur == true", "barks == true"],
    });
    chainer.addRule({
      name: "cat-rule",
      conclusion: "cat",
      conditions: ["has_fur == true", "purrs == true"],
    });
    const best = chainer.bestMatch({ has_fur: true, barks: true });
    expect(best?.conclusion).toBe("dog");
  });

  test("proveAll() accepts plain object", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({ name: "a", conclusion: "A", conditions: ["x > 0"] });
    chainer.addRule({ name: "b", conclusion: "B", conditions: ["y > 0"] });
    const results = chainer.proveAll({ x: 1, y: -1 });
    expect(results.find(r => r.goal === "A")?.proved).toBe(true);
    expect(results.find(r => r.goal === "B")?.proved).toBe(false);
  });
});

// ── ConstraintSolver with plain objects ───────────────────────────────────────

describe("ConstraintSolver plain-object API", () => {
  test("solve() accepts plain object", () => {
    const solver = new ConstraintSolver();
    const result = solver.solve("2 * x + 1", "x", 11, {});
    expect(result.found).toBe(true);
    expect(result.value).toBeCloseTo(5, 5);
  });

  test("solve() with other vars in plain object", () => {
    const solver = new ConstraintSolver();
    // a*x = target → x = target/a
    const result = solver.solve("a * x", "x", 15, { a: 3 });
    expect(result.found).toBe(true);
    expect(result.value).toBeCloseTo(5, 5);
  });

  test("solve() returns found:false when no bracket", () => {
    const solver = new ConstraintSolver();
    // x^2 is always >= 0, no root for x^2 == -1
    const result = solver.solve("x * x", "x", -1, {});
    expect(result.found).toBe(false);
  });
});

// ── Error exports ─────────────────────────────────────────────────────────────

describe("error class exports", () => {
  test("all error classes are exported", () => {
    expect(typeof RuleEngineError).toBe("function");
    expect(typeof ParseError).toBe("function");
    expect(typeof EvalError).toBe("function");
    expect(typeof UndefinedVarError).toBe("function");
    expect(typeof NoSolutionError).toBe("function");
  });

  test("error hierarchy is correct", () => {
    expect(new ParseError("x") instanceof RuleEngineError).toBe(true);
    expect(new EvalError("x") instanceof RuleEngineError).toBe(true);
    expect(new UndefinedVarError("x") instanceof EvalError).toBe(true);
    expect(new NoSolutionError("x") instanceof RuleEngineError).toBe(true);
  });
});
