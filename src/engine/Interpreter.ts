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

  visitMemberExpression(node: MemberExpression): void {
    throw new Error('Method not implemented.');
  }

  interpret(expression: ASTNode): any {
    const value = this.evaluate(expression)
    return value;
  }

  private evaluate(expression: ASTNode): any {
    return expression.accept(this)
  }

  visitAssignmentExpression(node: AssignmentExpression): void {
    const value = this.evaluate(node.right);
    //console.log(node.left);
    //console.log(value);
    // this.environment.set()
    //const val = this.value.evaluate(context);
    //context[this.variable.name] = val;


    throw new Error('Method not implemented.');
  }
  visitBinaryExpression(node: BinaryExpression): any {
    const leftVal = this.evaluate(node.left);
    const rightVal = this.evaluate(node.right);
    switch (node.operator) {
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
        throw new Error(`Unsupported operator ${node.operator}`);
    }
  }
  visitBooleanNode(node: BooleanNode): boolean {
    return node.value
  }

  visitGroupingExpression(node: GroupingExpression): void {
    return this.evaluate(node.expression);
  }

  visitLogicalExpression(expr: LogicalExpression): boolean {
    const left = this.evaluate(expr.left);
    if (expr.operator === TokenType.OR) {
      if (left === true) return left;
    }
    else {

    }
    return this.evaluate(expr.right);
  }

  visitNumberNode(node: NumberNode): any {
    return node.value
  }
  visitStringNode(node: StringNode): any {
    return node.value
  }

  visitUnaryExpression(node: UnaryExpression): any {
    const right = this.evaluate(node.operand)
    if (node.operator == "-") return - right;
    if (node.operator == "!") return !right;
  }

  visitIdentifier(node: Identifier): any {
    console.log("visitIdentifier for : " + node.name);
    return this.environment.get(node.name);
  }

}