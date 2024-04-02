import type {
  ArrayLiteral,
  AssignmentExpression, BinaryExpression, BooleanNode, GroupingExpression,Identifier,
  LogicalExpression, MemberExpression, NumberNode, StringNode, UnaryExpression 
} from "./ASTNode";

export interface ASTNodeVisitor {
  visitArrayLiteral(node: ArrayLiteral): void;
  visitAssignmentExpression(node: AssignmentExpression): void;
  visitBinaryExpression(node: BinaryExpression): void;
  visitBooleanNode(node: BooleanNode): void;
  visitGroupingExpression(node: GroupingExpression): void;
  visitIdentifier(node: Identifier): void;
  visitLogicalExpression(node: LogicalExpression): void;
  visitMemberExpression(node: MemberExpression): void;
  visitNumberNode(node: NumberNode): void;
  visitStringNode(node: StringNode): void;
  visitUnaryExpression(node: UnaryExpression): void;
}