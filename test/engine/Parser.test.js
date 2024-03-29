import { Parser } from '../../src/engine/Parser';
import { ASTtoJSON } from "../../src/engine/ast/ASTtoJSON";
import { ASTtoString } from "../../src/engine/ast/ASTtoString";
import { BinaryExpression } from "../../src/engine/ast/ASTNode";


const testCases = [
  {
    expression_string: "18",
    expected: {
      type: "Number",
      value: 18
    }
  },
  {
    expression_string: "'toto'",
    expected: {
      type: "String",
      value: "toto"
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
    expression_string: "false",
    expected: {
      type: "Boolean",
      value: false
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
      type: "Identifier",
      name: "age"
    }
  },

  {
    expression_string: "age = 18",
    expected: {
      type: "AssignmentExpression",
      left: {
        type: "Identifier", name: "age",
      },
      right: { type: "Number", value: 18 }
    }
  },

  {
    expression_string: "age == 18",
    expected: {
      type: "BinaryExpression",
      operator: "==",
      left: {
        type: "Identifier",
        name: "age"
      },
      right: {
        type: "Number",
        value: 18
      }
    }
  },
  {
    expression_string: "age is 18",
    expected: {
      type: "BinaryExpression",
      operator: "==",
      left: {
        type: "Identifier",
        name: "age"
      },
      right: {
        type: "Number",
        value: 18
      }
    }
  },
  {
    expression_string: "age > 18",
    expected: {
      type: "BinaryExpression",
      operator: ">",
      left: {
        type: "Identifier",
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
        "type": "Identifier",
        "name": "weight"
      },
      "right": {
        "type": "BinaryExpression",
        "operator": "^",
        "left": {
          "type": "Identifier",
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
    expression_string: "BMI = weight / height ^ 2",
    expected:
    {
      type: "AssignmentExpression",
      left: {
        name: "BMI",
        type: "Identifier",
      },
      right: {
        "type": "BinaryExpression",
        "operator": "/",
        "left": {
          "type": "Identifier",
          "name": "weight"
        },
        "right": {
          "type": "BinaryExpression",
          "operator": "^",
          "left": {
            "type": "Identifier",
            "name": "height"
          },
          "right": {
            "type": "Number",
            "value": 2
          }
        }
      }
    }
  },
  {
    expression_string: "a and b",
    expected: {
      type: "LogicalExpression",
      operator: "AND",
      left: {
        type: "Identifier",
        name: "a",
      },
      right: {
        type: "Identifier",
        name: "b",
      },
    }
  },
  {
    expression_string: "a or b",
    expected: {
      type: "LogicalExpression",
      operator: "OR",
      left: {
        type: "Identifier",
        name: "a",
      },
      right: {
        type: "Identifier",
        name: "b",
      },
    }
  },
  {
    expression_string: "(1 + 2) * (4 - 3)",
    expected:
    {
      "type": "BinaryExpression",
      "operator": "*",
      "left": {
        "type": "GroupExpression",
        "expression": {
          "type": "BinaryExpression",
          "operator": "+",
          "left": { "type": "Number", "value": 1 },
          "right": { "type": "Number", "value": 2 }
        }
      },
      "right": {
        "type": "GroupExpression",
        "expression": {
          "type": "BinaryExpression",
          "operator": "-",
          "left": { "type": "Number", "value": 4 },
          "right": { "type": "Number", "value": 3 }
        }
      }
    }
  },
  {
    expression_string: "age > BABY_AGE and age < TODDLER_AGE",
    expected: {
      type: "LogicalExpression",
      operator: "AND",
      left: {
        type: "BinaryExpression",
        operator: ">",
        left: {
          type: "Identifier",
          name: "age"
        },
        right: {
          type: "Identifier",
          name: "BABY_AGE"
        }
      },
      right: {
        type: "BinaryExpression",
        operator: "<",
        left: {
          type: "Identifier",
          name: "age"
        },
        right: {
          type: "Identifier",
          name: "TODDLER_AGE"
        }
      }
    }
  },
  // {
  //   expression_string: "age is between TODDLER_AGE and MAJORITY_AGE",
  //   expected: {
  //     type: "Between",
  //     operator: "between",
  //     left: {
  //       type: "Identifier",
  //       name: "age"
  //     },
  //     middle: {
  //       type: "Identifier",
  //       name: "TODDLER_AGE"
  //     },
  //     right: {
  //       type: "Identifier",
  //       name: "MAJORITY_AGE"
  //     }
  //   }
  // },

  {
    expression_string: "person.age == 18",
    expected:
    {
      "type": "BinaryExpression",
      "operator": "==",
      "left": {
        "type": "MemberExpression",
        "object": { "type": "Identifier", "name": "person" },
        "property": { "type": "Identifier", "name": "age" }
      },
      "right": { "type": "Number", "value": 18 }
    }
  },
  {
    expression_string: "person.age = 18",
    expected:
    {
      "type": "AssignmentExpression",
      "left": {
        "type": "MemberExpression",
        "object": { "type": "Identifier", "name": "person" },
        "property": { "type": "Identifier", "name": "age" }
      },
      right: { type: "Number", value: 18 },
    }
  },
  {
    expression_string: "customer.person.age = 18",
    expected: {
      type: "AssignmentExpression",
      left: {
        type: "MemberExpression",
        object: {
          type: "MemberExpression",
          object: {
            name: "customer",
            type: "Identifier",
          },
          property: {
            name: "person",
            type: "Identifier",
          },
        },
        property: { name: "age", type: "Identifier" },
      },
      right: { type: "Number", value: 18 },
    }
  },
  // {
  //   expression_string: "class Person{}",
  //   expected: {
  //     type: "AssignmentExpression",
  //     left: {
  //       type: "MemberExpression",
  //       object:   { name: "customer", type: "Identifier" },
  //       property: { name: "age",      type: "Identifier" },
  //     },
  //     right: { type: "Number", value: 18 },
  //   }
  // }
];



testCases.forEach(({ expression_string, expected }) => {
  test(`Testing '${expression_string}'`, () => {
    const parser = new Parser();
    const expression = parser.parse(expression_string);
    const expressionJSON = ASTtoJSON.toJson(expression);
    try {
      expect(expressionJSON).toEqual(expected);
    } catch (error) {
      console.log("\n\n");
      console.log(`Input..: '${expression_string}'`);
      const printedExpression = ASTtoString.toString(expression);
      console.log(`Summary: '${printedExpression}'`);
      console.log(`JSON   : `, expressionJSON);
      throw error; // Rethrow the error to ensure the test fails.
    }
  });
})

//Test for error handling: missing expression after '=' in assignment 
// const expression_string = "2  3 + 1";
// test(`Parsing: '${expression_string}'`, () => {
//   console.log(`\nParsing: : '${expression_string}'`);
//   const parser = new Parser();
//   const expression = parser.parse(expression_string);
//   const printedExpression = ASTtoString.toString(expression);
//   console.log(`Output: '${printedExpression}'`);
//   expect(() => parser.parse(expression_string)).toThrow("Missing expression after '='");
// });

// {
//   expression_string: "a = ",
//   expected: {
//   }
// }
//   expect(() => tokenizer.parseTokens(test_error)).toThrow("Syntax error: unclosed string literal");
