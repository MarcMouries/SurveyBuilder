import { test, expect, describe } from "bun:test";
import { BackwardChainer } from "../src/BackwardChainer";
import { Environment } from "../src/Environment";
import { ParseError } from "../src/errors";

// ── Animal taxonomy ───────────────────────────────────────────────────────────
//
// Facts an animal can have:
//   has_shell, has_feathers, has_scales, has_fur
//   cold_blooded, warm_blooded
//   lays_eggs, gives_milk, gives_birth_live
//   lives_in_water, can_fly, has_beak
//
// Conclusions: turtle, bird, fish, mammal, reptile

function makeAnimalChainer(): BackwardChainer {
  const chainer = new BackwardChainer();

  chainer.addRule({
    name:        'is-turtle',
    conclusion:  'turtle',
    description: 'Turtles have a shell, are cold-blooded, and lay eggs',
    conditions:  [
      'has_shell == true',
      'cold_blooded == true',
      'lays_eggs == true',
    ],
  });

  chainer.addRule({
    name:        'is-bird',
    conclusion:  'bird',
    description: 'Birds have feathers, lay eggs, and have a beak',
    conditions:  [
      'has_feathers == true',
      'lays_eggs == true',
      'has_beak == true',
    ],
  });

  chainer.addRule({
    name:        'is-fish',
    conclusion:  'fish',
    description: 'Fish have scales, are cold-blooded, and live in water',
    conditions:  [
      'has_scales == true',
      'cold_blooded == true',
      'lives_in_water == true',
    ],
  });

  chainer.addRule({
    name:        'is-mammal',
    conclusion:  'mammal',
    description: 'Mammals have fur, are warm-blooded, and give milk',
    conditions:  [
      'has_fur == true',
      'warm_blooded == true',
      'gives_milk == true',
    ],
  });

  chainer.addRule({
    name:        'is-reptile',
    conclusion:  'reptile',
    description: 'Reptiles are cold-blooded, lay eggs, and have scales',
    conditions:  [
      'cold_blooded == true',
      'lays_eggs == true',
      'has_scales == true',
    ],
  });

  return chainer;
}

// ── prove() — full proof with all facts ──────────────────────────────────────

describe("BackwardChainer — prove a known animal", () => {
  const chainer = makeAnimalChainer();

  test("proves turtle when all turtle facts are present", () => {
    const env = Environment.from({
      has_shell:    true,
      cold_blooded: true,
      lays_eggs:    true,
    });
    const result = chainer.prove('turtle', env);

    expect(result.proved).toBe(true);
    expect(result.rule).toBe('is-turtle');
    expect(result.candidates[0].satisfied).toEqual([
      'has_shell == true',
      'cold_blooded == true',
      'lays_eggs == true',
    ]);
    expect(result.candidates[0].missing).toEqual([]);
  });

  test("proves bird when all bird facts are present", () => {
    const env = Environment.from({ has_feathers: true, lays_eggs: true, has_beak: true });
    const result = chainer.prove('bird', env);
    expect(result.proved).toBe(true);
    expect(result.rule).toBe('is-bird');
  });

  test("proves mammal when all mammal facts are present", () => {
    const env = Environment.from({ has_fur: true, warm_blooded: true, gives_milk: true });
    expect(chainer.prove('mammal', env).proved).toBe(true);
  });

  test("proves fish when all fish facts are present", () => {
    const env = Environment.from({ has_scales: true, cold_blooded: true, lives_in_water: true });
    expect(chainer.prove('fish', env).proved).toBe(true);
  });
});

// ── prove() — partial facts: what's missing? ─────────────────────────────────

