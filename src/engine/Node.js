export class Expression {
  constructor(value) {
    this.value = value;
  }
  evaluate(context) {
    throw new Error('Must implement evaluate method in subclass');
  }
}


export class Operand extends Expression {}

export class VariableNode extends Operand {
  constructor(name) {
    super(name);
  }
  summarize() {
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

export class BinaryExpression extends Expression {
  constructor(left, operator, right) {
    super();
    this.type = "BinaryExpression",
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  summarize() {
    return ` (${this.left.value} ${this.operator.value} ${this.right.value})`;
  }
  toJSON() {
    return {
      "type": this.type,
      operator: this.operator,
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}



// export class isBetweenNode extends Operator {
//   constructor(value, lower, upper) {
//     super();
//     this.lowerComparison = new Operator(value, ">=", lower);
//     this.upperComparison = new Operator(value, "<=", upper);
//     super(lowerComparison, upperComparison);
//   }
// }

export class Logical extends Expression {
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
