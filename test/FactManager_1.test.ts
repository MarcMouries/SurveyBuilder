import { expect, test } from "bun:test";
import { FactsManager } from '../src/parser/FactsManager';

const facts = {
  question_1: { answer: "Yes" },
  question_2: { answer: "No" }
};

const factsManager = new FactsManager(facts);

test("evaluates simple equality condition", () => {
  expect(factsManager.evaluate("question_1.answer = 'Yes'")).toBe(true);
  expect(factsManager.evaluate("question_2.answer = 'Yes'")).toBe(false);
});

test("evaluates AND condition", () => {
  expect(factsManager.evaluate("question_1.answer = 'Yes' AND question_2.answer = 'No'")).toBe(true);
});

test("evaluates OR condition", () => {
  expect(factsManager.evaluate("question_1.answer = 'Yes' OR question_2.answer = 'Yes'")).toBe(true);
});
