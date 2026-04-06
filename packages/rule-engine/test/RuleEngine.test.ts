import { test, expect, describe } from "bun:test";
import { RuleEngine } from "../src/RuleEngine";
import { Environment } from "../src/Environment";
import { ParseError, UndefinedVarError } from "../src/errors";
import { Parser } from "../src/Parser";
import { Interpreter } from "../src/Interpreter";
import { ASTtoString } from "../src/ast/ASTtoString";
import { ASTtoJSON } from "../src/ast/ASTtoJSON";

// ── helpers ──────────────────────────────────────────────────────────────────

function makeEnv(values: Record<string, unknown> = {}): Environment {
  return Environment.from(values);
}

// ── Environment enhancements ──────────────────────────────────────────────────

describe("Environment.from()", () => {
  test("creates from plain object", () => {
    const env = Environment.from({ x: 1, y: "hello" });
    expect(env.get("x")).toBe(1);
    expect(env.get("y")).toBe("hello");
  });

  test("creates from Map", () => {
    const map = new Map<string, unknown>([["a", true], ["b", 42]]);
    const env = Environment.from(map);
    expect(env.get("a")).toBe(true);
    expect(env.get("b")).toBe(42);
  });
});

describe("Environment.getOrDefault()", () => {
  test("returns value when key exists", () => {
    const env = makeEnv({ n: 7 });
    expect(env.getOrDefault("n", 0)).toBe(7);
  });

  test("returns default when key missing", () => {
    const env = makeEnv();
    expect(env.getOrDefault("missing", 99)).toBe(99);
  });
});

describe("Environment.snapshot()", () => {
  test("returns plain object clone", () => {
    const env = makeEnv({ a: 1, b: 2 });
    const snap = env.snapshot();
    expect(snap).toEqual({ a: 1, b: 2 });
  });
});

describe("UndefinedVarError", () => {
  test("thrown with varName property", () => {
    const env = makeEnv();
    try {
      env.get("missing");
      expect(true).toBe(false); // should not reach
    } catch (err) {
      expect(err).toBeInstanceOf(UndefinedVarError);
      expect((err as UndefinedVarError).varName).toBe("missing");
    }
  });
});

// ── Interpreter.registerFunction() ───────────────────────────────────────────

describe("Interpreter.registerFunction()", () => {
  test("abs(-5) === 5", () => {
    const parser = new Parser();
    const interp = new Interpreter();
    const result = interp.interpret(parser.parse("abs(-5)"));
    expect(result).toBe(5);
  });

  test("min(3, 7) === 3", () => {
    const interp = new Interpreter();
    const result = interp.interpret(new Parser().parse("min(3, 7)"));
    expect(result).toBe(3);
  });

  test("max(3, 7) === 7", () => {
    const interp = new Interpreter();
    const result = interp.interpret(new Parser().parse("max(3, 7)"));
    expect(result).toBe(7);
  });

  test("round(3.6) === 4", () => {
    const interp = new Interpreter();
    expect(interp.interpret(new Parser().parse("round(3.6)"))).toBe(4);
  });

  test("floor(3.9) === 3", () => {
    const interp = new Interpreter();
    expect(interp.interpret(new Parser().parse("floor(3.9)"))).toBe(3);
  });

  test("ceil(3.1) === 4", () => {
    const interp = new Interpreter();
    expect(interp.interpret(new Parser().parse("ceil(3.1)"))).toBe(4);
  });

  test("log2(8) === 3", () => {
    const interp = new Interpreter();
    expect(interp.interpret(new Parser().parse("log2(8)"))).toBe(3);
  });

  test("custom domain function", () => {
    const interp = new Interpreter();
    interp.registerFunction("double", (x) => (x as number) * 2);
    expect(interp.interpret(new Parser().parse("double(5)"))).toBe(10);
  });

  test("unknown function throws EvalError", () => {
    const interp = new Interpreter();
    expect(() => interp.interpret(new Parser().parse("unknown(1)"))).toThrow("Unknown function 'unknown'");
  });
});

// ── Unit suffix tokenizer ─────────────────────────────────────────────────────

