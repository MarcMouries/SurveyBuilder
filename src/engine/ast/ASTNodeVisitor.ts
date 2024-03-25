import type {
  AssignmentExpression, BinaryExpression, BooleanNode, GroupingExpression,Identifier,
  LogicalExpression, MemberExpression, NumberNode, StringNode, UnaryExpression 
} from "./ASTNode";

export interface ASTNodeVisitor {
  visitMemberExpression(node: MemberExpression): void;
  visitAssignmentExpression(node: AssignmentExpression): void;
  visitBinaryExpression(node: BinaryExpression): void;
  visitBooleanNode(node: BooleanNode): void;
  visitGroupingExpression(node: GroupingExpression): void;
  visitIdentifier(node: Identifier): void;
  visitLogicalExpression(node: LogicalExpression): void;
  visitNumberNode(node: NumberNode): void;
  visitStringNode(node: StringNode): void;
  visitUnaryExpression(node: UnaryExpression): void;
}