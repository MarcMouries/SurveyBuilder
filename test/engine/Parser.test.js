import { Parser } from '../../src/engine/Parser';

const testCases = [
  {
    expression_string: "18",
    expected: {
      type: "Number",
      value: 18
    }
  },
  {
    expression_string: "-18",
    expected: {
      type: "UnaryExpression",
      operator: "-",
      operand: {
        type: "Number",
        value: 18,
      },
    }
  },
   {
    expression_string: "age",
    expected: {
      type: "Variable",
      name: "age"
    }
  },
 
  {
    expression_string: "true",
    expected: {
      type: "Boolean",
      value: true
    }
  },
  {
    expression_string: "age > 18",
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
    expression_string: "10 + 2 * 5",
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
    expression_string: "10 + 2 * 5 == 20",
    expected: {
      type: "BinaryExpression",
      operator: "==",
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
  },
  {
    expression_string: "2 ^ 3",
    expected: 
    {
      "type": "BinaryExpression",
      "operator": "^",
      "left": {
        "type": "Number",
        "value": 2
      },
      "right": {
        "type": "Number",
        "value": 3
      }
    }
  },
  {
    expression_string: "2 * 3 ^ 2",
    expected: 
    {
      "type": "BinaryExpression",
      "operator": "*",
      "left": {
        "type": "Number",
        "value": 2
      },
      "right": {
        "type": "BinaryExpression",
        "operator": "^",
        "left": {
          "type": "Number",
          "value": 3
        },
        "right": {
          "type": "Number",
          "value": 2
        }
      }
    }
  },
  {
    expression_string: "8 / 2 * 4",
    expected:
     {
         left: {
           left: {
             type: "Number",
             value: 8,
           },
           operator: "/",
           right: {
             type: "Number",
             value: 2,
           },
           type: "BinaryExpression",
         },
         operator: "*",
         right: {
           type: "Number",
           value: 4,
         },
         type: "BinaryExpression",
       }
  },

  {
    expression_string: "weight / height ^ 2",
    expected:
    {
      "type": "BinaryExpression",
      "operator": "/",
      "left": {
        "type": "Variable",
        "name": "weight"
      },
      "right": {
        "type": "BinaryExpression",
        "operator": "^",
        "left": {
          "type": "Variable",
          "name": "height"
        },
        "right": {
          "type": "Number",
          "value": 2
        }
      }
    }
  },
  {
    expression_string: "age = 18",
    expected: {
      type: "AssignmentExpression",
      variable: {
        type: "Variable",
        name: "age",
      },
      value: {
        type: "Number",
        value: 18,
      },
    }
  },
  {
    expression_string: "a and b",
    expected: {
      type: "LogicalExpression",
      operator: "and",
      left: {
        type: "Variable",
        name: "a",
      },
      right: {
        type: "Variable",
        name: "b",
      },
    }
  },
  {
    expression_string: "a or b",
    expected: {
      type: "LogicalExpression",
      operator: "or",
      left: {
        type: "Variable",
        name: "a",
      },
      right: {
        type: "Variable",
        name: "b",
      },
    }
  },


   
  // {
  //   expression_string: "age is between TODDLER_AGE and MAJORITY_AGE",
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
  // }

  {
    expression_string: "age > BABY_AGE and age < TODDLER_AGE",
    expected: {
      type: "LogicalExpression",
      operator: "and",
      left: {
        type: "BinaryExpression",
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
        type: "BinaryExpression",
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
];

testCases.forEach(({ expression_string, expected }) => {
  test(`Testing '${expression_string}'`, () => {
    const parser = new Parser();
    console.log(`\nParsing: : '${expression_string}'`);
    const expression = parser.parse(expression_string);
    console.log("expression = ", expression.toJSON())
    console.log("summary = " + expression.summarize())
    expect(expression.toJSON()).toEqual(expected);
  });
});