describe("Unit suffix parsing (0.3ss)", () => {
  test("0.3ss evaluates to 0.3 * ss when ss is defined", () => {
    const env = makeEnv({ ss: 14 });
    const interp = new Interpreter(env);
    const result = interp.interpret(new Parser().parse("0.3ss"));
    expect(result).toBeCloseTo(0.3 * 14, 10);
  });

  test("2px evaluates to 2 * px when px is defined", () => {
    const env = makeEnv({ px: 1 });
    const interp = new Interpreter(env);
    const result = interp.interpret(new Parser().parse("2px"));
    expect(result).toBe(2);
  });

  test("unit suffix in larger expression: x + 1.5ss", () => {
    const env = makeEnv({ x: 10, ss: 4 });
    const interp = new Interpreter(env);
    const result = interp.interpret(new Parser().parse("x + 1.5ss"));
    expect(result).toBe(10 + 1.5 * 4); // 16
  });
});

// ── ParseError typed errors ───────────────────────────────────────────────────

describe("ParseError", () => {
  test("thrown on invalid expression", () => {
    const parser = new Parser();
    expect(() => parser.parse("(1 + 2")).toThrow(ParseError);
  });
});

// ── RuleEngine orchestrator ───────────────────────────────────────────────────

describe("RuleEngine — basic evaluate()", () => {
  test("fires matching rule and returns its name", () => {
    const env = makeEnv({ x: 10 });
    const engine = new RuleEngine(env);
    const fired: string[] = [];
    engine.addRule({
      name: "x-is-10",
      priority: 0,
      condition: "x == 10",
      action: () => fired.push("x-is-10"),
    });
    const result = engine.evaluate({});
    expect(result).toEqual(["x-is-10"]);
    expect(fired).toEqual(["x-is-10"]);
  });

  test("does not fire when condition is false", () => {
    const env = makeEnv({ x: 5 });
    const engine = new RuleEngine(env);
    engine.addRule({ name: "x-is-10", priority: 0, condition: "x == 10", action: () => {} });
    expect(engine.evaluate({})).toEqual([]);
  });

  test("fires multiple matching rules", () => {
    const env = makeEnv({ age: 25 });
    const engine = new RuleEngine(env);
    const fired: string[] = [];
    engine.addRule({ name: "adult", priority: 0, condition: "age >= 18", action: () => fired.push("adult") });
    engine.addRule({ name: "over21", priority: 0, condition: "age >= 21", action: () => fired.push("over21") });
    engine.evaluate({});
    expect(fired).toContain("adult");
    expect(fired).toContain("over21");
  });
});

describe("RuleEngine — priority ordering", () => {
  test("higher-priority rule fires before lower-priority rule", () => {
    const env = makeEnv({ x: 1 });
    const engine = new RuleEngine(env);
    const order: string[] = [];
    engine.addRule({ name: "low",  priority: 1,   condition: "x == 1", action: () => order.push("low") });
    engine.addRule({ name: "high", priority: 100, condition: "x == 1", action: () => order.push("high") });
    engine.addRule({ name: "mid",  priority: 50,  condition: "x == 1", action: () => order.push("mid") });
    engine.evaluate({});
    expect(order).toEqual(["high", "mid", "low"]);
  });

  test("addRule keeps sort order when adding rules incrementally", () => {
    const env = makeEnv({ v: true });
    const engine = new RuleEngine(env);
    const order: string[] = [];
    engine.addRule({ name: "b", priority: 5,  condition: "v == true", action: () => order.push("b") });
    engine.addRule({ name: "a", priority: 10, condition: "v == true", action: () => order.push("a") });
    engine.evaluate({});
    expect(order).toEqual(["a", "b"]);
  });
});

describe("RuleEngine — removeRule()", () => {
  test("removed rule does not fire", () => {
    const env = makeEnv({ x: 1 });
    const engine = new RuleEngine(env);
    const fired: string[] = [];
    engine.addRule({ name: "r1", priority: 0, condition: "x == 1", action: () => fired.push("r1") });
    engine.addRule({ name: "r2", priority: 0, condition: "x == 1", action: () => fired.push("r2") });
    engine.removeRule("r1");
    engine.evaluate({});
    expect(fired).toEqual(["r2"]);
  });

  test("removeRule on unknown name is a no-op", () => {
    const env = makeEnv();
    const engine = new RuleEngine(env);
    expect(() => engine.removeRule("nonexistent")).not.toThrow();
  });
});

