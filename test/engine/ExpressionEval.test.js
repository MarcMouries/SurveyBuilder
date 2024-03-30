import { test, expect } from "bun:test";
import { BooleanNode, BinaryExpression, NumberNode, Identifier } from "../../src/engine/Node";

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
  const expression
     = new BinaryExpression(new Identifier("age"), ">", new NumberNode(18));
  const result = expression.evaluate(context);
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

test("Evaluate BinaryExpression comparing variable 'days' is 10", () => {
  console.log("\nEvaluating Expression comparing variable 'days' = 10");
  const expression = new BinaryExpression(new Identifier("days"), "=", new NumberNode(10));
  const result = expression.evaluate(context);
  console.log(`Result: ${result}`);
  expect(result).toBe(true);
});



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

test("Evaluate the expression a*2", () => {
  console.log("\nEvaluating the expression a*2");
  const parser = new Parser();
  const expression = parser.parse("a*2");
  const context = {  a: 5 };
  const result = expression.evaluate(context);
  console.log(`Result: ${result}`);
  expect(result).toBe(10);
});

test("Evaluate the expression '8 / 2 * 4'", () => {
  console.log("\nEvaluating the expression '8 / 2 * 4'");
  const parser = new Parser();
  const expression = parser.parse("8 / 2 * 4");

  const result = expression.evaluate();
  console.log(`Result: ${result}`);
  expect(result).toBe(16);
});

test("Evaluate the expression '8 / (2 * 4)'", () => {
  console.log("\nEvaluating the expression '8 / (2 * 4)'");
  const parser = new Parser();
  const expression = parser.parse("8 / (2 * 4)");
  const result = expression.evaluate();
  console.log(`Result: ${result}`);
  expect(result).toBe(1);
});


// BMI formula
test("BMI Formula in metric units: weight ÷ height²", () => {
  console.log("\nBMI Formula in metric units: weight ÷ height²");
  const context = {
    weight_kg: 75,
    height_mt: 1.75
  };
  const parser = new Parser();
  const expression = parser.parse("weight_kg / height_mt^2");
  const result = expression.evaluate(context);
  console.log(`Result: ${result}`);
  expect(result).toBe(24.489795918367346);
});

// Pythagorean equation: a² + b² = c²
// if a = 3 and b = 4
// c = (a^2 + b^2)^0.5
test("Pythagorean equation: a² + b² = c²", () => {
  console.log("\nPythagorean equation: a² + b² = c²");
  const context = { a: 3, b: 4 };
  const parser = new Parser();
  const expression = parser.parse("c = a^2 + b^2");
  const result = expression.evaluate(context);
  console.log(`Result: ${result}`);
  console.log(`context: ${context}`);
  expect(result).toBe(25);
});




const expression = new BinaryExpression(new NumberNode(1), "+", new NumberNode(2));
console.log("expression --START ------");
console.log(expression.toJSON());
console.log(expression.summarize());
console.log("expression --END ------");
