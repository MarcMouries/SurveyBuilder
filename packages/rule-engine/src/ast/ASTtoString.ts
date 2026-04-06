import type { ASTNodeVisitor } from './ASTNodeVisitor';
import type {
  ArrayLiteral, ASTNode, AssignmentExpression, BinaryExpression, BooleanNode,
  CallExpression, GroupExpression, Identifier, IndexExpression, LogicalExpression,
  MemberExpression, NumberNode, StringNode, UnaryExpression,
} from './ASTNode';

export class ASTtoString implements ASTNodeVisitor {

  visitArrayLiteral(node: ArrayLiteral): string {
    return `[${node.elements.map(e => e.accept(this)).join(", ")}]`;
  }

  visitAssignmentExpression(node: AssignmentExpression): string {
    return `${node.left.accept(this)} = ${node.right.accept(this)}`;
  }

  visitBinaryExpression(node: BinaryExpression): string {
    return `(${node.left.accept(this)} ${node.operator} ${node.right.accept(this)})`;
  }

  visitBooleanNode(node: BooleanNode): unknown {
    return node.value;
  }

  visitCallExpression(node: CallExpression): string {
    const args = node.args.map(a => a.accept(this)).join(", ");
    return `${node.callee.name}(${args})`;
  }

  visitGroupExpression(node: GroupExpression): unknown {
    return node.expression.accept(this);
  }

  visitIdentifier(node: Identifier): string {
    return node.name;
  }

  visitIndexExpression(node: IndexExpression): string {
    return `${node.object.accept(this)}[${node.index.accept(this)}]`;
  }

  visitLogicalExpression(node: LogicalExpression): string {
    return `${node.left.accept(this)} ${node.operator} ${node.right.accept(this)}`;
  }

  visitMemberExpression(node: MemberExpression): string {
    return `${node.object.accept(this)}.${node.property.accept(this)}`;
  }

  visitNumberNode(node: NumberNode): unknown {
    return node.value;
  }

  visitStringNode(node: StringNode): string {
    return `"${node.value}"`;
  }

  visitUnaryExpression(node: UnaryExpression): string {
    return `(${node.operator}${node.operand.accept(this)})`;
  }

  static toString(node: ASTNode): unknown {
    return node.accept(new ASTtoString());
  }
}
