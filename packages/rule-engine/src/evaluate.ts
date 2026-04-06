import { Parser } from './Parser';
import { Interpreter } from './Interpreter';
import { toEnvironment } from './utils';
import type { Facts } from './utils';

const parser = new Parser();

/**
 * Evaluate a single expression string against a set of facts.
 *
 * This is the simplest entry point — no classes to instantiate, no wiring.
 *
 * @example
 * ```ts
 * evaluate("age > 18", { age: 25 });             // true
 * evaluate("name == 'Alice'", { name: 'Alice' }); // true
 * evaluate("x * 2", { x: 5 });                   // 10
 * ```
 *
 * @param expression - Expression string using the rule engine expression language
 * @param facts      - Variables available to the expression (plain object or Environment)
 * @returns The result of the expression (boolean, number, string, array, …)
 */
export function evaluate(expression: string, facts: Facts = {}): unknown {
  const env = toEnvironment(facts);
  const interpreter = new Interpreter(env);
  return interpreter.interpret(parser.parse(expression));
}