describe("BackwardChainer — explain what's missing", () => {
  const chainer = makeAnimalChainer();

  test("shows missing conditions when only some turtle facts are known", () => {
    const env = Environment.from({ has_shell: true }); // cold_blooded and lays_eggs unknown
    const result = chainer.prove('turtle', env);

    expect(result.proved).toBe(false);
    expect(result.candidates[0].satisfied).toEqual(['has_shell == true']);
    expect(result.candidates[0].missing).toEqual([
      'cold_blooded == true',
      'lays_eggs == true',
    ]);
  });

  test("shows missing conditions when a fact is false (not just absent)", () => {
    const env = Environment.from({
      has_shell:    true,
      cold_blooded: false,  // known but wrong
      lays_eggs:    true,
    });
    const result = chainer.prove('turtle', env);

    expect(result.proved).toBe(false);
    expect(result.candidates[0].satisfied).toEqual(['has_shell == true', 'lays_eggs == true']);
    expect(result.candidates[0].missing).toEqual(['cold_blooded == true']);
  });

  test("unknown goal returns proved=false with empty candidates", () => {
    const env = Environment.from({ has_shell: true });
    const result = chainer.prove('dragon', env);
    expect(result.proved).toBe(false);
    expect(result.candidates).toHaveLength(0);
  });

  test("score reflects fraction of conditions satisfied", () => {
    const env = Environment.from({ has_shell: true, cold_blooded: true }); // 2 of 3
    const result = chainer.prove('turtle', env);
    expect(result.candidates[0].score).toBeCloseTo(2 / 3);
  });

  test("score is 0 when no facts match at all", () => {
    const env = Environment.from({ has_fur: true, warm_blooded: true }); // turtle facts absent
    const result = chainer.prove('turtle', env);
    expect(result.candidates[0].score).toBe(0);
  });
});

// ── bestMatch() — which animal fits best? ────────────────────────────────────

describe("BackwardChainer — bestMatch()", () => {
  const chainer = makeAnimalChainer();

  test("returns turtle when all turtle facts are present", () => {
    const env = Environment.from({
      has_shell: true, cold_blooded: true, lays_eggs: true,
    });
    const match = chainer.bestMatch(env);
    expect(match).not.toBeNull();
    expect(match!.conclusion).toBe('turtle');
    expect(match!.score).toBe(1);
  });

  test("returns bird when all bird facts are present (ignores unrelated facts)", () => {
    const env = Environment.from({
      has_feathers: true, lays_eggs: true, has_beak: true,
      has_shell: false,   // explicitly not a turtle
    });
    const match = chainer.bestMatch(env);
    expect(match!.conclusion).toBe('bird');
    expect(match!.score).toBe(1);
  });

  test("returns closest match when no animal is fully proved", () => {
    // Provide 2 of 3 turtle facts, 1 of 3 for everything else
    const env = Environment.from({ has_shell: true, cold_blooded: true });
    const match = chainer.bestMatch(env);
    // turtle scores 2/3 ≈ 0.67; all others score at most 1/3
    expect(match!.conclusion).toBe('turtle');
    expect(match!.score).toBeCloseTo(2 / 3);
  });

  test("returns null when no rules are registered", () => {
    const empty = new BackwardChainer();
    expect(empty.bestMatch(Environment.from({}))).toBeNull();
  });
});

// ── proveAll() — full inference snapshot ─────────────────────────────────────

describe("BackwardChainer — proveAll()", () => {
  test("returns one ProveResult per conclusion", () => {
    const chainer = makeAnimalChainer();
    const env = Environment.from({ has_shell: true, cold_blooded: true, lays_eggs: true });
    const results = chainer.proveAll(env);

    expect(results.length).toBe(5); // turtle, bird, fish, mammal, reptile

    const turtle = results.find(r => r.goal === 'turtle')!;
    expect(turtle.proved).toBe(true);

    const bird = results.find(r => r.goal === 'bird')!;
    expect(bird.proved).toBe(false);
  });

  test("marks reptile proved when reptile facts are present", () => {
    const chainer = makeAnimalChainer();
    const env = Environment.from({ cold_blooded: true, lays_eggs: true, has_scales: true });
    const results = chainer.proveAll(env);

    const reptile = results.find(r => r.goal === 'reptile')!;
    expect(reptile.proved).toBe(true);

    // Note: fish shares cold_blooded but is missing lives_in_water
    const fish = results.find(r => r.goal === 'fish')!;
    expect(fish.proved).toBe(false);
  });
});

// ── Multiple rules for the same conclusion (OR semantics) ─────────────────────