describe("RuleEngine — context mutation via action", () => {
  test("action can mutate context", () => {
    const env = makeEnv({ trigger: true });
    const engine = new RuleEngine<{ count: number }>(env);
    engine.addRule({
      name: "inc",
      priority: 0,
      condition: "trigger == true",
      action: (ctx) => { ctx.count += 1; },
    });
    const ctx = { count: 0 };
    engine.evaluate(ctx);
    expect(ctx.count).toBe(1);
  });

  test("action can update environment", () => {
    const env = makeEnv({ x: 5 });
    const engine = new RuleEngine(env);
    engine.addRule({
      name: "double-x",
      priority: 0,
      condition: "x == 5",
      action: (_ctx, e) => e.set("x", 10),
    });
    engine.evaluate({});
    expect(env.get("x")).toBe(10);
  });
});

describe("RuleEngine — evaluateWithTrace()", () => {
  test("returns trace for all rules", () => {
    const env = makeEnv({ flag: true });
    const engine = new RuleEngine(env);
    engine.addRule({ name: "fires",   priority: 10, condition: "flag == true",  action: () => {} });
    engine.addRule({ name: "no-fire", priority: 5,  condition: "flag == false", action: () => {} });
    const trace = engine.evaluateWithTrace({});
    expect(trace).toHaveLength(2);
    expect(trace[0]).toMatchObject({ name: "fires",   priority: 10, fired: true });
    expect(trace[1]).toMatchObject({ name: "no-fire", priority: 5,  fired: false });
  });

  test("catches errors in conditions and reports them without crashing", () => {
    const env = makeEnv(); // no variables defined
    const engine = new RuleEngine(env);
    engine.addRule({ name: "bad", priority: 0, condition: "undefined_var == 1", action: () => {} });
    const trace = engine.evaluateWithTrace({});
    expect(trace[0].fired).toBe(false);
    expect(trace[0].error).toContain("undefined_var");
  });

  test("trace respects priority ordering", () => {
    const env = makeEnv({ n: 1 });
    const engine = new RuleEngine(env);
    engine.addRule({ name: "lo", priority: 1,  condition: "n == 1", action: () => {} });
    engine.addRule({ name: "hi", priority: 99, condition: "n == 1", action: () => {} });
    const trace = engine.evaluateWithTrace({});
    expect(trace[0].name).toBe("hi");
    expect(trace[1].name).toBe("lo");
  });
});

describe("RuleEngine — addRule replaces existing by name", () => {
  test("re-adding a rule with the same name replaces it", () => {
    const env = makeEnv({ x: 1 });
    const engine = new RuleEngine(env);
    const log: string[] = [];
    engine.addRule({ name: "r", priority: 0, condition: "x == 1", action: () => log.push("v1") });
    engine.addRule({ name: "r", priority: 0, condition: "x == 1", action: () => log.push("v2") });
    engine.evaluate({});
    expect(log).toEqual(["v2"]);
  });
});

describe("RuleEngine — serialization", () => {
  test("toJSON() returns serialized rules without actions", () => {
    const env = makeEnv();
    const engine = new RuleEngine(env);
    engine.addRule({ name: "r1", priority: 5, condition: "x > 0", description: "positive x" });
    const json = engine.toJSON();
    expect(json).toEqual([{ name: "r1", priority: 5, condition: "x > 0", description: "positive x" }]);
    // action must not appear in JSON
    expect((json[0] as Record<string, unknown>)["action"]).toBeUndefined();
  });

  test("fromJSON() reconstructs a working engine", () => {
    const env = makeEnv({ y: 2 });
    const log: string[] = [];
    const engine = RuleEngine.fromJSON(
      [{ name: "r1", priority: 0, condition: "y == 2" }],
      { r1: () => log.push("fired") },
      env,
    );
    engine.evaluate({});
    expect(log).toEqual(["fired"]);
  });

  test("fromJSON() throws when action is missing for a rule", () => {
    const env = makeEnv();
    expect(() =>
      RuleEngine.fromJSON([{ name: "r1", priority: 0, condition: "true" }], {}, env)
    ).toThrow("No action registered for rule 'r1'");
  });
});

