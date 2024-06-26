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
      const jsonAST = ASTtoJSON.toJson(expression);
      console.log("AST: ", jsonAST);
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

createTest("4 in [2, 4]", true);
createTest("2 in [1, 3]", false);


function testExpressionWithEnvironment({ description, setup, expression, expected }) {
  test(description, () => {
    const environment = new Environment();
    // Apply setup to the environment (e.g., defining variables)
    setup.forEach(({ key, value }) => environment.define(key, value));

    const interpreter = new Interpreter(environment);
    const parser = new Parser();
    const parsedExpression = parser.parse(expression);
    const result = interpreter.interpret(parsedExpression);

    expect(result).toBe(expected);
  });
}


testExpressionWithEnvironment({
  description: "Test the expression: 'List_of_Colors contains 'blue''",
  setup: [{ key: "List_of_Colors", value: ['blue', 'green'] }],
  expression: "List_of_Colors contains 'blue'",
  expected: true
});

testExpressionWithEnvironment({
  description: "Test the expression: 'blue' in List_of_Colors'",
  setup: [{ key: "List_of_Colors", value: ['blue', 'green'] }],
  expression: "'blue' in List_of_Colors",
  expected: true
});

testExpressionWithEnvironment({
  description: "Test the expression '2 in answer_list' with Known variable",
  setup: [{ key: "answer_list", value: [6, 4, 2] }],
  expression: "2 in answer_list",
  expected: true
});

testExpressionWithEnvironment({
  description: "Test the expression 'answer in ['blue', 'green']'",
  setup: [{ key: "answer", value: "green" }],
  expression: "answer in ['blue', 'green']",
  expected: true
});





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


test("Test Known variable in Binary Expression  'age' == 18", () => {
  let environment = new Environment();
  environment.define("age", 18);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age == 18");
  const result = interpreter.interpret(expression);
  expect(result).toBe(true);
});

test("Test Known variable in Binary Expression 'age >= 13 and age <= 19", () => {
  let environment = new Environment();
  environment.define("age", 18);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age >= 13 and age <= 19");
  const result = interpreter.interpret(expression);
  expect(result).toBe(true);
});

test("Test OR expression with true short-circuit with 'age > 20 or age < 30'", () => {
  let environment = new Environment();
  environment.define("age", 25);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age > 20 or age < 30");
  const result = interpreter.interpret(expression);
  expect(result).toBe(true);
});

test("Test AND expression with false short-circuit: 'age > 20 and age < 18'", () => {
  let environment = new Environment();
  environment.define("age", 15);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age > 20 and age < 18");
  const result = interpreter.interpret(expression);
  expect(result).toBe(false);
});

test("Test AND expression with both sides false: 'age > 30 and age < 10'", () => {
  let environment = new Environment();
  environment.define("age", 20);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("age > 30 and age < 10");
  const result = interpreter.interpret(expression);
  expect(result).toBe(false);
});

test("Test nested logical expressions: '(age >= 13 and age <= 19) or age == 21'", () => {
  let environment = new Environment();
  environment.define("age", 21);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("(age >= 13 and age <= 19) or age == 21");
  const result = interpreter.interpret(expression);
  expect(result).toBe(true);
});

test("Test Unary Negation on variable '-age' where age is 25", () => {
  let environment = new Environment();
  environment.define("age", 25);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("-age");
  const result = interpreter.interpret(expression);
  expect(result).toBe(-25);
});

test("Test Unary NOT on variable with expression: '!registered'", () => {
  let environment = new Environment();
  environment.define("registered", true);
  let interpreter = new Interpreter(environment);
  const parser = new Parser();
  const expression = parser.parse("!registered");
  const result = interpreter.interpret(expression);
  expect(result).toBe(false);
});

test("Test Direct Assignment to a Variable with expression: 'x = 10'", () => {
  const parser = new Parser();
  let expression = parser.parse("x = 10");
  let environment = new Environment();
  let interpreter = new Interpreter(environment);
  let result = interpreter.interpret(expression);
  expect(result).toBe(10);
  const value = environment.get("x");
  expect(value).toBe(10);
});

test("Test Member Expression  'person.age' == 18", () => {
  // Define the environment and the person
  let environment = new Environment();
  environment.set("person", {});
  let interpreter = new Interpreter(environment);

  // assign a value
  const parser = new Parser();
  let assignmentExpression = parser.parse("person.age = 18");
  // Re
  let result = interpreter.interpret(assignmentExpression);
  console.log(`Result: ${result}`);

  let equalityExpression = parser.parse("person.age == 18");
  result = interpreter.interpret(equalityExpression);
  console.log(`Result: ${result}`);
  
  //console.log(`Environment: `, environment.toString());
  //let json = ASTtoJSON.toJson(expression);
  //console.log("ASTtoJSON.toString   : ", json);
  expect(result).toBe(true);
});

function testIdentifierExtraction({ description, input, expected }) {
  test(description, () => {
    const parser = new Parser();
    const expression = parser.parse(input);
    //let json = ASTtoJSON.toJson(expression);
    //console.log("ASTtoJSON.toString   : ", json);
    const identifierList = Interpreter.extractIdentifiers(expression);
      //console.log("identifierList   : ", identifierList);

    expect(identifierList).toEqual(expect.arrayContaining(expected));
    expect(identifierList.length).toBe(expected.length);
  });
}
testIdentifierExtraction({
  description: "Extract identifiers from parsed condition",
  input: "has_pet == 'Yes'",
  expected: ["has_pet"],
});

testIdentifierExtraction({
  description: "Extract identifiers from complex parsed condition",
  input: "age > 18 and (has_pet == 'Yes' and pet_type in ['dog', 'cat'])",
  expected: ["age", "has_pet", "pet_type"],
});


// test("Test Assignment Expression  'person.age' = 18", () => {
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

//  test("Test Assignment Expression  'order.customer.age' = 18", () => {
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

//  test("Test BinaryExpression  'age' > 18", () => {
//    console.log("\nEvaluating BinaryExpression 'age > 18'");
//    let interpreter = new Interpreter();
//    const parser = new Parser();
//    const expression = parser.parse("age > 18");
//    const result = interpreter.interpret(expression);
//    console.log(`Result: ${result}`);
//    expect(result).toBe(true);
//  });