import { expect, test } from "bun:test";
import { ExpressionEvaluator } from "../src/parser/ExpressionEvaluator";
import { Condition, CompoundExpression, IdentifierNode, LiteralNode, NodeType, Data } from "../src/parser/Expressions";

// helper function to create literal nodes
function literal(value: string | number | boolean): LiteralNode {
  return { type: NodeType.LITERAL, value };
}
// helper function to create identifier nodes
function identifier(name: string): IdentifierNode {
  return { type: NodeType.IDENTIFIER, name };
}

// Sample data for evaluations
const sampleData: Data = {
  age: 22,
  user: {
    age: 30,
    name: "John Doe",
    isMarried: true,
    preferences: {
      newsletter: true,
      themes: ["dark", "contrast"]
    }
  }
};

test("evaluates a literal comparison", () => {
  const literalCondition: Condition = {
    type: NodeType.CONDITION,
    left: literal(10),
    operator: "<",
    right: literal(20)
  };
  expect(ExpressionEvaluator.evaluate(literalCondition, sampleData)).toBe(true);
});



const simpleCondition: Condition = {
  type: NodeType.CONDITION,
  left: identifier("user.age"),
  operator: ">=",
  right: literal(18)
};

test("evaluates a simple condition", () => {
  expect(ExpressionEvaluator.evaluate(simpleCondition, sampleData)).toBe(true);
});

test("evaluates nested property access", () => {
  const nestedCondition: Condition = {
    type: NodeType.CONDITION,
    left: identifier("user.preferences.newsletter"),
    operator: "=",
    right: literal(true)
  };
  expect(ExpressionEvaluator.evaluate(nestedCondition, sampleData)).toBe(true);
});

test("evaluates compound conditions with AND", () => {
  const compoundAndCondition: CompoundExpression = {
    type: NodeType.COMPOUND,
    operator: 'AND',
    conditions: [
      {
        type: NodeType.CONDITION,
        left: identifier("age"),
        operator: ">",
        right: literal(20)
      },
      {
        type: NodeType.CONDITION,
        left: identifier("user.preferences.newsletter"),
        operator: "=",
        right: literal(true)
      }
    ] as Condition[]
  };
  expect(ExpressionEvaluator.evaluate(compoundAndCondition, sampleData)).toBe(true);
});
test("evaluates 'contains' operator", () => {
  const containsCondition: Condition = {
    type: NodeType.CONDITION,
    left: identifier("user.preferences.themes"),
    operator: "contains",
    right: literal("dark")
  };
  expect(ExpressionEvaluator.evaluate(containsCondition, sampleData)).toBe(true);
});

test("evaluates compound conditions with OR", () => {
  const compoundOrCondition: CompoundExpression = {
    type: NodeType.COMPOUND,
    operator: 'OR',
    conditions: [
      {
        type: NodeType.CONDITION,
        left: identifier("age"),
        operator: ">",
        right: literal(25)
      },
      {
        type: NodeType.CONDITION,
        left: identifier("user.name"),
        operator: "=",
        right: literal("John Doe")
      }
    ] as Condition[]
  };
  expect(ExpressionEvaluator.evaluate(compoundOrCondition, sampleData)).toBe(true);
});

test("evaluates a boolean expression", () => {
  const booleanCondition: IdentifierNode = identifier("user.isMarried");
  const expectedResult = true;
  expect(ExpressionEvaluator.evaluate(booleanCondition, sampleData)).toBe(expectedResult);
});