// ── Array index access ────────────────────────────────────────────────────────

describe("Array index access: arr[i]", () => {
  test("arr[0] reads first element", () => {
    const env = makeEnv({ arr: [10, 20, 30] });
    const interp = new Interpreter(env);
    expect(interp.interpret(new Parser().parse("arr[0]"))).toBe(10);
  });

  test("arr[2] reads last element", () => {
    const env = makeEnv({ arr: [10, 20, 30] });
    const interp = new Interpreter(env);
    expect(interp.interpret(new Parser().parse("arr[2]"))).toBe(30);
  });

  test("arr[i] with variable index", () => {
    const env = makeEnv({ arr: [5, 6, 7], i: 1 });
    const interp = new Interpreter(env);
    expect(interp.interpret(new Parser().parse("arr[i]"))).toBe(6);
  });

  test("arr[i+1] with computed index", () => {
    const env = makeEnv({ arr: [5, 6, 7], i: 0 });
    const interp = new Interpreter(env);
    expect(interp.interpret(new Parser().parse("arr[i+1]"))).toBe(6);
  });

  test("arr[i-1] with computed index", () => {
    const env = makeEnv({ noteXs: [0, 35, 70], i: 2 });
    const interp = new Interpreter(env);
    expect(interp.interpret(new Parser().parse("noteXs[i-1]"))).toBe(35);
  });

  test("index in arithmetic: noteXs[i] - noteXs[i-1]", () => {
    const env = makeEnv({ noteXs: [0, 35, 70], i: 1 });
    const interp = new Interpreter(env);
    expect(interp.interpret(new Parser().parse("noteXs[i] - noteXs[i-1]"))).toBe(35);
  });

  test("index in comparison: noteXs[i] - noteXs[i-1] < 40", () => {
    const env = makeEnv({ noteXs: [0, 35, 70], i: 1 });
    const interp = new Interpreter(env);
    expect(interp.interpret(new Parser().parse("noteXs[i] - noteXs[i-1] < 40"))).toBe(true);
  });

  test("index in RuleEngine condition", () => {
    const env = makeEnv({ noteXs: [0, 35, 70], i: 1 });
    const engine = new RuleEngine<{ fired: boolean }>(env);
    engine.addRule({
      name: "gap-check",
      priority: 0,
      condition: "noteXs[i] - noteXs[i-1] < 40",
      action: (ctx) => { ctx.fired = true; },
    });
    const ctx = { fired: false };
    engine.evaluate(ctx);
    expect(ctx.fired).toBe(true);
  });

  test("out-of-bounds index throws EvalError", () => {
    const env = makeEnv({ arr: [1, 2, 3] });
    const interp = new Interpreter(env);
    expect(() => interp.interpret(new Parser().parse("arr[5]"))).toThrow("out of bounds");
  });

  test("negative index throws EvalError", () => {
    const env = makeEnv({ arr: [1, 2, 3] });
    const interp = new Interpreter(env);
    expect(() => interp.interpret(new Parser().parse("arr[-1]"))).toThrow("out of bounds");
  });

  test("indexing a non-array throws EvalError", () => {
    const env = makeEnv({ x: 42 });
    const interp = new Interpreter(env);
    expect(() => interp.interpret(new Parser().parse("x[0]"))).toThrow("requires an array");
  });

  test("ASTtoString round-trips arr[i+1]", () => {
    const ast = new Parser().parse("arr[i+1]");
    expect(ASTtoString.toString(ast)).toBe("arr[(i + 1)]");
  });

  test("ASTtoJSON produces IndexExpression node", () => {
    const ast = new Parser().parse("arr[0]");
    const json = ASTtoJSON.toJson(ast) as Record<string, unknown>;
    expect(json.type).toBe("IndexExpression");
    expect((json.object as Record<string, unknown>).name).toBe("arr");
    expect((json.index as Record<string, unknown>).value).toBe(0);
  });
});

describe("RuleEngine — ParseError on bad condition", () => {
  test("addRule throws ParseError for invalid condition syntax", () => {
    const env = makeEnv();
    const engine = new RuleEngine(env);
    expect(() =>
      engine.addRule({ name: "bad", priority: 0, condition: "(unclosed", action: () => {} })
    ).toThrow(ParseError);
  });
});
