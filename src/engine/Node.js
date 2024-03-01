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
    this.name = name;
  }
  evaluate(context) {
    console.log(`Evaluating VariableNode with value: ${this.value}`);
    const parts = this.value.split(".");
        let currentValue = context;
    for (const part of parts) {
      if (part in currentValue) {
        currentValue = currentValue[part];
      } else {
        throw new Error(`Variable or property ${part} not found in context`);
      }
    }
    return currentValue;
  }
  summarize() {
    return `Variable(${this.name})`;
  }
  toJSON() {
    return { type: "Variable", name: this.name };
  }
}

export class Constant extends Operand {
  constructor(value) {
    super(value);
  }
  evaluate(context) {
    return this.value;
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
  evaluate(context) {
    const leftVal = this.left.evaluate(context);
    const rightVal = this.right.evaluate(context);
    switch (this.operator) {
      case '+': return leftVal + rightVal;
      case '-': return leftVal - rightVal;
      case '*': return leftVal * rightVal;
      case '/': return leftVal / rightVal;
      case '>': return leftVal > rightVal;
      case '<': return leftVal < rightVal;
      case '=': return leftVal == rightVal;
      case '^': return Math.pow(leftVal, rightVal);
      default: throw new Error(`Unsupported operator ${this.operator}`);
    }
  }
  summarize() {
    return ` (${this.left.value} ${this.operator} ${this.right.value})`;
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
