import type {
  AssignmentExpression, BinaryExpression, BooleanNode, GroupingExpression,
  LogicalExpression, MemberExpression, NumberNode, StringNode, UnaryExpression, VariableNode
} from "./ASTNode";

export interface ASTNodeVisitor {
  visitMemberExpression(node: MemberExpression): void;
  visitAssignmentExpression(node: AssignmentExpression): void;
  visitBinaryExpression(node: BinaryExpression): void;
  visitBooleanNode(node: BooleanNode): void;
  visitGroupingExpression(node: GroupingExpression): void;
  visitLogicalExpression(node: LogicalExpression): void;
  visitNumberNode(node: NumberNode): void;
  visitStringNode(node: StringNode): void;
  visitUnaryExpression(node: UnaryExpression): void;
  visitVariableNode(node: VariableNode): void;
}