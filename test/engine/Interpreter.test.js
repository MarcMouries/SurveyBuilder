
import { Parser } from "../../src/engine/Parser";
import { Interpreter } from "../../src/engine/Interpreter";
import { Environment } from "../../src/engine/Environment";
import { ASTtoJSON } from "../../src/engine/ast/ASTtoJSON";



test("Evaluate BinaryExpression using nested property 10-5*2", () => {
  console.log("\nEvaluating  10-5*2'");
  let interpreter = new Interpreter();
  const parser = new Parser();
  const expression = parser.parse("10-5*2");
  const result = interpreter.interpret(expression);
  console.log(`Result: ${result}`);
  expect(result).toBe(0);
});

test("Evaluate BinaryExpression using nested property (10-5)*2", () => {
  console.log("\nEvaluating  (10-5)*2'");
  let interpreter = new Interpreter();
  const parser = new Parser();
  const expression = parser.parse("(10-5)*2");
  const result = interpreter.interpret(expression);
  console.log(`Result: ${result}`);
  expect(result).toBe(10);
});

test("Evaluate BinaryExpression using nested property 2^2", () => {
  console.log("\nEvaluating 2^2");
  let interpreter = new Interpreter();
  const parser = new Parser();
  const expression = parser.parse("2^2");
  const result = interpreter.interpret(expression);
  console.log(`Result: ${result}`);
  expect(result).toBe(4);
});


test("Evaluate BinaryExpression 20 > 18", () => {
  console.log("\nEvaluating 20 > 18");
  let interpreter = new Interpreter();
  const parser = new Parser();
  const expression = parser.parse("20 > 18");
  const result = interpreter.interpret(expression);
  console.log(`Result: ${result}`);
  expect(result).toBe(true);
});

test("Evaluate Unknown variable in Binary Expression  'age' == 18", () => {
  console.log("\nEvaluating 'age == 18'");
  let interpreter = new Interpreter();
  const parser = new Parser();
  const expression = parser.parse("age == 18");
  expect(() => {
    interpreter.interpret(expression);
  }).toThrow("Undefined variable name 'age'");
});

test("Evaluate Known variable in Binary Expression  'age' == 18", () => {
  console.log("\nEvaluating 'age == 18'");
  let environment = new Environment();
  environment.define("age", 18);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age == 18");
  const result = interpreter.interpret(expression);
  expect(result).toBe(true);
});

test("Evaluate Known variable in Binary Expression 'age >= 13 and age <= 19", () => {
  console.log("\nEvaluating 'age >= 13 and age <= 19'");
  let environment = new Environment();
  environment.define("age", 18);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age >= 13 and age <= 19");
  const result = interpreter.interpret(expression);
  expect(result).toBe(true);
});

//  test("Evaluate Assignment Expression  'person.age' = 18", () => {
//    console.log("\nEvaluating Assignment 'person.age = 18'");
//    let interpreter = new Interpreter();
//    const parser = new Parser();
//    const expression = parser.parse("person.age = 18");
//    const json =  ASTtoJSON.toJson(expression);
//    console.log("ASTtoJSON.toString   : ", json); 
//    const result = interpreter.interpret(expression);
//    console.log(`Result: ${result}`);
//    expect(result).toBe(true);
//  });

//  test("Evaluate Assignment Expression  'order.customer.age' = 18", () => {
//   console.log("\nEvaluating Assignment 'order.customer.age = 18'");
//   let interpreter = new Interpreter();
//   const parser = new Parser();
//   const expression = parser.parse("order.customer.age = 18");
//   const json =  ASTtoJSON.toJson(expression);
//   console.log("ASTtoJSON.toString   : ", json); 
//   const result = interpreter.interpret(expression);
//   console.log(`Result: ${result}`);
//   expect(result).toBe(true);
// });

//  test("Evaluate BinaryExpression  'age' > 18", () => {
//    console.log("\nEvaluating BinaryExpression 'age > 18'");
//    let interpreter = new Interpreter();
//    const parser = new Parser();
//    const expression = parser.parse("age > 18");
//    const result = interpreter.interpret(expression);
//    console.log(`Result: ${result}`);
//    expect(result).toBe(true);
//  });