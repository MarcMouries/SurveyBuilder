import { TokenType } from "../../src/engine/Token";
import { Tokenizer } from "../../src/engine/Tokenizer";

//describe("Tokenizer Tests", () => {
// Test for numeric values
const test_number = "42";
test(`Tokenize: '${test_number}'`, () => {
  console.log(`\nTokenize: '${test_number}'`);
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.parseTokens(test_number);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([{ type: TokenType.NUMBER, value: 42 }]);
});

const test_float = "37.2";
test(`Tokenize: '${test_float}'`, () => {
  console.log(`\nTokenize: '${test_float}'`);
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.parseTokens(test_float);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([{ type: TokenType.NUMBER, value: 37.2 }]);
});

// Test for arithmetic operators
const test_arithmetic = "1 + 2 - 3 * 4 / 5";
test(`Tokenize: '${test_arithmetic}'`, () => {
  console.log(`\nTokenize: '${test_arithmetic}'`);
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.parseTokens(test_arithmetic);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([{ type: TokenType.NUMBER, value: 1 },
  { type: TokenType.OPERATOR, value: "+" },
  { type: TokenType.NUMBER, value: 2 },
  { type: TokenType.OPERATOR, value: "-" },
  { type: TokenType.NUMBER, value: 3 },
  { type: TokenType.OPERATOR, value: "*" },
  { type: TokenType.NUMBER, value: 4 },
  { type: TokenType.OPERATOR, value: "/" },
  { type: TokenType.NUMBER, value: 5 }
  ]);
});

// Test for logical operators
const test_logical = "true and false";
test(`Tokenize: '${test_logical}'`, () => {
  console.log(`\nTokenize: : '${test_logical}'`);
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.parseTokens(test_logical);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([{ type: TokenType.BOOLEAN, value: true },
  { type: TokenType.AND, value: "and" },
  { type: TokenType.BOOLEAN, value: false },
  ]);
});

//Test for error handling - This requires implementing error handling in your tokenizer
const test_error = "'unclosed string";
test(`Tokenize: '${test_error}'`, () => {
  console.log(`\nTokenize: : '${test_error}'`);
  const tokenizer = new Tokenizer();
  expect(() => tokenizer.parseTokens(test_error)).toThrow("Syntax error: unclosed string literal");
});

test(`Tokenize: 'ok' (as string)`, () => {
  const test_string = "'ok'";
  console.log(`\nTokenize: : '${test_string}'`);
  const tokens = new Tokenizer().parseTokens(test_string);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([{ type: TokenType.STRING, value: "ok" }]);
});

test("Tokenize: 'Object and Field' for 'Person.Name'", () => {
  const test_object_field = "Person.Name";
  const tokens = new Tokenizer().parseTokens(test_object_field);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Name" },
  ]);
});

test("Tokenize: 'Person.Age is 18'", () => {
  const test_age_is = "Person.Age is 18";
  console.log(`\nTokenize: : '${test_age_is}'`);
  const tokens = new Tokenizer().parseTokens(test_age_is);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.EQUALS, value: "==" },
    { type: TokenType.NUMBER, value: 18 },
  ]);
});

test("Tokenize: 'Person.Age = 18'", () => {
  const test_age_equal = "Person.Age = 18";
  console.log(`\nTokenize: : '${test_age_equal}'`);
  const tokens = new Tokenizer().parseTokens(test_age_equal);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.ASSIGN, value: "=" },
    { type: TokenType.NUMBER, value: 18 },
  ]);
});

test("Tokenize: 'Age != 18'", () => {
  const test_inequality = "Age != 18";
  console.log(`\nTokenize: : '${test_inequality}'`);
  const tokens = new Tokenizer().parseTokens(test_inequality);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.NOT_EQUAL, value: "!=" },
    { type: TokenType.NUMBER, value: 18 },
  ]);
});

test("Tokenize: 'Person.Age > 18'", () => {
  const test_age_greater = "Person.Age > 18";
  console.log(`\nTokenize: : '${test_age_greater}'`);
  const tokens = new Tokenizer().parseTokens(test_age_greater);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.OPERATOR, value: ">" },
    { type: TokenType.NUMBER, value: 18 },
  ]);
});

test("Tokenize: 'Person.Age <= 18'", () => {
  const test_age_lesser_equal = "Person.Age <= 18";
  console.log(`\nTokenize: : '${test_age_lesser_equal}'`);
  const tokens = new Tokenizer().parseTokens(test_age_lesser_equal);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.OPERATOR, value: "<=" },
    { type: TokenType.NUMBER, value: 18 },
  ]);
});

