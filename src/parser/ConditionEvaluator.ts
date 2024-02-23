import type { BinaryExpressionNode, CompoundExpression, Condition, Data } from "./ConditionInterfaces";
import type { IdentifierNode, LiteralNode, Node } from "./ConditionInterfaces";
import { NodeType } from "./ConditionInterfaces";

export class ConditionEvaluator {
  static evaluate(node: Node, data: Data): boolean {
    switch (node.type) {
      case NodeType.IDENTIFIER:
        return this.resolveIdentifierValue(node as IdentifierNode, data);

      case NodeType.LITERAL:
        return this.evaluateLiteral(node as LiteralNode);

      case NodeType.BINARY_EXP:
        const binaryNode = node as BinaryExpressionNode;
        const leftValue = this.evaluate(binaryNode.left, data);
        const rightValue = this.evaluate(binaryNode.right, data);
        return this.applyOperator(binaryNode.operator, leftValue, rightValue);

      case NodeType.COMPOUND:
        return this.evaluateCompoundExpression(node as CompoundExpression, data);

      case NodeType.CONDITION:
        const conditionNode = node as Condition;
        const leftEval = this.evaluate(conditionNode.left, data);
        const rightEval = this.evaluate(conditionNode.right, data);
        return this.applyOperator(conditionNode.operator, leftEval, rightEval);

      default:
        console.error("Unrecognized node type:", node.type);
        return false;
    }
  }

  private static resolveIdentifierValue(node: IdentifierNode, data: Data): any {
    const path = node.name.split('.');
    let currentValue = data;
    for (const part of path) {
      if (currentValue && part in currentValue) {
        currentValue = currentValue[part];
      } else {
        // If the path is not found, it could either mean the value is false or undefined
        console.error(`Path not found in data: ${node.name}`);
        return false; // or `undefined` depending on how you wish to handle non-existent paths
      }
    }
    return currentValue;
  }


  private static evaluateLiteral(node: LiteralNode): any {
    return node.value;
  }

  private static applyOperator(operator: string, left: any, right: any): boolean {
    switch (operator) {
      case "=": return left === right;
      case "!=": return left !== right;
      case "<": return left < right;
      case "<=": return left <= right;
      case ">": return left > right;
      case ">=": return left >= right;
      case "contains": return Array.isArray(left) && left.includes(right);
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }


  private static evaluateCompoundExpression(node: CompoundExpression, data: Data): boolean {
    if (node.operator === 'AND') {
      return node.conditions.every(cond => this.evaluate(cond, data));
    } else if (node.operator === 'OR') {
      return node.conditions.some(cond => this.evaluate(cond, data));
    } else {
      throw new Error(`Unsupported compound operator: ${node.operator}`);
    }
  }
}