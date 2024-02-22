import { expect, test } from "bun:test";
import { ConditionEvaluator, ConditionData, ConditionTree } from "../src/parser/ConditionEvaluator";

// Sample data to use in evaluations
const sampleData: ConditionData = {
  age: 22,
  user: {
    age: 30,
    name: "John Doe",
    preferences: {
      newsletter: true,
      themes: ["dark", "contrast"]
    }
  }
};

// Define a simple condition tree for testing
const simpleCondition: ConditionTree = {
  type: 'CONDITION',
  left: "user.age",
  operator: ">=",
  right: 18
};
test("evaluates a simple condition", () => {
  expect(ConditionEvaluator.evaluate(simpleCondition, sampleData)).toBe(true);
});

// Define a complex condition tree with AND logic
const andCondition: ConditionTree = {
  type: "AND",
  conditions: [
    { 
      type: 'CONDITION',
      left: "user.age", 
      operator: ">=", 
      right: 18 
    },
    { 
      type: 'CONDITION',
      left: "user.preferences.newsletter", 
      operator: "=", 
      right: true 
    }
  ]
};

// Define a complex condition tree with OR logic
const orCondition: ConditionTree = {
  type: "OR",
  conditions: [
    { 
      type: 'CONDITION',
      left: "user.age", 
      operator: "<", 
      right: 18 
    },
    { 
      type: 'CONDITION',
      left: "user.name", 
      operator: "=", 
      right: "John Doe" 
    }
  ]
};




test("evaluates a complex condition with AND logic", () => {
  expect(ConditionEvaluator.evaluate(andCondition, sampleData)).toBe(true);
});

test("evaluates a complex condition with OR logic", () => {
  expect(ConditionEvaluator.evaluate(orCondition, sampleData)).toBe(true);
});

test("evaluates a condition with 'contains' operator", () => {
  const containsCondition: ConditionTree = {
    type: 'CONDITION',
    left: "user.preferences.themes",
    operator: "contains",
    right: "dark"
  };
  expect(ConditionEvaluator.evaluate(containsCondition, sampleData)).toBe(true);
});