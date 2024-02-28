export class ASTNode {
  constructor(value) {
    this.value = value;
  }
}

export class Operand extends ASTNode {}

export class Variable extends Operand {
  constructor(name) {
    super(name);
  }
  _summarize() {
    return `Variable(${this.value})`;
  }
  toJSON() {
    return { type: "Variable", name: this.value };
  }
}

export class Constant extends Operand {
  constructor(value) {
    super(value);
  }
  toJSON() {
    return { type: "Number", value: this.value };
  }
}
export class NumberNode extends Constant {
  constructor(value) {
    super(value);
  }
  summarize() {
    return `Number(${this.value})`;
  }
  toJSON() {
    return { type: "Number", value: this.value };
  }
}
export class StringNode extends Constant {
  constructor(value) {
    super(value);
  }
  summarize() {
    return `String(${this.value})`;
  }
  toJSON() {
    return { type: "String", value: this.value };
  }
}
export class BooleanNode extends Constant {
  constructor(value) {
    super(value);
  }
  summarize() {
    return `Boolean(${this.value})`;
  }
  toJSON() {
    return { type: "Boolean", value: this.value };
  }
}

export class BinaryOperator extends ASTNode {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  summarize() {
    return ` (${this.left.value} ${this.operator.value} ${this.right.value})`;
  }
  toJSON() {
    return {
      operator: this.operator,
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}
/*
export class Addition extends Operator {
  constructor(left, right) {
    super("+", left, right);
  }


}

export class Multiplication extends Operator {
  constructor(left, right) {
    super("*", left, right);
  }

  toJSON() {
    return {
      type: "Multiplication",
      operator: "*",
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}

export class Equality extends Operator {
  constructor(left, right) {
    super("=", left, right);
  }

  toJSON() {
    return {
      type: "Equality",
      operator: "=",
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}
export class GreaterThan extends Operator {
  constructor(left, right) {
    super(">", left, right);
  }

  toJSON() {
    return {
      type: "GreaterThan",
      operator: ">",
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}



export class LessThan extends Operator {
  constructor(left, right) {
    super("<", left, right);
  }

  toJSON() {
    return {
      type: "LessThan",
      operator: "<",
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}


export class isBetweenNode extends Operator {
  constructor(value, lower, upper) {
    super();
    this.lowerComparison = new Operator(value, ">=", lower);
    this.upperComparison = new Operator(value, "<=", upper);
    super(lowerComparison, upperComparison);
  }
}
*/
export class Logical extends ASTNode {
  constructor(left, right) {
    super("and", left, right);
  }

  toJSON() {
    return {
      type: "Logical",
      operator: "and",
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}
