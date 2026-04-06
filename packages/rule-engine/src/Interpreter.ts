import type { ASTNodeVisitor } from './ast/ASTNodeVisitor';
import {
  type ASTNode, AssignmentExpression, ArrayLiteral, BinaryExpression, BooleanNode,
  CallExpression, GroupExpression, Identifier, IndexExpression, LogicalExpression,
  MemberExpression, NumberNode, StringNode, UnaryExpression,
} from './ast/ASTNode';
import { Environment } from './Environment';
import { Token } from './Token';
import { EvalError, UndefinedVarError } from './errors';

export class Interpreter implements ASTNodeVisitor {
  private environment: Environment;
  private functions = new Map<string, (...args: unknown[]) => unknown>();

  constructor(environment?: Environment) {
    this.environment = environment ?? new Environment();
    this.registerBuiltins();
  }

  private registerBuiltins(): void {
    this.functions.set('abs',   (x) => Math.abs(x as number));
    this.functions.set('log2',  (x) => Math.log2(x as number));
    this.functions.set('min',   (x, y) => Math.min(x as number, y as number));
    this.functions.set('max',   (x, y) => Math.max(x as number, y as number));
    this.functions.set('round', (x) => Math.round(x as number));
    this.functions.set('floor', (x) => Math.floor(x as number));
    this.functions.set('ceil',  (x) => Math.ceil(x as number));
  }

  /**
   * Register a domain-specific function by name.
   * Registered functions are callable in expressions as: name(arg1, arg2, …)
   */
  registerFunction(name: string, fn: (...args: unknown[]) => unknown): void {
    this.functions.set(name, fn);
  }

  /**
   * Extracts unique identifiers (variable references) from an AST.
   */
  static extractIdentifiers(node: ASTNode): string[] {
    const identifiers = new Set<string>();

    const traverse = (n: ASTNode | null): void => {
      if (!n) return;
      if (n instanceof Identifier) {
        identifiers.add(n.name);
      } else if (n instanceof BinaryExpression || n instanceof LogicalExpression || n instanceof AssignmentExpression) {
        traverse(n.left);
        traverse(n.right);
      } else if (n instanceof MemberExpression) {
        traverse(n.object);
      } else if (n instanceof GroupExpression) {
        traverse(n.expression);
      } else if (n instanceof ArrayLiteral) {
        n.elements.forEach(e => traverse(e));
      } else if (n instanceof CallExpression) {
        n.args.forEach(a => traverse(a));
      } else if (n instanceof IndexExpression) {
        traverse(n.object);
        traverse(n.index);
      } else if (n instanceof UnaryExpression) {
        traverse(n.operand);
      }
    };

    traverse(node);
    return Array.from(identifiers);
  }

  interpret(expression: ASTNode): unknown {
    return this.evaluate(expression);
  }

  private evaluate(expression: ASTNode): unknown {
    return expression.accept(this);
  }

  visitArrayLiteral(node: ArrayLiteral): unknown[] {
    return node.elements.map(e => this.evaluate(e));
  }

  visitAssignmentExpression(expr: AssignmentExpression): unknown {
    const value = this.evaluate(expr.right);
    if (expr.left instanceof Identifier) {
      this.environment.set(expr.left.name, value);
      return value;
    }
    if (expr.left instanceof MemberExpression) {
      const objExpr = expr.left.object;
      const propExpr = expr.left.property;
      if (!(propExpr instanceof Identifier)) {
        throw new EvalError("Only simple identifiers are supported for property names in assignments.");
      }
      if (objExpr instanceof Identifier) {
        const obj = this.environment.get(objExpr.name);
        if (obj && typeof obj === 'object') {
          (obj as Record<string, unknown>)[propExpr.name] = value;
          this.environment.set(objExpr.name, obj);
          return value;
        }
        throw new EvalError(`Object '${objExpr.name}' not found or not an object`);
      }
    }
    throw new EvalError("Invalid assignment target.");
  }

