import { test, expect } from "bun:test";
import { ASTtoString } from "../../src/engine/ast/ASTtoString";
import { ASTtoJSON } from "../../src/engine/ast/ASTtoJSON";
import { Parser } from "../../src/engine/Parser";

// Helper function to handle repetitive tasks
function testExpression(input, expected) {
  const parser = new Parser();
  const expression = parser.parse(input);
  const result = ASTtoString.toString(expression);

  try {
    expect(result).toBe(expected);
  } catch (error) {
    console.log("Result: : ", result);
    const json = ASTtoJSON.toJson(expression);
    console.log("toString: ", json);
    throw error; // Rethrow the error to ensure the test fails.
  }
}

// Function to automatically generate test description and execute test
function generateTest(input, expected) {
  test(`Test the expression: ${input}`, () => {
    testExpression(input, expected);
  });
}

// Use the generateTest function to create tests
generateTest("age > 18",       "(age > 18)");

generateTest("2 * 3 ^ 2",      "(2 * (3 ^ 2))");

generateTest("(2 * (3 ^ 2))",  "(2 * (3 ^ 2))");
