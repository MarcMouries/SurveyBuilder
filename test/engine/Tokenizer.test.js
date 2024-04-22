import { test, expect } from "bun:test";
import { Token } from "../../src/engine/Token";
import { Tokenizer } from "../../src/engine/Tokenizer";

function createTest(input, expected) {
  test(`Tokenize: ${input}`, () => {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.parseTokens(input);
    const result = tokens.map(({ type, value }) => ({ type, value }));
    try {
      expect(result).toEqual(expected);
    } catch (error) {
      console.log("Result: : ", result);
      throw error; // Rethrow the error to ensure the test fails.
    }
  });
}

// Test for Literals
createTest("18",
  [{ type: "NUMBER", value: 18 },]);

createTest("-18",
  [{ type: "OP", value: "-" },
  { type: "NUMBER", value: 18 }]);

createTest("37.2",
  [{ type: "NUMBER", value: 37.2 },]);


createTest("'A String'", [
  { type: Token.STRING, value: "A String" }]
);

createTest("true",
  [{ type: Token.BOOLEAN, value: true },]);
createTest("false",
  [{ type: Token.BOOLEAN, value: false },]);

createTest("!true",
  [{ type: Token.NOT, value: "!" },
  { type: Token.BOOLEAN, value: true }]);
createTest("!false",
  [{ type: Token.NOT, value: "!" },
  { type: Token.BOOLEAN, value: false }]);


createTest("10-5*2",
  [{ type: "NUMBER", value: 10 },
  { type: "OP", value: "-" },
  { type: "NUMBER", value: 5 },
  { type: "OP", value: "*" },
  { type: "NUMBER", value: 2 }
  ]);

createTest("(10-5)*2",
  [{ type: "LPAREN", value: "(" },
  { type: "NUMBER", value: 10 },
  { type: "OP", value: "-" },
  { type: "NUMBER", value: 5 },
  { type: "RPAREN", value: ")" },
  { type: "OP", value: "*" },
  { type: "NUMBER", value: 2 }
  ]);


createTest("1 + 2 - 3 * 4 / 5",
  [{ type: Token.NUMBER, value: 1 },
  { type: Token.OPERATOR, value: "+" },
  { type: Token.NUMBER, value: 2 },
  { type: Token.OPERATOR, value: "-" },
  { type: Token.NUMBER, value: 3 },
  { type: Token.OPERATOR, value: "*" },
  { type: Token.NUMBER, value: 4 },
  { type: Token.OPERATOR, value: "/" },
  { type: Token.NUMBER, value: 5 }
  ]);

createTest("order",
  [{ type: "IDENTIFIER", value: "order" },]);

// Test for logical operators

createTest("a or b",
  [{ type: "IDENTIFIER", value: "a" },
  { type: "OR", value: "or" },
  { type: "IDENTIFIER", value: "b" }
  ]);

createTest("a and b",
  [{ type: "IDENTIFIER", value: "a" },
  { type: "AND", value: "and" },
  { type: "IDENTIFIER", value: "b" }
  ]);


// test to test that the tokenizer returns the proper line and columngit 
test("Tokenize: 1+3", () => {
  const test_minus = "1+3";
  const tokens = new Tokenizer().parseTokens(test_minus);
  try {
    expect(tokens).toEqual([
      { type: Token.NUMBER, value: 1, line: 1, column: 1 },
      { type: Token.OPERATOR, value: "+", line: 1, column: 2 },
      { type: Token.NUMBER, value: 3, line: 1, column: 3 },
    ]);
  } catch (error) {
    console.log("TOKENS = ", tokens);
    throw error; // Rethrow the error to ensure the test fails.
  }
});


createTest("List_of_Colors contains 'blue'",
  [{ type: "IDENTIFIER", value: "List_of_Colors" },
  { type: "CONTAINS", value: "contains" },
  { type: "STRING", value: "blue" }
  ]);

createTest("'blue' in List_of_Colors",
  [{ type: "STRING", value: "blue" },
  { type: "IN", value: "in" },
  { type: "IDENTIFIER", value: "List_of_Colors" }
  ]);

createTest("answer in ['No', 'Undecided']",
  [{ type: "IDENTIFIER", value: "answer" },
  { type: "IN", value: "in" },
  { type: "LBRACKET", value: "[" },
  { type: "STRING", value: "No" },
  { type: "COMMA", value: "," },
  { type: "STRING", value: "Undecided" },
  { type: "RBRACKET", value: "]" },
  ]);

// 'Object and Field' for 'Person.Name'
createTest("Person.Name", [
  { type: Token.IDENTIFIER, value: "Person" },
  { type: Token.DOT, value: "." },
  { type: Token.IDENTIFIER, value: "Name" },
]);