  visitBinaryExpression(expr: BinaryExpression): unknown {
    const l = this.evaluate(expr.left);
    const r = this.evaluate(expr.right);
    switch (expr.operator) {
      case "+":  return (l as number) + (r as number);
      case "-":  return (l as number) - (r as number);
      case "*":  return (l as number) * (r as number);
      case "/":
        if (r === 0) throw new EvalError("Division by zero");
        return (l as number) / (r as number);
      case ">":  return (l as number) > (r as number);
      case "<":  return (l as number) < (r as number);
      case ">=": return (l as number) >= (r as number);
      case "<=": return (l as number) <= (r as number);
      // eslint-disable-next-line eqeqeq
      case "==": return l == r;
      // eslint-disable-next-line eqeqeq
      case "!=": return l != r;
      case "^":  return Math.pow(l as number, r as number);
      case "contains":
        if (!Array.isArray(l)) throw new EvalError("Operator 'contains' requires an array on the left side");
        return l.includes(r);
      case "in":
        if (!Array.isArray(r)) throw new EvalError("Operator 'in' requires an array on the right side");
        return r.includes(l);
      default:
        throw new EvalError(`Unsupported operator '${expr.operator}'`);
    }
  }

  visitBooleanNode(node: BooleanNode): boolean { return node.value; }

  visitCallExpression(expr: CallExpression): unknown {
    const fn = this.functions.get(expr.callee.name);
    if (!fn) throw new EvalError(`Unknown function '${expr.callee.name}'`);
    const args = expr.args.map(a => this.evaluate(a));
    return fn(...args);
  }

  visitIndexExpression(expr: IndexExpression): unknown {
    const obj = this.evaluate(expr.object);
    const idx = this.evaluate(expr.index);
    if (!Array.isArray(obj)) {
      throw new EvalError(`Index operator '[]' requires an array, got ${typeof obj}`);
    }
    const i = idx as number;
    if (!Number.isInteger(i) || i < 0 || i >= obj.length) {
      throw new EvalError(`Array index ${i} out of bounds (length ${obj.length})`);
    }
    return obj[i];
  }

  visitGroupExpression(expr: GroupExpression): unknown {
    return this.evaluate(expr.expression);
  }

  visitIdentifier(node: Identifier): unknown {
    return this.environment.get(node.name);
  }

  visitLogicalExpression(expr: LogicalExpression): boolean {
    if (expr.operator === Token.OR) {
      // Try left. If it throws (e.g. undefined variable), still try right —
      // `<error> OR true` should be true, matching SQL three-valued logic.
      let leftVal: unknown;
      let leftErr: unknown = null;
      try { leftVal = this.evaluate(expr.left); } catch (e) { leftErr = e; }
      if (leftVal === true) return true;

      const rightVal = this.evaluate(expr.right); // let right errors propagate
      if (rightVal === true) return true;
      if (leftErr) throw leftErr;  // right was falsy and left had errored
      return false;
    }

    if (expr.operator === Token.AND) {
      // `false AND <anything>` short-circuits to false.
      // `<error> AND false` should be false; `<error> AND true` re-throws.
      let leftVal: unknown;
      let leftErr: unknown = null;
      try { leftVal = this.evaluate(expr.left); } catch (e) { leftErr = e; }
      if (leftVal === false) return false;

      const rightVal = this.evaluate(expr.right); // let right errors propagate
      if (leftErr) {
        if (rightVal === false) return false; // false wins
        throw leftErr;
      }
      return rightVal as boolean;
    }

    // Fallback (should not be reached with current token set)
    const left = this.evaluate(expr.left);
    return this.evaluate(expr.right) as boolean;
  }

  visitMemberExpression(expr: MemberExpression): unknown {
    const obj = this.evaluate(expr.object);
    if (!(expr.property instanceof Identifier)) {
      throw new EvalError("Only simple identifiers are supported for property names.");
    }
    const prop = expr.property.name;
    if (obj && typeof obj === 'object' && prop in (obj as object)) {
      return (obj as Record<string, unknown>)[prop];
    }
    throw new EvalError(`Property '${prop}' not found`);
  }

  visitNumberNode(node: NumberNode): number { return node.value; }
  visitStringNode(node: StringNode): string { return node.value; }

  visitUnaryExpression(expr: UnaryExpression): unknown {
    const right = this.evaluate(expr.operand);
    if (expr.operator === "-") return -(right as number);
    if (expr.operator === "!") return !right;
    throw new EvalError(`Unsupported unary operator '${expr.operator}'`);
  }
}