test("Tokenize: 'Person.Age >= 18'", () => {
  const test_age_greater_equal = "Person.Age >= 18";
  console.log(`\nTokenize: : '${test_age_greater_equal}'`);
  const tokens = new Tokenizer().parseTokens(test_age_greater_equal);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Age" },
    { type: TokenType.OPERATOR, value: ">=" },
    { type: TokenType.NUMBER, value: 18 },
  ]);
});

test("Tokenize: 'Person.Name is 'John'", () => {
  const test_IDENTIFIER_is_string = "Person.Name is 'John'";
  console.log(`\nTokenize: : '${test_IDENTIFIER_is_string}'`);
  const tokens = new Tokenizer().parseTokens(test_IDENTIFIER_is_string);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "Person" },
    { type: TokenType.DOT, value: "." },
    { type: TokenType.IDENTIFIER, value: "Name" },
    { type: TokenType.EQUALS, value: "==" },
    { type: TokenType.STRING, value: "John" },
  ]);
});

test("Tokenize: 'Person.Name is 'John''", () => {
  const test_IDENTIFIER_is_string_error = "Person.Name is 'John''";
  console.log(`\nTokenize: : '${test_IDENTIFIER_is_string_error}'`);
  const tokenizer = new Tokenizer();
  expect(() => {
    tokenizer.parseTokens(test_IDENTIFIER_is_string_error);
  }).toThrow("Syntax error: unclosed string literal");
});


test("Tokenize: 'isVisible is true'", () => {
  const test_is_true = "isVisible is true";
  const tokens = new Tokenizer().parseTokens(test_is_true);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "isVisible" },
    { type: TokenType.EQUALS, value: "==" },
    { type: TokenType.BOOLEAN, value: true },
  ]);
});

test("Tokenize: 'isVisible is true' (Object variable is true)", () => {
  const object_var_is_true = "isVisible is true";
  const tokens = new Tokenizer().parseTokens(object_var_is_true);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "isVisible" },
    { type: TokenType.EQUALS, value: "==" },
    { type: TokenType.BOOLEAN, value: true },
  ]);
});

test("Tokenize: 'is not' phrase", () => {
  const test_is_not = "isVisible is not true";
  const tokens = new Tokenizer().parseTokens(test_is_not);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "isVisible" },
    { type: TokenType.NOT_EQUAL, value: "!=" },
    { type: TokenType.BOOLEAN, value: true },
  ]);
});

test("Tokenize: '2 - -3", () => {
  const test_minus = "2 - -3";
  const tokens = new Tokenizer().parseTokens(test_minus);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  try {
    expect(simplifiedTokens).toEqual([
      { type: TokenType.NUMBER, value: 2 },
      { type: TokenType.OPERATOR, value: "-" },
      { type: TokenType.OPERATOR, value: "-" },
      { type: TokenType.NUMBER, value: 3 },
    ]);
  } catch (error) {
    console.log("TOKENS = ", tokens);
    throw error; // Rethrow the error to ensure the test fails.
  }
});

test("Tokenize: '1+3'", () => {
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

//Test for combined operators and variables
const test_combined = "(age + 10) >= 65";
test(`Tokenize: '${test_combined}'`, () => {
  console.log(`\nTokenize: : '${test_combined}'`);
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.parseTokens(test_combined);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.LPAREN, value: "(" },
    { type: TokenType.IDENTIFIER, value: "age" },
    { type: TokenType.OPERATOR, value: "+" },
    { type: TokenType.NUMBER, value: 10 },
    { type: TokenType.RPAREN, value: ")" },
    { type: TokenType.OPERATOR, value: ">=" },
    { type: TokenType.NUMBER, value: 65 },
  ]);
});


// test that identifier starting with a keyword is tokenized as an identifier
const test_order = "order";//.age = 18";
test(`Tokenize: '${test_order}'`, () => {
  console.log(`\nTokenize: : '${test_order}'`);
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.parseTokens(test_order);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "order" },
  ]);
});
const test_or = "a or b";
test(`Tokenize: '${test_or}'`, () => {
  console.log(`\nTokenize: : '${test_or}'`);
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.parseTokens(test_or);
  const simplifiedTokens = tokens.map(({ type, value }) => ({ type, value }));
  expect(simplifiedTokens).toEqual([
    { type: TokenType.IDENTIFIER, value: "a" },
    { type: TokenType.OR, value: "or" },
    { type: TokenType.IDENTIFIER, value: "b" },
  ]);
});