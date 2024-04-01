import { test, expect } from "bun:test";
import { Parser } from "../../src/engine/Parser";
import { Interpreter } from "../../src/engine/Interpreter";
import { Environment } from "../../src/engine/Environment";
import { ASTtoJSON } from "../../src/engine/ast/ASTtoJSON";

function createTest(input, expected) {
  test(`Test the expression: ${input}`, () => {
    const parser = new Parser();
    const expression = parser.parse(input);
    let interpreter = new Interpreter();
    const result = interpreter.interpret(expression);
    try {
      expect(result).toBe(expected);
    } catch (error) {
      console.log("Result: : ", result);
      const json = ASTtoJSON.toJson(expression);
      console.log("toString: ", json);
      throw error; // Rethrow the error to ensure the test fails.
    }
  });
}


createTest("18", 18);
createTest("-18", -18);
createTest("37.2", 37.2);
createTest("'A String'", "A String");

createTest("true", true);
createTest("false", false);
createTest("!true", false);
createTest("!false", true);

createTest("20 > 18", true)

createTest("10-5*2", 0);
createTest("(10-5)*2", 10);

createTest("2^3", 8);

test("Test the expression 'age > 18' with Unknown variable", () => {
  let interpreter = new Interpreter();
  const parser = new Parser();
  const expression = parser.parse("age > 18");
  expect(() => {
    interpreter.interpret(expression);
  }).toThrow("Undefined variable name 'age'");
});

test("Test the expression 'height * 2 == 10' with Known variable", () => {
  let environment = new Environment();
  environment.define("height", 5);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("height * 2 == 10");
  const result = interpreter.interpret(expression);
  expect(result).toBe(true);
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




test("Evaluate Unary Negation on variable '-age' where age is 25", () => {
  console.log("\nEvaluating '-age' where age is 25");
  let environment = new Environment();
  environment.define("age", 25);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("-age");
  const result = interpreter.interpret(expression);
  expect(result).toBe(-25);
});

test("Evaluate Unary NOT on variable '!registered' where registered is true", () => {
  console.log("\nEvaluating '!registered' where registered is true");
  let environment = new Environment();
  environment.define("registered", true);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("!registered");
  const result = interpreter.interpret(expression);
  expect(result).toBe(false);
});

test("Evaluate Direct Assignment to a Variable 'x = 10'", () => {
  console.log("\nEvaluating Direct Assignment 'x = 10'");
  const parser = new Parser();
  let expression = parser.parse("x = 10");
  let environment = new Environment();
  let interpreter = new Interpreter(environment);
  //console.log(`Environment: `, environment.toString());
  let result = interpreter.interpret(expression);
  console.log(`Result of Assignment: ${result}`);
  console.log(environment.toString());

  // The result of the assignment expression itself should be the value assigned, according to most language specifications
  expect(result).toBe(10);

  const value = environment.get("x");
  console.log(`new value in Environment: ${value}`);
  expect(value).toBe(10);

});




// test("Evaluate Member Expression  'person.age' = 18", () => {
//   console.log("\nEvaluating Assignment 'person.age = 18'");
//   const parser = new Parser();
//   let expression = parser.parse("person.age = 18");

//   let environment = new Environment();
//   environment.set("person", {});
//   let interpreter = new Interpreter(environment);
//   let json = ASTtoJSON.toJson(expression);
//   console.log("ASTtoJSON.toString   : ", json);

//   let result = interpreter.interpret(expression);
//   console.log(`Result: ${result}`);

//   expression = parser.parse("person.age == 18");
//   result = interpreter.interpret(expression);
//   console.log(`Result: ${result}`);
//   console.log(`Environment: `, environment.toString());
//   expect(result).toBe(true);
// });

// test("Evaluate Assignment Expression  'person.age' = 18", () => {
//   console.log("\nEvaluating Assignment 'person.age = 18'");
//   let interpreter = new Interpreter();
//   const parser = new Parser();
//   const expression = parser.parse("person.age = 18");
//   const json = ASTtoJSON.toJson(expression);
//   console.log("ASTtoJSON.toString   : ", json);
//   const result = interpreter.interpret(expression);
//   console.log(`Result: ${result}`);
//   expect(result).toBe(true);
// });

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