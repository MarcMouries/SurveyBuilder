import type { ASTNodeVisitor } from './ast/ASTNodeVisitor';
import {
  type ASTNode, AssignmentExpression, BinaryExpression, BooleanNode, GroupingExpression,
  Identifier, LogicalExpression, NumberNode, StringNode, UnaryExpression, MemberExpression
} from "./ast/ASTNode";
import { Environment } from './Environment';
import { TokenType } from "./Token";

export class Interpreter implements ASTNodeVisitor {
  private environment: Environment;

  constructor(environment?: Environment) {
    this.environment = environment ? environment : new Environment();
  }

  visitMemberExpression(expr: MemberExpression): void {
    throw new Error('Method not implemented.');
  }

  interpret(expression: ASTNode): any {
    const value = this.evaluate(expression)
    return value;
  }

  private evaluate(expression: ASTNode): any {
    return expression.accept(this)
  }

  visitAssignmentExpression(expr: AssignmentExpression): void {
    const value = this.evaluate(expr.right);
    //console.log(node.left);
    //console.log(value);
    // this.environment.set()
    //const val = this.value.evaluate(context);
    //context[this.variable.name] = val;


    throw new Error('Method not implemented.');
  }
  visitBinaryExpression(expr: BinaryExpression): any {
    const leftVal = this.evaluate(expr.left);
    const rightVal = this.evaluate(expr.right);
    switch (expr.operator) {
      case "+":
        return leftVal + rightVal;
      case "-":
        return leftVal - rightVal;
      case "*":
        return leftVal * rightVal;
      case "/":
        if (rightVal === 0) throw new Error("Division by zero");
        return leftVal / rightVal;
      case ">":
        return leftVal > rightVal;
      case "<":
        return leftVal < rightVal;
      case ">=":
        return leftVal >= rightVal;
      case "<=":
        return leftVal <= rightVal;
      case "==":
        return leftVal == rightVal;
      case "^":
        return Math.pow(leftVal, rightVal);
      default:
        throw new Error(`Unsupported operator ${expr.operator}`);
    }
  }
  visitBooleanNode(node: BooleanNode): boolean {
    return node.value
  }

  visitGroupingExpression(expr: GroupingExpression): void {
    return this.evaluate(expr.expression);
  }

  visitLogicalExpression(expr: LogicalExpression): boolean {
    const left = this.evaluate(expr.left);
    if (expr.operator === TokenType.OR) {
      if (left === true)
       return true; 
    } else if (expr.operator === TokenType.AND) {
      if (left === false) 
        return false;
    }
    return this.evaluate(expr.right);
  }

  visitNumberNode(node: NumberNode): any {
    return node.value
  }
  visitStringNode(node: StringNode): any {
    return node.value
  }

  visitUnaryExpression(expr: UnaryExpression): any {
    const right = this.evaluate(expr.operand)
    if (expr.operator == "-") return - right;
    if (expr.operator == "!") return ! right;
  }

  visitIdentifier(node: Identifier): any {
    return this.environment.get(node.name);
  }
}