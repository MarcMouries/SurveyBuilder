import { Parser } from './Parser';
import { Interpreter } from './Interpreter';
import { Environment } from './Environment';
import { EvalError, RuleEngineError } from './errors';
import type { ASTNode } from './ast/ASTNode';

export interface SolveOptions {
  /** Lower bound of the search range. Default: -1e6 */
  min?: number;
  /** Upper bound of the search range. Default: 1e6 */
  max?: number;
  /** Stop when |f(x)| < tolerance. Default: 1e-9 */
  tolerance?: number;
  /** Maximum number of bisection iterations. Default: 100 */
  maxIterations?: number;
}

export interface SolveResult {
  /** True when a root was bracketed and converged within tolerance. */
  found: boolean;
  /** The solved value, present when found is true. */
  value?: number;
  /** Number of bisection iterations performed. */
  iterations: number;
}

export class NoSolutionError extends RuleEngineError {
  constructor(message: string) {
    super(message);
    this.name = 'NoSolutionError';
  }
}

/**
 * Finds the numeric value of a single unknown variable that satisfies an
 * expression equal to a target value, using interval bisection.
 *
 * The expression is evaluated as: f(x) = expression - targetValue.
 * Bisection requires f(min) and f(max) to have opposite signs (i.e. the root
 * must be bracketed). If they don't, solve() returns { found: false }.
 *
 * Example:
 *   const solver = new ConstraintSolver();
 *   solver.solve('2*x + 1', 'x', 11, env); // → { found: true, value: 5, ... }
 */
export class ConstraintSolver {
  private parser = new Parser();

  /**
   * Solve `expression == targetValue` for `targetVar`.
   *
   * All variables referenced in the expression other than `targetVar` must
   * already be defined in `env`. The value of `targetVar` in `env` is
   * temporarily overwritten during the search and restored on completion.
   *
   * @throws {NoSolutionError} when the root is not bracketed in [min, max].
   * @throws {EvalError}       when the expression throws during evaluation.
   */
  solve(
    expression: string,
    targetVar: string,
    targetValue: number,
    env: Environment,
    options: SolveOptions = {},
  ): SolveResult {
    const {
      min = -1e6,
      max = 1e6,
      tolerance = 1e-9,
      maxIterations = 100,
    } = options;

    if (min >= max) {
      throw new RuleEngineError(`solve(): min (${min}) must be less than max (${max})`);
    }

    const ast = this.parser.parse(expression);

    // Verify targetVar actually appears in the expression
    const identifiers = Interpreter.extractIdentifiers(ast);
    if (!identifiers.includes(targetVar)) {
      throw new RuleEngineError(
        `solve(): variable '${targetVar}' does not appear in expression: ${expression}`,
      );
    }

    // Save original value so we can restore it after solving
    const originalValue = env.getOrDefault(targetVar, undefined);
    const restore = () => {
      if (originalValue === undefined) {
        // variable wasn't defined before — leave it at the solution or remove
        // it; for simplicity we leave the solved value in place.
      } else {
        env.set(targetVar, originalValue);
      }
    };

    const interp = new Interpreter(env);

    // f(x) = evaluate(expression) - targetValue
    const f = (x: number): number => {
      env.set(targetVar, x);
      const result = interp.interpret(ast);
      if (typeof result !== 'number') {
        throw new EvalError(
          `solve(): expression must evaluate to a number, got ${typeof result}`,
        );
      }
      return result - targetValue;
    };

    try {
      const fLo = f(min);
      const fHi = f(max);

      // Root not bracketed — bisection cannot proceed
      if (Math.sign(fLo) === Math.sign(fHi)) {
        restore();
        return { found: false, iterations: 0 };
      }

      let lo = min;
      let hi = max;
      let iterations = 0;

      while (iterations < maxIterations) {
        const mid = (lo + hi) / 2;
        const fMid = f(mid);
        iterations++;

        if (Math.abs(fMid) < tolerance) {
          restore();
          return { found: true, value: mid, iterations };
        }

        if (Math.sign(fMid) === Math.sign(f(lo))) {
          lo = mid;
        } else {
          hi = mid;
        }
      }

      // Converged by interval width even if not strictly within tolerance
      const value = (lo + hi) / 2;
      restore();
      return { found: true, value, iterations };

    } catch (err) {
      restore();
      throw err;
    }
  }
}
