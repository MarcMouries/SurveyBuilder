import { Parser } from '../src/engine/Parser';

const testCases = [
  {
    expression: "age",
    expected: {
      type: "Variable",
      name: "age"
    }
  },
  {
    expression: "18",
    expected: {
      type: "Number",
      value: "18"
    }
  },
  {
    expression: "age > 18",
    expected: {
      type: "GreaterThan",
      operator: ">",
      left: {
        type: "Variable",
        name: "age"
      },
      right: {
        type: "Number",
        value: "18"
      }
    }
  },
  {
    expression: "age is MAJORITY_AGE",
    expected: {
      type: "Equality",
      operator: "=",
      left: {
        type: "Variable",
        name: "age"
      },
      right: {
        type: "Variable",
        name: "MAJORITY_AGE"
      }
    }
  },
  {
    expression: "age > BABY_AGE and age < TODDLER_AGE",
    expected: {
      type: "LogicalAnd",
      operator: "and",
      left: {
        type: "GreaterThan",
        operator: ">",
        left: {
          type: "Variable",
          name: "age"
        },
        right: {
          type: "Variable",
          name: "BABY_AGE"
        }
      },
      right: {
        type: "LessThan",
        operator: "<",
        left: {
          type: "Variable",
          name: "age"
        },
        right: {
          type: "Variable",
          name: "TODDLER_AGE"
        }
      }
    }
  },
  {
    expression: "age is between TODDLER_AGE and MAJORITY_AGE",
    expected: {
      type: "Between",
      operator: "between",
      left: {
        type: "Variable",
        name: "age"
      },
      middle: {
        type: "Variable",
        name: "TODDLER_AGE"
      },
      right: {
        type: "Variable",
        name: "MAJORITY_AGE"
      }
    }
  },
  {
    expression: "a + b * c = 200",
    expected: {
      type: "Equality",
      operator: "=",
      left: {
        type: "Addition",
        operator: "+",
        left: {
          type: "Variable",
          name: "a"
        },
        right: {
          type: "Multiplication",
          operator: "*",
          left: {
            type: "Variable",
            name: "b"
          },
          right: {
            type: "Variable",
            name: "c"
          }
        }
      },
      right: {
        type: "Number",
        value: "200"
      }
    }
  }
];

testCases.forEach(({ expression, expected }) => {
  test(`Testing '${expression}'`, () => {
    const parser = new Parser();
    const result = parser.parse(expression);
    expect(result).toEqual(expected);
  });
});
