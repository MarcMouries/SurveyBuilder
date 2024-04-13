import type { ASTNodeVisitor } from './ast/ASTNodeVisitor';
import {
  type ASTNode, AssignmentExpression, BinaryExpression, BooleanNode, GroupExpression, Identifier,
  LogicalExpression, NumberNode, StringNode, UnaryExpression, MemberExpression, ArrayLiteral} from "./ast/ASTNode";
import { Environment } from './Environment';
import { Token } from "./Token";

export class Interpreter implements ASTNodeVisitor {
  private environment: Environment;

  constructor(environment?: Environment) {
    this.environment = environment ? environment : new Environment();
  }


  /**
   * Extracts unique identifiers from an AST.
   * @param {ASTNode} node - The root node of the AST.
   * @returns {string[]} An array of unique identifier names.
   */
  public static extractIdentifiers(node: ASTNode): string[] {
    const identifiers = new Set<string>();

    const traverse = (node: ASTNode | null) => {
        if (!node) return;

        if (node instanceof Identifier) {
            identifiers.add(node.name);
        } else if (node instanceof BinaryExpression || node instanceof LogicalExpression || node instanceof AssignmentExpression) {
            traverse(node.left);
            traverse(node.right);
        } else if (node instanceof MemberExpression) {
            traverse(node.object);
        } else if (node instanceof GroupExpression) {
            // GroupExpression handling to traverse nested expressions
            traverse(node.expression);
        }
        // Check and traverse ArrayLiteral if needed
        else if (node instanceof ArrayLiteral) {
            node.elements.forEach(element => traverse(element));
        }
    };

    traverse(node);
    return Array.from(identifiers);
}


  visitArrayLiteral(node: ArrayLiteral): any[] {
    return node.elements.map(element => this.evaluate(element));
  }

  visitAssignmentExpression(expr: AssignmentExpression): any {
    const value = this.evaluate(expr.right);

    // Handling of simple identifier assignments, e.g., "x = 5"
    if (expr.left instanceof Identifier) {
      this.environment.set(expr.left.name, value);
      return value;
    }

    // Handling assignments to a property of an object, e.g., "person.age = 20"
    if (expr.left instanceof MemberExpression) {
      const objectExpr = expr.left.object;
      const propertyExpr = expr.left.property;

      if (!(propertyExpr instanceof Identifier)) {
        throw new Error("Only simple identifiers are supported for property names in assignments.");
      }

      // Assuming the object is stored in the environment by its identifier
      if (objectExpr instanceof Identifier) {
        const objectName = objectExpr.name;
        const object = this.environment.get(objectName);
        if (object && typeof object === 'object') {
          object[propertyExpr.name] = value;
          this.environment.set(objectName, object);
          return value;
        } else {
          throw new Error(`Object '${objectName}' not found or not an object`);
        }
      }
    }
  }



  visitMemberExpression(expr: MemberExpression): any {
    const object = this.evaluate(expr.object);

    // Assuming the property is an Identifier and not a more complex expression
    if (!(expr.property instanceof Identifier)) {
      throw new Error("Only simple identifiers are supported for property names.");
    }

    // Access the property value
    const propertyName = expr.property.name;
    if (object && typeof object === 'object' && propertyName in object) {
      return object[propertyName];
    }

    throw new Error(`Property '${propertyName}' not found`);
  }


  interpret(expression: ASTNode): any {
    const value = this.evaluate(expression)
    return value;
  }

  private evaluate(expression: ASTNode): any {
    return expression.accept(this)
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
      case "contains":
        if (!Array.isArray(leftVal)) {
          throw new Error("Operator 'contains' requires an array on the left side");
        }
        return leftVal.includes(rightVal);
      case "in":
        if (!Array.isArray(rightVal)) {
          throw new Error("Operator 'in' requires an array on the right side");
        }
        return rightVal.includes(leftVal);
      default:
        throw new Error(`Unsupported operator '${expr.operator}'`);
    }
  }
  visitBooleanNode(node: BooleanNode): boolean {
    return node.value
  }

  visitGroupExpression(expr: GroupExpression): void {
    return this.evaluate(expr.expression);
  }

  visitLogicalExpression(expr: LogicalExpression): boolean {
    const left = this.evaluate(expr.left);
    if (expr.operator === Token.OR) {
      if (left === true)
        return true;
    } else if (expr.operator === Token.AND) {
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
    if (expr.operator == "!") return !right;
  }

  visitIdentifier(node: Identifier): any {
    return this.environment.get(node.name);
  }
}