import type { ASTNodeVisitor } from './ASTNodeVisitor';
import type {
  ArrayLiteral, ASTNode, AssignmentExpression, BinaryExpression, BooleanNode,
  CallExpression, GroupExpression, Identifier, IndexExpression, LogicalExpression,
  MemberExpression, NumberNode, StringNode, UnaryExpression,
} from './ASTNode';

export class ASTtoJSON implements ASTNodeVisitor {

  visitArrayLiteral(node: ArrayLiteral): unknown {
    return { type: "ArrayLiteral", elements: node.elements.map(e => e.accept(this)) };
  }

  visitAssignmentExpression(node: AssignmentExpression): unknown {
    return { type: "AssignmentExpression", left: node.left.accept(this), right: node.right.accept(this) };
  }

  visitBinaryExpression(node: BinaryExpression): unknown {
    return { type: "BinaryExpression", left: node.left.accept(this), operator: node.operator, right: node.right.accept(this) };
  }

  visitBooleanNode(node: BooleanNode): unknown {
    return { type: "Boolean", value: node.value };
  }

  visitCallExpression(node: CallExpression): unknown {
    return { type: "CallExpression", callee: node.callee.name, args: node.args.map(a => a.accept(this)) };
  }

  visitGroupExpression(node: GroupExpression): unknown {
    return { type: "GroupExpression", expression: node.expression.accept(this) };
  }

  visitIdentifier(node: Identifier): unknown {
    return { type: "Identifier", name: node.name };
  }

  visitIndexExpression(node: IndexExpression): unknown {
    return { type: "IndexExpression", object: node.object.accept(this), index: node.index.accept(this) };
  }

  visitLogicalExpression(node: LogicalExpression): unknown {
    return { type: "LogicalExpression", operator: node.operator, left: node.left.accept(this), right: node.right.accept(this) };
  }

  visitMemberExpression(node: MemberExpression): unknown {
    return { type: "MemberExpression", object: node.object.accept(this), property: node.property.accept(this) };
  }

  visitNumberNode(node: NumberNode): unknown {
    return { type: "Number", value: node.value };
  }

  visitStringNode(node: StringNode): unknown {
    return { type: "String", value: node.value };
  }

  visitUnaryExpression(node: UnaryExpression): unknown {
    return { type: "UnaryExpression", operator: node.operator, operand: node.operand.accept(this) };
  }

  static toJson(node: ASTNode): unknown {
    return node.accept(new ASTtoJSON());
  }
}
