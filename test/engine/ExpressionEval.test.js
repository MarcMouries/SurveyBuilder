import { test, expect } from "bun:test";
import { BooleanNode, BinaryExpression, NumberNode, VariableNode } from "../../src/engine/Node";

const context = {
  attending: true,
  days : 10,
  Person: {
    name : "John",
    marital_status : "Married",
    age: 40,
   }
};

test("Evaluate BooleanNode with true", () => {
  console.log("\nEvaluating BooleanNode with true");
  const expression1 = new BooleanNode(true);
  const result = expression1.evaluate(context);
  console.log(`Result: ${result}`);
  expect(result).toBe(true);
});

test("Evaluate BinaryExpression comparing variable 'days' = 10", () => {
  console.log("\nEvaluating Expression comparing variable 'days' = 10");
  const expression = new BinaryExpression(new VariableNode("days"), "=", new NumberNode(10));
  const result = expression.evaluate(context);
  console.log(`Result: ${result}`);
  expect(result).toBe(true);
});

test("Evaluate BinaryExpression using nested property 'Person.age'", () => {
  console.log("\nEvaluating BinaryExpression using nested property 'Person.age'");
  const complexExpression
     = new BinaryExpression(new VariableNode("Person.age"), ">", new NumberNode(18));
  const result = complexExpression.evaluate(context);
  console.log(`Result: ${result}`);
  expect(result).toBe(true);
});

  // Construct the expression 2^2

test("Evaluate the expression 2^2", () => {
  console.log("\nEvaluating the expression 2^2");
  const expression = new BinaryExpression(new NumberNode(2), '^', new NumberNode(2));
  const result = expression.evaluate({});
  console.log(`Result: ${result}`);
  expect(result).toBe(4);
});

// BMI formula
/* 
const context = {
  weight_in_kg: 68,
  height_in_meters: 1.75
};
*/
const expression = new BinaryExpression(new NumberNode(1), "+", new NumberNode(2));
console.log("expression --START ------");
console.log(expression.toJSON());
console.log(expression.summarize());
console.log("expression --END ------");
