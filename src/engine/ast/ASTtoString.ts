import type { ASTNodeVisitor } from './ASTNodeVisitor';
import type { ASTNode, AssignmentExpression, BinaryExpression, BooleanNode, GroupingExpression, LogicalExpression, MemberExpression }
  from "./ASTNode";
import type { NumberNode, StringNode, UnaryExpression, VariableNode } from "./ASTNode";

export class ASTtoString implements ASTNodeVisitor {

  visitMemberExpression(node: MemberExpression): string {
    const object= node.object.accept(this);
    const property = node.property.accept(this);
    return `${object}.${property}`;
  }

  visitAssignmentExpression(node: AssignmentExpression): string {
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    return `${left} = ${right}`;
  }

  visitBinaryExpression(node: BinaryExpression): string {
    return `(${node.left.accept(this)} ${node.operator} ${node.right.accept(this)})`;
  }

  visitBooleanNode(node: BooleanNode): boolean {
    return node.value;
  }

  visitGroupingExpression(node: GroupingExpression): string {
    return `(${node.expression.accept(this)})`;
  }

  visitLogicalExpression(node: LogicalExpression): string {
    const leftExpression = node.left.accept(this);
    const rightExpression = node.right.accept(this);
    return `${leftExpression} ${node.operator} ${rightExpression}`;
  }

  visitNumberNode(node: NumberNode): number {
    return node.value;
  }

  visitStringNode(node: StringNode): string {
    return `"${node.value}"`;
  }
  visitVariableNode(node: VariableNode): string {
    return node.name;
  }
  visitUnaryExpression(node: UnaryExpression): string {
    return `(${node.operator}${node.operand.accept(this)})`;
  }
  static toString(node: ASTNode) {
    const astToString = new ASTtoString();
    return node.accept(astToString);
  }
}