describe("BackwardChainer — multiple rules per conclusion", () => {
  test("proved when any one of the rules fires", () => {
    const chainer = new BackwardChainer();

    // A platypus can be classified as a mammal two ways
    chainer.addRule({
      name: 'mammal-fur',
      conclusion: 'mammal',
      conditions: ['has_fur == true', 'warm_blooded == true'],
    });
    chainer.addRule({
      name: 'mammal-egg-laying',
      conclusion: 'mammal',
      conditions: ['has_fur == true', 'lays_eggs == true'], // platypus!
    });

    const env = Environment.from({ has_fur: true, lays_eggs: true, warm_blooded: false });
    const result = chainer.prove('mammal', env);

    expect(result.proved).toBe(true);
    expect(result.rule).toBe('mammal-egg-laying');
    expect(result.candidates).toHaveLength(2);
  });

  test("candidates sorted by score: best rule first", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({ name: 'r-partial', conclusion: 'X', conditions: ['a == 1', 'b == 1'] });
    chainer.addRule({ name: 'r-full',    conclusion: 'X', conditions: ['a == 1'] });

    const env = Environment.from({ a: 1 }); // b unknown
    const result = chainer.prove('X', env);

    expect(result.candidates[0].rule).toBe('r-full');
    expect(result.candidates[0].score).toBe(1);
    expect(result.candidates[1].rule).toBe('r-partial');
    expect(result.candidates[1].score).toBe(0.5);
  });
});

// ── Rule management ───────────────────────────────────────────────────────────

describe("BackwardChainer — rule management", () => {
  test("conclusions() returns all distinct conclusion labels", () => {
    const chainer = makeAnimalChainer();
    const labels = chainer.conclusions().sort();
    expect(labels).toEqual(['bird', 'fish', 'mammal', 'reptile', 'turtle']);
  });

  test("removeRule() stops a rule from firing", () => {
    const chainer = makeAnimalChainer();
    const env = Environment.from({ has_shell: true, cold_blooded: true, lays_eggs: true });

    expect(chainer.prove('turtle', env).proved).toBe(true);
    chainer.removeRule('is-turtle');
    expect(chainer.prove('turtle', env).proved).toBe(false);
  });

  test("re-adding a rule with same name replaces it", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({ name: 'r', conclusion: 'X', conditions: ['a == 1'] });
    chainer.addRule({ name: 'r', conclusion: 'X', conditions: ['b == 1'] }); // replaces

    const env = Environment.from({ a: 1, b: 0 });
    const result = chainer.prove('X', env);
    // Only the new rule (b == 1) should exist
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].missing).toContain('b == 1');
  });

  test("addRule throws ParseError on syntactically invalid condition", () => {
    const chainer = new BackwardChainer();
    expect(() =>
      chainer.addRule({ name: 'bad', conclusion: 'X', conditions: ['(unclosed'] })
    ).toThrow(ParseError);
  });
});

// ── Expression power in conditions ───────────────────────────────────────────

describe("BackwardChainer — rich expression conditions", () => {
  test("conditions can use arithmetic and comparison", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({
      name:       'heavy-animal',
      conclusion: 'heavy',
      conditions: ['weight > 100', 'legs >= 4'],
    });

    const env = Environment.from({ weight: 150, legs: 4 });
    expect(chainer.prove('heavy', env).proved).toBe(true);
  });

  test("conditions can use 'in' operator for category checks", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({
      name:       'domestic-pet',
      conclusion: 'pet',
      conditions: ["species in ['cat', 'dog', 'rabbit']", 'is_domesticated == true'],
    });

    const env = Environment.from({ species: 'cat', is_domesticated: true });
    expect(chainer.prove('pet', env).proved).toBe(true);

    const wildEnv = Environment.from({ species: 'wolf', is_domesticated: false });
    expect(chainer.prove('pet', wildEnv).proved).toBe(false);
  });

  test("conditions with 'and'/'or' logic inside a single condition", () => {
    const chainer = new BackwardChainer();
    chainer.addRule({
      name:       'aquatic',
      conclusion: 'aquatic',
      conditions: ['lives_in_water == true or can_swim == true'],
    });

    expect(chainer.prove('aquatic', Environment.from({ lives_in_water: true })).proved).toBe(true);
    expect(chainer.prove('aquatic', Environment.from({ can_swim: true })).proved).toBe(true);
    expect(chainer.prove('aquatic', Environment.from({ has_fur: true })).proved).toBe(false);
  });
});
