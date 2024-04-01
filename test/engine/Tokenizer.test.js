import { test, expect } from "bun:test";
import { TokenType } from "../../src/engine/Token";
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
[ {    type: "NUMBER",    value: 18  }, ]);

createTest("-18",   
[ {    type: "OP",        value: "-"  },
  {    type: "NUMBER",    value: 18  } ]);

createTest("37.2", 
[ {    type: "NUMBER",    value: 37.2  }, ]);


createTest("'A String'", [
  { type: TokenType.STRING, value: "A String" }]
);

createTest("true", 
[  { type: TokenType.BOOLEAN, value: true },]);
createTest("false", 
[{ type: TokenType.BOOLEAN, value: false },]);

createTest("!true", 
[{ type: TokenType.NOT, value: "!" },
{ type: TokenType.BOOLEAN, value: true }]);
createTest("!false", 
[{ type: TokenType.NOT, value: "!" },
{ type: TokenType.BOOLEAN, value: false }]);


createTest("10-5*2", 
[ {    type: "NUMBER",    value: 10  },
  {    type: "OP",        value: "-" },
  {    type: "NUMBER",    value: 5   },
  {    type: "OP",        value: "*" },
  {    type: "NUMBER",    value: 2   }
]);

createTest("1 + 2 - 3 * 4 / 5",
 [{ type: TokenType.NUMBER, value: 1 },
  { type: TokenType.OPERATOR, value: "+" },
  { type: TokenType.NUMBER, value: 2 },
  { type: TokenType.OPERATOR, value: "-" },
  { type: TokenType.NUMBER, value: 3 },
  { type: TokenType.OPERATOR, value: "*" },
  { type: TokenType.NUMBER, value: 4 },
  { type: TokenType.OPERATOR, value: "/" },
  { type: TokenType.NUMBER, value: 5 }
  ]);

createTest("order",
 [ {    type: "IDENTIFIER",    value: "order"  }, ]);

 // Test for logical operators

createTest("a or b", 
[ {    type: "IDENTIFIER",    value: "a"  }, 
  {    type: "OR",            value: "or" }, 
  {    type: "IDENTIFIER",    value: "b"  }
]);

createTest("a and b", 
[ {    type: "IDENTIFIER",    value: "a"  }, 
  {    type: "AND",           value: "and" }, 
  {    type: "IDENTIFIER",    value: "b"  }
]);


// test to test that the tokenizer returns the proper line and columngit 
test("Tokenize: 1+3", () => {
  const test_minus = "1+3";
  const tokens = new Tokenizer().parseTokens(test_minus);
  try {
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: 1, line: 1, column: 1 },
      { type: TokenType.OPERATOR, value: "+", line: 1, column: 2 },
      { type: TokenType.NUMBER, value: 3, line: 1, column: 3 },
    ]);
  } catch (error) {
    console.log("TOKENS = ", tokens);
    throw error; // Rethrow the error to ensure the test fails.
  }
});




createTest("myList contains 'toto'", 
[ {     type: "IDENTIFIER",   value: "myList"   },
  {     type: "CONTAINS",     value: "contains" },
  {     type: "STRING",       value: "toto"     }
]); 

createTest("'toto' in myList", 
[ {     type: "STRING",      value: "toto"   },
  {     type: "IN",          value: "in" },
  {     type: "IDENTIFIER",  value: "myList"     }
]); 

createTest("renewMembership in ['No', 'Undecided']", 
[ {     type: "IDENTIFIER",  value: "renewMembership"   },
  {     type: "IN",          value: "in" },
  {     type: "LBRACKET",    value: "["  },
  {     type: "STRING",      value: "No" },
  {     type: "COMMA",       value: "," },
  {     type: "STRING",      value: "Undecided" },
  {     type: "RBRACKET",    value: "]"  },
]); 

// 'Object and Field' for 'Person.Name'
createTest("Person.Name", [
  { type: TokenType.IDENTIFIER, value: "Person" },
  { type: TokenType.DOT, value: "." },
  { type: TokenType.IDENTIFIER, value: "Name" },
]);

createTest("Person.Age is 18", [
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.EQUALS, value: "==" },
    { type: TokenType.NUMBER, value: 18 },
  ]);

  createTest("Person.Age == 18",   [
      { type: TokenType.IDENTIFIER, value: "Person" },
      { type: TokenType.DOT, value: "." },
      { type: TokenType.IDENTIFIER, value: "Age" },
      { type: TokenType.EQUALS, value: "==" },
      { type: TokenType.NUMBER, value: 18 },
]); 

createTest("Person.Age = 18", [
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.ASSIGN, value: "=" },
    { type: TokenType.NUMBER, value: 18 },
  ]);

  createTest("Person.Age > 18", [
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.OPERATOR, value: ">" },
    { type: TokenType.NUMBER, value: 18 },
  ]);

  createTest("Age != 18", [
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.NOT_EQUAL, value: "!=" },
    { type: TokenType.NUMBER, value: 18 },
  ]);

  createTest("Person.Age <= 18", [
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.OPERATOR, value: "<=" },
    { type: TokenType.NUMBER, value: 18 },
  ]);

  createTest("Person.Age  >= 18", [
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.OPERATOR, value: ">=" },
    { type: TokenType.NUMBER, value: 18 },
  ]);  

  createTest("Person.Name is 'John'", 
  [
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Name" },
    { type: TokenType.EQUALS, value: "==" },
    { type: TokenType.STRING, value: "John" },
  ]);



  createTest("isVisible is true", 
  [
    { type: TokenType.IDENTIFIER, value: "isVisible" },
    { type: TokenType.EQUALS, value: "==" },
    { type: TokenType.BOOLEAN, value: true },
  ]);

  createTest("isVisible is not true", 
  [
    { type: TokenType.IDENTIFIER, value: "isVisible" },
    { type: TokenType.NOT_EQUAL, value: "!=" },
    { type: TokenType.BOOLEAN, value: true },
  ]);

  createTest("2 - -3", [
    { type: TokenType.NUMBER, value: 2 },
    { type: TokenType.OPERATOR, value: "-" },
    { type: TokenType.OPERATOR, value: "-" },
    { type: TokenType.NUMBER, value: 3 },
  ]);

  //Test for combined operators and variables
  createTest("(age + 10) >= 65", [
    { type: TokenType.LPAREN, value: "(" },
    { type: TokenType.IDENTIFIER, value: "age" },
    { type: TokenType.OPERATOR, value: "+" },
    { type: TokenType.NUMBER, value: 10 },
    { type: TokenType.RPAREN, value: ")" },
    { type: TokenType.OPERATOR, value: ">=" },
    { type: TokenType.NUMBER, value: 65 },
  ]);

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
  console.log(`\nTokenize: : '${test_error}'`);
  const tokenizer = new Tokenizer();
  expect(() => tokenizer.parseTokens(test_error)).toThrow("Syntax error: unclosed string literal");
});