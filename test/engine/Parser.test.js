import { Parser } from '../../src/engine/Parser';

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
      value: 18
    }
  },
  {
    expression: "true",
    expected: {
      type: "Boolean",
      value: true
    }
  },
  {
    expression: "age > 18",
    expected: {
      type: "BinaryExpression",
      operator: ">",
      left: {
        type: "Variable",
        name: "age"
      },
      right: {
        type: "Number",
        value: 18
      }
    }
  },
  {
    expression: "age = 18",
    expected: {
      type: "BinaryExpression",
      operator: "=",
      left: {
        type: "Variable",
        name: "age"
      },
      right: {
        type: "Number",
        value: 18
      }
    }
  },
  // {
  //   expression: "age > BABY_AGE and age < TODDLER_AGE",
  //   expected: {
  //     type: "LogicalAnd",
  //     operator: "and",
  //     left: {
  //       type: "GreaterThan",
  //       operator: ">",
  //       left: {
  //         type: "Variable",
  //         name: "age"
  //       },
  //       right: {
  //         type: "Variable",
  //         name: "BABY_AGE"
  //       }
  //     },
  //     right: {
  //       type: "LessThan",
  //       operator: "<",
  //       left: {
  //         type: "Variable",
  //         name: "age"
  //       },
  //       right: {
  //         type: "Variable",
  //         name: "TODDLER_AGE"
  //       }
  //     }
  //   }
  // },
  // {
  //   expression: "age is between TODDLER_AGE and MAJORITY_AGE",
  //   expected: {
  //     type: "Between",
  //     operator: "between",
  //     left: {
  //       type: "Variable",
  //       name: "age"
  //     },
  //     middle: {
  //       type: "Variable",
  //       name: "TODDLER_AGE"
  //     },
  //     right: {
  //       type: "Variable",
  //       name: "MAJORITY_AGE"
  //     }
  //   }
  // },
  {
    expression: "10 + 2 * 5",
    expected:
    {
      "type": "BinaryExpression",
      "operator": "+",
      "left": {
        "type": "Number",
        "value": 10
      },
      "right": {
        "type": "BinaryExpression",
        "operator": "*",
        "left": {
          "type": "Number",
          "value": 2
        },
        "right": {
          "type": "Number",
          "value": 5
        }
      }
    }
  },
  {
    expression: "10 + 2 * 5 = 20",
    expected: {
      type: "BinaryExpression",
      operator: "=",
      left: {
        type: "BinaryExpression",
        operator: "+",
        left: {
          type: "Number",
          value: 10
        },
        right: {
          type: "BinaryExpression",
          operator: "*",
          left: {
            type: "Number",
            value: 2
          },
          right: {
            type: "Number",
            value: 5
          }
        }
      },
      right: {
        type: "Number",
        value: 20
      }
    }
  }
];

testCases.forEach(({ expression, expected }) => {
  test(`Testing '${expression}'`, () => {
    const parser = new Parser();
    console.log(`\n Parsing: : '${expression}'`);
    const result = parser.parse(expression);
    expect(result.toJSON()).toEqual(expected);
  });
});
