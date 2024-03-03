/* Represents an Abstract Syntax Tree expression */
export class Expression {
  constructor(value) {
    this.value = value;
  }
  evaluate(context) {
    throw new Error("Must implement evaluate method in subclass");
  }
}

export class Operand extends Expression {}

export class VariableNode extends Operand {
  constructor(name) {
    super(name);
    this.name = name;
  }
  evaluate(context) {
    console.log(`VariableNode.evaluate(): Looking for value of '${this.name}' within context: `, context);
    const parts = this.value.split(".");
    let currentValue = context;

    for (const part of parts) {
      if (currentValue.hasOwnProperty(part)) {
        currentValue = currentValue[part];
      } else {
        console.error(`VariableNode.evaluate(): Variable or property ${part} not found in context`);
        return undefined; // or throw an error based on your error handling strategy
      }
    }
    const valueDisplay = currentValue === null ? 'null' : currentValue;
    console.log(`VariableNode.evaluate(): Found variable '${this.name}' with value ${valueDisplay}`);
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
    (this.type = "BinaryExpression"), (this.left = left);
    this.operator = operator;
    this.right = right;
  }
  evaluate(context) {
    const leftVal = this.left.evaluate(context);
    const rightVal = this.right.evaluate(context);
    switch (this.operator) {
      case "+":
        return leftVal + rightVal;
      case "-":
        return leftVal - rightVal;
      case "*":
        return leftVal * rightVal;
      case "/":
        return leftVal / rightVal;
      case ">":
        return leftVal > rightVal;
      case "<":
        return leftVal < rightVal;
      case "=":
        return leftVal == rightVal;
      case "^":
        return Math.pow(leftVal, rightVal);
      default:
        throw new Error(`Unsupported operator ${this.operator}`);
    }
  }
  summarize() {
    return `(${this.left.summarize()} ${this.operator} ${this.right.summarize()})`;
  }
  toJSON() {
    return {
      type: this.type,
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
