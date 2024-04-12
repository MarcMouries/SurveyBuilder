import type { ASTNodeVisitor } from './ASTNodeVisitor';

export interface ASTNode {
  accept(visitor: ASTNodeVisitor): void;
}

export class AssignmentExpression implements ASTNode {
  left: ASTNode;
  right: ASTNode;

  constructor(left: ASTNode, right: ASTNode) {
    this.left = left;
    this.right = right;
  }

  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitAssignmentExpression(this);
  }
}

export class ArrayLiteral implements ASTNode {
  elements: ASTNode[];

  constructor(elements: ASTNode[]) {
    this.elements = elements;
  }

  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitArrayLiteral(this);
  }
}

export class LogicalExpression implements ASTNode {
  left: ASTNode;
  operator: string;
  right: ASTNode;

  constructor(left: ASTNode, operator: string, right: ASTNode) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitLogicalExpression(this);
  }
}

export class Identifier implements ASTNode {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitIdentifier(this);
  }
}

export class NumberNode implements ASTNode {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitNumberNode(this);
  }
}

export class StringNode implements ASTNode {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitStringNode(this);
  }
}

export class BooleanNode implements ASTNode {
  value: boolean;
  constructor(value: boolean) {
    this.value = value;
  }
  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitBooleanNode(this);
  }
}

export class BinaryExpression implements ASTNode {
  left: ASTNode;
  operator: string;
  right: ASTNode;
  constructor(left: ASTNode, operator: string, right: ASTNode) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitBinaryExpression(this);
  }
}

export class GroupExpression implements ASTNode {
  expression: ASTNode;
  constructor(expression: ASTNode) {
    this.expression = expression;
  }
  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitGroupExpression(this);
  }
}

export class MemberExpression implements ASTNode {
  object: ASTNode; 
  property: Identifier;

  constructor(object: ASTNode, property: Identifier) {
    this.object = object;
    this.property = property;
  }

  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitMemberExpression(this);
  }
}


export class UnaryExpression implements ASTNode {
  operator: string;
  operand: ASTNode;
  constructor(operator: string, operand: ASTNode) {
    this.operator = operator;
    this.operand = operand;
  }
  accept(visitor: ASTNodeVisitor): void {
    return visitor.visitUnaryExpression(this);
  }
}