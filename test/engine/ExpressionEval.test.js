import { test, expect } from "bun:test";
import { BooleanNode, BinaryExpression, NumberNode, VariableNode } from "../../src/engine/Node";

import { Parser } from "../../src/engine/Parser";

const context = {
  attending: true,
  days : 10,
  Person: {
    name : "John",
    marital_status : "Married",
    age: 40,
   },
};

const objects= 
[
  {
    "name": "message",
    "message": "Hello, {{person.name}}!"
  },
  {
    Template: {
      "name": "message",
      "message": "Hello, {{person.name}}!"
    }
  },
  {
    Person: {
      name : "John",
    }
  },
];
console.log(objects);


test("Evaluate BinaryExpression using nested property 'Person.age' > 18", () => {
  console.log("\nEvaluating BinaryExpression using nested property 'Person.age'");
  const complexExpression
     = new BinaryExpression(new VariableNode("Person.age"), ">", new NumberNode(18));
  const result = complexExpression.evaluate(context);
  console.log(`Result: ${result}`);
  expect(result).toBe(true);
});

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



  // Construct the expression 2^2

test("Evaluate the expression 2^2", () => {
  console.log("\nEvaluating the expression 2^2");
  const expression = new BinaryExpression(new NumberNode(2), '^', new NumberNode(2));
  const result = expression.evaluate({});
  console.log(`Result: ${result}`);
  expect(result).toBe(4);
});

test("Evaluate the expression 2^2", () => {
  console.log("\nEvaluating the expression 2^2");
  const parser = new Parser();
  const expression = parser.parse("2^2");
  const result = expression.evaluate({});
  console.log(`Result: ${result}`);
  expect(result).toBe(4);
});
test("Evaluate the expression 2*3^2", () => {
  console.log("\nEvaluating the expression 2*3^2");
  const parser = new Parser();
  const expression = parser.parse("2*3^2");
  const result = expression.evaluate({});
  console.log(`Result: ${result}`);
  expect(result).toBe(18);
});

// BMI formula
/* 
const context = {
  weight_in_kg: 68,
  height_in_meters: 1.75
};
*/

test("Evaluate the expression a*2", () => {
  console.log("\nEvaluating the expression a*2");
  const parser = new Parser();
  const expression = parser.parse("a*2");
  const context = {  a: 5 };
  const result = expression.evaluate(context);
  console.log(`Result: ${result}`);
  expect(result).toBe(10);
});


const expression = new BinaryExpression(new NumberNode(1), "+", new NumberNode(2));
console.log("expression --START ------");
console.log(expression.toJSON());
console.log(expression.summarize());
console.log("expression --END ------");
