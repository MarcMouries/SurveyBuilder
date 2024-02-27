export class ASTNode {
  constructor(value) {
    this.value = value;
  }
}

export class Operand extends ASTNode {}
export class Operator extends ASTNode {
  constructor(value, left, right) {
    super(value);
    this.left = left;
    this.right = right;
  }
}
export class Variable extends Operand {
  constructor(name) {
    super(name);
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

  toJSON() {
    return { type: "Number", value: this.value };
  }
}
export class StringNode extends Constant {
  constructor(value) {
    super(value);
  }

  toJSON() {
    return { type: "String", value: this.value };
  }
}


export class Addition extends Operator {
  constructor(left, right) {
    super('+', left, right);
  }

  toJSON() {
    return {
      type: "Addition",
      operator: "+",
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}

export class Multiplication extends Operator {
  constructor(left, right) {
    super('*', left, right);
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
    super('=', left, right);
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
    super('>', left, right);
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
export class LogicalAnd extends Operator {
  constructor(left, right) {
    super('and', left, right);
  }

  toJSON() {
    return {
      type: "LogicalAnd",
      operator: "and",
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}
// Example of how classes might be defined, adjust based on actual class definitions
export class Between extends Operator {
  constructor(left, middle, right) {
    super('between', left, right); // Adjust constructor as needed
    this.middle = middle;
  }

  toJSON() {
    return {
      type: "Between",
      operator: "between",
      left: this.left.toJSON(),
      middle: this.middle.toJSON(),
      right: this.right.toJSON(),
    };
  }
}

// Placeholder for LessThan class, assuming it's needed and exists
export class LessThan extends Operator {
  constructor(left, right) {
    super('<', left, right);
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