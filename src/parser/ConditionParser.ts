import type { ConditionalExpression } from "typescript";
import {
  type Node, type IdentifierNode, type LiteralNode, type BinaryExpressionNode,
  type CompoundExpression, type Condition, NodeType, type ConditionTree
} from "./ConditionInterfaces";

export class ConditionParser {
  static parse(condition: string): ConditionTree {
    // Normalize condition to identify logical operators
    const normalizedCondition = condition.replace(/\band\b/gi, 'AND').replace(/\bor\b/gi, 'OR');

    // Entry point for recursive parsing
    return this.parseLogicalOrSimpleCondition(normalizedCondition);
  }

  private static parseLogicalOrSimpleCondition(expression: string): Node {
    if (expression.includes('AND') || expression.includes('OR')) {
      const operatorType = expression.includes('AND') ? 'AND' : 'OR';
      const splitByType = expression.split(new RegExp(`\\b${operatorType}\\b`));
      return {
        type: NodeType.COMPOUND,
        operator: operatorType,
        conditions: splitByType.map(subExpr => this.parseLogicalOrSimpleCondition(subExpr.trim())).filter(Boolean) as Node[]
      } as CompoundExpression;
    } else {
      return this.parseSimpleExpression(expression);
    }
  }



  private static parseSimpleExpression(expression: string): Node {
    const operatorRegex = /(\w+(?:\.\w+)*)\s*(=|!=|<|<=|>|>=|contains)\s*(\d+|true|false|'[^']*'|"[^"]*")/;
    const match = expression.match(operatorRegex);

    if (match) {
      let [, leftMatch, operator, rightMatch] = match;
      //console.log(`parseSimpleCondition: Left Match: ${leftMatch}, Right Match: ${rightMatch}`);

      const leftNode = this.createIdentifierOrLiteral(leftMatch);
      const rightNode = this.createIdentifierOrLiteral(rightMatch);

      return {
        type: NodeType.CONDITION,
        left: leftNode,
        operator,
        right: rightNode
      } as Condition;;
    } else {
      // If the expression doesn't match the operator pattern, we treat it as a direct value or identifier
    // Directly return an IdentifierNode for expressions without operators
    return { type: NodeType.IDENTIFIER, name: expression } as IdentifierNode;
    }
  }

  private static createIdentifierOrLiteral(value: string): Node {
    //console.log(`createIdentifierOrLiteral: value: ${value}`);

    // Check for numeric literals
    if (/^\d+$/.test(value)) {
      return { type: NodeType.LITERAL, value: Number(value) } as LiteralNode;
    }
    // Check for boolean literals
    else if (value === 'true' || value === 'false') {
      return { type: NodeType.LITERAL, value: value === 'true' } as LiteralNode;
    }
    // Check for quoted strings
    else if (value.startsWith("'") && value.endsWith("'") || value.startsWith('"') && value.endsWith('"')) {
      // Remove the surrounding quotes
      const unquotedValue = value.slice(1, -1);
      return { type: NodeType.LITERAL, value: unquotedValue } as LiteralNode;
    }
    // Default case: treat as an identifier
    else {
      return { type: NodeType.IDENTIFIER, name: value } as IdentifierNode;
    }
  }






}