createTest("Person.Age is 18", [
  { type: Token.IDENTIFIER, value: "Person" },
  { type: Token.DOT, value: "." },
  { type: Token.IDENTIFIER, value: "Age" },
  { type: Token.EQUALS, value: "==" },
  { type: Token.NUMBER, value: 18 },
]);

createTest("Person.Age == 18", [
  { type: Token.IDENTIFIER, value: "Person" },
  { type: Token.DOT, value: "." },
  { type: Token.IDENTIFIER, value: "Age" },
  { type: Token.EQUALS, value: "==" },
  { type: Token.NUMBER, value: 18 },
]);

createTest("Person.Age = 18", [
  { type: Token.IDENTIFIER, value: "Person" },
  { type: Token.DOT, value: "." },
  { type: Token.IDENTIFIER, value: "Age" },
  { type: Token.ASSIGN, value: "=" },
  { type: Token.NUMBER, value: 18 },
]);

createTest("Person.Age > 18", [
  { type: Token.IDENTIFIER, value: "Person" },
  { type: Token.DOT, value: "." },
  { type: Token.IDENTIFIER, value: "Age" },
  { type: Token.OPERATOR, value: ">" },
  { type: Token.NUMBER, value: 18 },
]);

createTest("Age != 18", [
  { type: Token.IDENTIFIER, value: "Age" },
  { type: Token.NOT_EQUAL, value: "!=" },
  { type: Token.NUMBER, value: 18 },
]);

createTest("Person.Age <= 18", [
  { type: Token.IDENTIFIER, value: "Person" },
  { type: Token.DOT, value: "." },
  { type: Token.IDENTIFIER, value: "Age" },
  { type: Token.OPERATOR, value: "<=" },
  { type: Token.NUMBER, value: 18 },
]);

createTest("Person.Age  >= 18", [
  { type: Token.IDENTIFIER, value: "Person" },
  { type: Token.DOT, value: "." },
  { type: Token.IDENTIFIER, value: "Age" },
  { type: Token.OPERATOR, value: ">=" },
  { type: Token.NUMBER, value: 18 },
]);

createTest("Person.Name is 'John'",
  [
    { type: Token.IDENTIFIER, value: "Person" },
    { type: Token.DOT, value: "." },
    { type: Token.IDENTIFIER, value: "Name" },
    { type: Token.EQUALS, value: "==" },
    { type: Token.STRING, value: "John" },
  ]);



createTest("isVisible is true",
  [
    { type: Token.IDENTIFIER, value: "isVisible" },
    { type: Token.EQUALS, value: "==" },
    { type: Token.BOOLEAN, value: true },
  ]);

createTest("isVisible is not true",
  [
    { type: Token.IDENTIFIER, value: "isVisible" },
    { type: Token.NOT_EQUAL, value: "!=" },
    { type: Token.BOOLEAN, value: true },
  ]);

createTest("2 - -3", [
  { type: Token.NUMBER, value: 2 },
  { type: Token.OPERATOR, value: "-" },
  { type: Token.OPERATOR, value: "-" },
  { type: Token.NUMBER, value: 3 },
]);

//Test for combined operators and variables
createTest("(age + 10) >= 65", [
  { type: Token.LPAREN, value: "(" },
  { type: Token.IDENTIFIER, value: "age" },
  { type: Token.OPERATOR, value: "+" },
  { type: Token.NUMBER, value: 10 },
  { type: Token.RPAREN, value: ")" },
  { type: Token.OPERATOR, value: ">=" },
  { type: Token.NUMBER, value: 65 },
]);

createTest("use_federal_forms",
  [{ type: "IDENTIFIER", value: "use_federal_forms" }]);

createTest("use-federal-forms",
  [{ type: "IDENTIFIER", value: "use-federal-forms" }]);




// ERRORS

test("Tokenize: 'Person.Name is 'John''", () => {
  const test_IDENTIFIER_is_string_error = "Person.Name is 'John''";
  // console.log(`\nTokenize: : '${test_IDENTIFIER_is_string_error}'`);
  const tokenizer = new Tokenizer();
  expect(() => {
    tokenizer.parseTokens(test_IDENTIFIER_is_string_error);
  }).toThrow("Syntax error: unclosed string literal");
});

//Test for error handling - This requires implementing error handling in your tokenizer
const test_error = "'unclosed string";
test(`Tokenize: '${test_error}'`, () => {
  //console.log(`\nTokenize: : '${test_error}'`);
  const tokenizer = new Tokenizer();
  expect(() => tokenizer.parseTokens(test_error)).toThrow("Syntax error: unclosed string literal");
});