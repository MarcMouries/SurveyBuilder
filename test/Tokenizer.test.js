import { Tokenizer2, TokenType } from "../src/engine/Tokenizer2";

describe("Tokenizer2 Tests", () => {
  // Test for numeric values
  const test_number = "42";
  test(`Tokenize: '${test_number}'`, () => {
    console.log(`\nTokenize: '${test_number}'`);
    const tokenizer = new Tokenizer2();
    const tokens = tokenizer.parseTokens(test_number);
    expect(tokens).toEqual([{ type: TokenType.NUMBER, value: 42 }]);
  });

  // // Test for logical operators
  // const test_logical = "true and false";
  // test(`Tokenize: '${test_logical}'`, () => {
  //   console.log(`\nTokenize: : '${test_logical}'`);
  //   const tokenizer = new Tokenizer2();
  //   const tokens = tokenizer.parseTokens(test_logical);
  //   expect(tokens).toEqual([
  //     { type: TokenType.BOOLEAN, value: true },
  //     { type: TokenType.AND, value: "and" },
  //     { type: TokenType.BOOLEAN, value: false },
  //   ]);
  // });

  // Test for error handling - This requires implementing error handling in your tokenizer
  const test_error = "'unclosed string";
  test(`Tokenize: '${test_error}'`, () => {
    console.log(`\nTokenize: : '${test_error}'`);
    const tokenizer = new Tokenizer2();
    expect(() => tokenizer.parseTokens(test_error)).toThrow("Syntax error: unclosed string literal");
  });

  test(`Tokenize: 'ok' (as string)`, () => {
    const test_string = "'ok'";
    console.log(`\nTokenize: : '${test_string}'`);
    const tokens = new Tokenizer2().parseTokens(test_string);
    expect(tokens).toEqual([{ type: TokenType.STRING, value: "ok" }]);
  });

  test("Tokenize: 'Person.Age is 18'", () => {
    const test_is = "Person.Age is 18";
    const tokens = new Tokenizer2().parseTokens(test_is);
    expect(tokens).toEqual([
      { type: TokenType.VAR, value: "Person.Age" },
      { type: TokenType.OPERATOR, value: "=" },
      { type: TokenType.STRING, value: "John" },
    ]);
  });

  test("Tokenize: 'Person.Name is 'John''", () => {
    const test_var_is_string = "Tokenize: 'Person.Name is 'John''";
    const tokens = new Tokenizer2().parseTokens(test_var_is_string);
    expect(tokens).toEqual([
      { type: TokenType.VAR, value: "Person.Name" },
      { type: TokenType.OPERATOR, value: "=" },
      { type: TokenType.NUMBER, value: 18 },
    ]);
  });

  test("Tokenize: 'isVisible is true'", () => {
    const test_is_true = "isVisible is true";
    const tokens = new Tokenizer2().parseTokens(test_is_true);
    expect(tokens).toEqual([
      { type: TokenType.VAR, value: "isVisible" },
      { type: TokenType.OPERATOR, value: "=" },
      { type: TokenType.BOOLEAN, value: true },
    ]);
  });

  test("Tokenize: 'isVisible is true' (Object variable is true)", () => {
    const object_var_is_true = "isVisible is true";
    const tokens = new Tokenizer2().parseTokens(object_var_is_true);
    expect(tokens).toEqual([
      { type: TokenType.VAR, value: "isVisible" },
      { type: TokenType.OPERATOR, value: "=" },
      { type: TokenType.BOOLEAN, value: true },
    ]);
  });


// // Test for combined operators and variables
// const test_combined = "(age + 10) >= 65";
// test(`Tokenize: '${test_combined}'`, () => {
//   console.log(`\nTokenize: : '${test_combined}'`);
//   const tokenizer = new Tokenizer2();
//   const tokens = tokenizer.parseTokens(test_combined);
//   expect(tokens).toEqual([
//     { type: TokenType.LPAREN, value: "(" },
//     { type: TokenType.VAR, value: "age" },
//     { type: TokenType.OPERATOR, value: "+" },
//     { type: TokenType.NUMBER, value: 10 },
//     { type: TokenType.RPAREN, value: ")" },
//     { type: TokenType.GREATER_THAN_EQUAL, value: ">=" },
//     { type: TokenType.NUMBER, value: 65 },
//   ]);
});
