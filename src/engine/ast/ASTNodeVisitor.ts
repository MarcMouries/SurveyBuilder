import type {
  ArrayLiteral,
  AssignmentExpression, BinaryExpression, BooleanNode, GroupExpression,Identifier,
  LogicalExpression, MemberExpression, NumberNode, StringNode, UnaryExpression 
} from "./ASTNode";

export interface ASTNodeVisitor {
  visitArrayLiteral(node: ArrayLiteral): void;
  visitAssignmentExpression(node: AssignmentExpression): void;
  visitBinaryExpression(node: BinaryExpression): void;
  visitBooleanNode(node: BooleanNode): void;
  visitGroupExpression(node: GroupExpression): void;
  visitIdentifier(node: Identifier): void;
  visitLogicalExpression(node: LogicalExpression): void;
  visitMemberExpression(node: MemberExpression): void;
  visitNumberNode(node: NumberNode): void;
  visitStringNode(node: StringNode): void;
  visitUnaryExpression(node: UnaryExpression): void;
}