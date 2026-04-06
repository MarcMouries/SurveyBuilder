import { Parser } from './Parser';
import { Interpreter } from './Interpreter';
import { Environment } from './Environment';
import type { ASTNode } from './ast/ASTNode';

export interface Rule<TContext = Record<string, unknown>> {
  /** Unique name for this rule (used for removal and trace output). */
  name: string;
  /** Higher priority rules execute first. Default: 0. */
  priority: number;
  /** Boolean expression string evaluated against the environment. */
  condition: string;
  /** Called when the condition is true. May mutate context or environment. */
  action: (ctx: TContext, env: Environment) => void;
  /** Human-readable description (for debugging/trace output). */
  description?: string;
}

export interface TraceEntry {
  name: string;
  priority: number;
  fired: boolean;
  error?: string;
}

export interface SerializedRule {
  name: string;
  priority: number;
  condition: string;
  description?: string;
}

export class RuleEngine<TContext = Record<string, unknown>> {
  private rules: Rule<TContext>[] = [];
  private compiledConditions = new Map<string, ASTNode>();
  private parser: Parser;
  private interpreter: Interpreter;
  private environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
    this.parser = new Parser();
    this.interpreter = new Interpreter(environment);
  }

  /** Expose the interpreter so callers can register domain functions. */
  get interp(): Interpreter {
    return this.interpreter;
  }

  /**
   * Register a rule. Rules are evaluated in descending priority order.
   * Throws ParseError immediately if the condition string is invalid.
   */
  addRule(rule: Rule<TContext>): void {
    const compiled = this.parser.parse(rule.condition);
    this.compiledConditions.set(rule.name, compiled);
    // Remove existing rule with same name, then insert
    this.rules = this.rules.filter(r => r.name !== rule.name);
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /** Remove a rule by name. No-op if not found. */
  removeRule(name: string): void {
    this.rules = this.rules.filter(r => r.name !== name);
    this.compiledConditions.delete(name);
  }

  /**
   * Evaluate all rules against the current environment state.
   * For each rule whose condition is true, the action is called with (context, env).
   * Returns the names of rules that fired, in execution order.
   */
  evaluate(context: TContext): string[] {
    const fired: string[] = [];
    for (const rule of this.rules) {
      const compiled = this.compiledConditions.get(rule.name)!;
      const result = this.interpreter.interpret(compiled);
      if (result === true) {
        rule.action(context, this.environment);
        fired.push(rule.name);
      }
    }
    return fired;
  }

  /**
   * Like evaluate(), but returns a full trace for debugging.
   * Conditions that throw are caught and reported as errors rather than crashing.
   */
  evaluateWithTrace(context: TContext): TraceEntry[] {
    return this.rules.map(rule => {
      const compiled = this.compiledConditions.get(rule.name)!;
      try {
        const result = this.interpreter.interpret(compiled);
        const fired = result === true;
        if (fired) rule.action(context, this.environment);
        return { name: rule.name, priority: rule.priority, fired };
      } catch (err) {
        return { name: rule.name, priority: rule.priority, fired: false, error: (err as Error).message };
      }
    });
  }

  /** Serialize all rules to JSON-safe objects (actions are omitted). */
  toJSON(): SerializedRule[] {
    return this.rules.map(({ name, priority, condition, description }) => ({
      name, priority, condition, ...(description ? { description } : {}),
    }));
  }

  /**
   * Reconstruct a RuleEngine from serialized rules + an action map.
   * actionMap keys must match rule names.
   */
  static fromJSON<TContext = Record<string, unknown>>(
    serialized: SerializedRule[],
    actionMap: Record<string, (ctx: TContext, env: Environment) => void>,
    environment: Environment,
  ): RuleEngine<TContext> {
    const engine = new RuleEngine<TContext>(environment);
    for (const s of serialized) {
      const action = actionMap[s.name];
      if (!action) throw new Error(`No action registered for rule '${s.name}'`);
      engine.addRule({ ...s, action });
    }
    return engine;
  }
}
