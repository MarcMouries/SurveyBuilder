import type {
  ArrayLiteral, AssignmentExpression, BinaryExpression, BooleanNode,
  CallExpression, GroupExpression, Identifier, IndexExpression, LogicalExpression,
  MemberExpression, NumberNode, StringNode, UnaryExpression,
} from './ASTNode';

export interface ASTNodeVisitor {
  visitArrayLiteral(node: ArrayLiteral): unknown;
  visitAssignmentExpression(node: AssignmentExpression): unknown;
  visitBinaryExpression(node: BinaryExpression): unknown;
  visitBooleanNode(node: BooleanNode): unknown;
  visitCallExpression(node: CallExpression): unknown;
  visitGroupExpression(node: GroupExpression): unknown;
  visitIdentifier(node: Identifier): unknown;
  visitIndexExpression(node: IndexExpression): unknown;
  visitLogicalExpression(node: LogicalExpression): unknown;
  visitMemberExpression(node: MemberExpression): unknown;
  visitNumberNode(node: NumberNode): unknown;
  visitStringNode(node: StringNode): unknown;
  visitUnaryExpression(node: UnaryExpression): unknown;
}
