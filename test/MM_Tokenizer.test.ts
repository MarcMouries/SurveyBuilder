import { expect, test } from "bun:test";
import { tokenizer, parser } from "../src/parser/MM_TokenizerParser";


test("parses is between", () => {
  const input = "Age is between 18 and 30";
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  console.log(ast);
  //expect(JSON.stringify(ast)).toBe("expected AST structure for Age = 30");
});

// test("parses equality operation", () => {
//   const input = "Age = 30";
//   const tokens = tokenizer(input);
//   const ast = parser(tokens);
//   expect(JSON.stringify(ast)).toBe(/* expected AST structure for Age = 30 */);
// });

// test("parses inequality operation", () => {
//   const input = "Age != 30";
//   const tokens = tokenizer(input);
//   const ast = parser(tokens);
//   expect(JSON.stringify(ast)).toBe(/* expected AST structure for Age != 30 */);
// });

// test("parses less than operation", () => {
//   const input = "Age < 30";
//   const tokens = tokenizer(input);
//   const ast = parser(tokens);
//   expect(JSON.stringify(ast)).toBe(/* expected AST structure for Age < 30 */);
// });

// test("parses less than or equal operation", () => {
//   const input = "Age <= 30";
//   const tokens = tokenizer(input);
//   const ast = parser(tokens);
//   expect(JSON.stringify(ast)).toBe(/* expected AST structure for Age <= 30 */);
// });

// test("parses greater than operation", () => {
//   const input = "Age > 30";
//   const tokens = tokenizer(input);
//   const ast = parser(tokens);
//   expect(JSON.stringify(ast)).toBe(/* expected AST structure for Age > 30 */);
// });

// test("parses greater than or equal operation", () => {
//   const input = "Age >= 30";
//   const tokens = tokenizer(input);
//   const ast = parser(tokens);
//   expect(JSON.stringify(ast)).toBe(/* expected AST structure for Age >= 30 */);
// });

// test("parses contains operation", () => {
//   const input = "Name contains 'John'";
//   const tokens = tokenizer(input);
//   const ast = parser(tokens);
//   expect(JSON.stringify(ast)).toBe(/* expected AST structure for Name contains 'John' */);
// });