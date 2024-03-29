
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

test("Evaluate OR expression with true short-circuit", () => {
  console.log("\nEvaluating 'age > 20 or age < 30'");
  let environment = new Environment();
  environment.define("age", 25);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age > 20 or age < 30");
  const result = interpreter.interpret(expression);
  expect(result).toBe(true);
});

test("Evaluate AND expression with false short-circuit", () => {
  console.log("\nEvaluating 'age > 20 and age < 18'");
  let environment = new Environment();
  environment.define("age", 15);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age > 20 and age < 18");
  const result = interpreter.interpret(expression);
  expect(result).toBe(false);
});

test("Evaluate AND expression with both sides false", () => {
  console.log("\nEvaluating 'age > 30 and age < 10'");
  let environment = new Environment();
  environment.define("age", 20);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age > 30 and age < 10");
  const result = interpreter.interpret(expression);
  expect(result).toBe(false);
});

test("Evaluate nested logical expressions", () => {
  console.log("\nEvaluating '(age >= 13 and age <= 19) or age == 21'");
  let environment = new Environment();
  environment.define("age", 21);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("(age >= 13 and age <= 19) or age == 21");
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