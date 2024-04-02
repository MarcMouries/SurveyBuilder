import type { ASTNodeVisitor } from './ASTNodeVisitor';
import type { ArrayLiteral, ASTNode, AssignmentExpression, BinaryExpression, BooleanNode, 
    GroupingExpression, LogicalExpression, MemberExpression, NumberNode, StringNode, 
    UnaryExpression, Identifier} from "./ASTNode";

export class ASTtoString implements ASTNodeVisitor {
  
  visitArrayLiteral(node: ArrayLiteral): string {
    const elementsAsString = node.elements.map(element => element.accept(this)).join(", ");
    return `[${elementsAsString}]`;
  }

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
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    return `(${left} ${node.operator} ${right})`;
  }

  visitBooleanNode(node: BooleanNode): boolean {
    return node.value;
  }

  visitGroupingExpression(node: GroupingExpression): string {
    return `${node.expression.accept(this)}`;
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
  visitIdentifier(node: Identifier): string {
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