import { expect, test } from "bun:test";
import { ExpressionParser } from "../src/parser/ExpressionParser";
import { NodeType, Condition, CompoundExpression, Node, IdentifierNode, LiteralNode } from "../src/parser/Expressions";

// Helper functions for creating test expectations
const identifier = (name: string): IdentifierNode => ({ type: NodeType.IDENTIFIER, name });
const literal = (value: string | number | boolean): LiteralNode => ({ type: NodeType.LITERAL, value });


test("parses simple equality condition", () => {
  const result = ExpressionParser.parse("question_1.answer = 'Yes'");
  const expected: Condition = {
    type: NodeType.CONDITION,
    left: identifier("question_1.answer"),
    operator: "=",
    right: literal("Yes")
  };
  expect(result).toEqual(expected);
});

test("parses complex AND condition", () => {
  const result = ExpressionParser.parse("question_1.answer = 'Yes' AND question_2.answer = 'No'");
  
  const expected = {
    type: NodeType.COMPOUND,
    operator: 'AND',
    conditions: [
      {
        type: NodeType.CONDITION,
        left: identifier("question_1.answer"),
        operator: "=",
        right: literal('Yes')
      },
      {
        type: NodeType.CONDITION,
        left: identifier("question_2.answer"),
        operator: "=",
        right: literal('No')
      }
    ]
  };

  expect(result).toEqual(expected);
});
test("parses complex OR condition", () => {
  const result = ExpressionParser.parse("question_1.answer = 'Yes' OR question_2.answer = 'No'");

  const expected = {
    type: NodeType.COMPOUND,
    operator: 'OR',
    conditions: [
      {
        type: NodeType.CONDITION,
        left: identifier("question_1.answer"),
        operator: "=",
        right: literal('Yes')
      },
      {
        type: NodeType.CONDITION,
        left: identifier("question_2.answer"),
        operator: "=",
        right: literal('No')
      }
    ]
  };

  expect(result).toEqual(expected);
});

test("parses boolean condition", () => {
  const result = ExpressionParser.parse("Attending_Status.isVisible = true");
  const expected: Condition = {
    type: NodeType.CONDITION,
    left: identifier("Attending_Status.isVisible"),
    operator: "=",
    right: literal(true)
  };
  expect(result).toEqual(expected);
});
test("evaluates property truthiness", () => {
  const result = ExpressionParser.parse("Attending_Status.isVisible");
  const expected: IdentifierNode = {
    type: NodeType.IDENTIFIER,
    name: "Attending_Status.isVisible"
  };
  expect(result).toEqual(expected);
});
