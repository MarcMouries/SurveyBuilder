/* Represents an Abstract Syntax Tree expression */
export class Expression {

  evaluate(context) {
    throw new Error("Must implement evaluate method in subclass");
  }
}

export class VariableNode extends Expression {
  constructor(name) {
    super(name);
    this.name = name;
  }
  evaluate(context) {
    console.log(`VariableNode.evaluate(): Looking for value of '${this.name}' within context: `, context);
    const parts = this.name.split(".");
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
    return `${this.name}`;
  }
  toJSON() {
    return { type: "Variable", name: this.name };
  }
}

export class Constant extends Expression {
  constructor(value) {
    super();
    this.value = value;

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
    return `${this.value}`;
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

export class UnaryExpression extends Expression {
  constructor(operator, operand) {
    super();
    this.type = "UnaryExpression";
    this.operator = operator;
    this.operand = operand;
  }

  evaluate(context) {
    const operandValue = this.operand.evaluate(context);
    switch (this.operator) {
      case "-":
        return -operandValue;
      case "!":
        return !operandValue;
      default:
        throw new Error(`Unsupported unary operator ${this.operator}`);
    }
  }

  summarize() {
    return `${this.operator}${this.operand.summarize()}`;
  }

  toJSON() {
    return {
      type: this.type,
      operator: this.operator,
      operand: this.operand.toJSON(),
    };
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
        if (rightVal === 0) throw new Error("Division by zero");
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

export class AssignmentExpression extends Expression {
  constructor(variable, value) {
    super();
    this.type = "AssignmentExpression";
    this.variable = variable;
    this.value = value;
  }

  evaluate(context) {
    const val = this.value.evaluate(context);
    context[this.variable.name] = val;
    return val;
  }

  summarize() {
    return `${this.variable.summarize()} = ${this.value.summarize()}`;
  }

  toJSON() {
    return {
      type: this.type,
      variable: this.variable.toJSON(),
      value: this.value.toJSON(),
    };
  }
}

export class GroupingExpression extends Expression {
  constructor(expression) {
    super();
    this.expression = expression;
    this.type = "GroupingExpression";
  }

  evaluate(context) {
    return this.expression.evaluate(context);
  }

  summarize() {
    return `( ${this.expression.summarize()} )`;
  }

  toJSON() {
    return {
      type: this.type,
      expression: this.expression.toJSON(),
    };
  }
}


export class LogicalExpression extends Expression {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  summarize() {
    return `${this.left.summarize()} ${this.operator} ${this.right.summarize()}`;
  }

  toJSON() {
    return {
      type: "LogicalExpression",
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
