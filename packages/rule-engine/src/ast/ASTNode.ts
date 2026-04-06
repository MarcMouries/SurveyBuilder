import type { ASTNodeVisitor } from './ASTNodeVisitor';

export interface ASTNode {
  accept(visitor: ASTNodeVisitor): unknown;
}

export class AssignmentExpression implements ASTNode {
  left: ASTNode;
  right: ASTNode;
  constructor(left: ASTNode, right: ASTNode) {
    this.left = left;
    this.right = right;
  }
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitAssignmentExpression(this);
  }
}

export class ArrayLiteral implements ASTNode {
  elements: ASTNode[];
  constructor(elements: ASTNode[]) {
    this.elements = elements;
  }
  accept(visitor: ASTNodeVisitor): unknown {
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
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitLogicalExpression(this);
  }
}

export class Identifier implements ASTNode {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitIdentifier(this);
  }
}

export class NumberNode implements ASTNode {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitNumberNode(this);
  }
}

export class StringNode implements ASTNode {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitStringNode(this);
  }
}

export class BooleanNode implements ASTNode {
  value: boolean;
  constructor(value: boolean) {
    this.value = value;
  }
  accept(visitor: ASTNodeVisitor): unknown {
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
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitBinaryExpression(this);
  }
}

export class GroupExpression implements ASTNode {
  expression: ASTNode;
  constructor(expression: ASTNode) {
    this.expression = expression;
  }
  accept(visitor: ASTNodeVisitor): unknown {
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
  accept(visitor: ASTNodeVisitor): unknown {
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
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitUnaryExpression(this);
  }
}

/** Array index expression: object[index] */
export class IndexExpression implements ASTNode {
  object: ASTNode;
  index: ASTNode;
  constructor(object: ASTNode, index: ASTNode) {
    this.object = object;
    this.index = index;
  }
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitIndexExpression(this);
  }
}

/** Function call expression: callee(arg1, arg2, ...) */
export class CallExpression implements ASTNode {
  callee: Identifier;
  args: ASTNode[];
  constructor(callee: Identifier, args: ASTNode[]) {
    this.callee = callee;
    this.args = args;
  }
  accept(visitor: ASTNodeVisitor): unknown {
    return visitor.visitCallExpression(this);
  }
}
