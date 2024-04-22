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
    expression_string: "37.2",
    expected: {
      type: "Number",
      value: 37.2
    }
  },
  {
    expression_string: "'A String'",
    expected: {
      type: "String",
      value: "A String"
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
    expression_string: "!true",
    expected: {
      type: "UnaryExpression",
      operator: "!",
      operand: {
        type: "Boolean",
        value: true,
      },
    }
  },
  {
    expression_string: "!false",
    expected: {
      type: "UnaryExpression",
      operator: "!",
      operand: {
        type: "Boolean",
        value: false,
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
    expression_string: "age is not 18",
    expected: {
      type: "BinaryExpression",
      operator: "!=",
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
    expression_string: "10 - 2 * 5",
    expected:
    {
      "type": "BinaryExpression",
      "operator": "-",
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
    expression_string: "(10-5)*2",
    expected:
    {
      type: "BinaryExpression",
      "left": {
        type: "GroupExpression",
        expression: {
          type: "BinaryExpression",
          left: { type: "Number", value: 10 },
          operator: "-",
          right: { type: "Number", value: 5 },
        },
      },
      "operator": "*",
      right: { type: "Number", value: 2 },
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
  {  // to ensure the parser can handle extreme nesting 
    expression_string: "((((10))))",
    expected: {
      type: "GroupExpression",
      expression: {
        type: "GroupExpression",
        expression: {
          type: "GroupExpression",
          expression: {
            type: "GroupExpression",
            expression: {
              type: "Number", value: 10
            }
          }
        }
      },
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
  {
    expression_string: "List_of_Colors contains 'blue'",
    expected: {
      type: "BinaryExpression",
      operator: "contains",
      left: { type: "Identifier", name: "List_of_Colors", },
      right: { type: "String", value: "blue" },
    }
  },
  {
    expression_string: "'blue' in List_of_Colors",
    expected: {
      type: "BinaryExpression",
      operator: "in",
      left: { type: "String", value: "blue" },
      right: { type: "Identifier", name: "List_of_Colors" },
    }
  },
  {
    expression_string: "answer in ['blue', 'green']",
    expected: {
      type: "BinaryExpression",
      operator: "in",
      left: {
        type: "Identifier",
        name: "answer",
      },
      right: {
        type: "ArrayLiteral",
        elements: [
          { type: "String", value: "blue" },
          { type: "String", value: "green" }
        ],
      },
    }
  },

  {
    expression_string: "has_pet == 'Yes'",
    expected: {
      type: "BinaryExpression",
      left:  { name: "has_pet", type: "Identifier" },
      operator: "==",
      right: {  type: "String", value: "Yes"  }
    }
  },
  {
    expression_string: "use-federal-forms == 'Yes'",
    expected: {
      type: "BinaryExpression",
      left:  { name: "use-federal-forms", type: "Identifier" },
      operator: "==",
      right: {  type: "String", value: "Yes"  }
    }
  },
  {
    expression_string: "use-federal-forms is 'Yes'",
    expected: {
      type: "BinaryExpression",
      left:  { name: "use-federal-forms", type: "Identifier" },
      operator: "==",
      right: {  type: "String", value: "Yes"  }
    }
  }

  


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
