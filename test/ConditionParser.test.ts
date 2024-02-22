import { expect, test } from "bun:test";
import { ConditionParser} from "../src/parser/ConditionParser";

test("parses simple equality condition", () => {
  const result = ConditionParser.parse("question_1.answer = 'Yes'");
  expect(result).toEqual({
      type: 'CONDITION',
      left: "question_1.answer",
      operator: "=",
      right: "Yes"
  });
});


test("parses complex AND condition", () => {
  const result = ConditionParser.parse("question_1.answer = 'Yes' AND question_2.answer = 'No'");
  expect(result).toEqual({
      type: "AND",
      conditions: [
          { type: 'CONDITION', left: "question_1.answer", operator: "=", right: "Yes" },
          { type: 'CONDITION', left: "question_2.answer", operator: "=", right: "No" }
      ]
  });
});

  
test("parses complex OR condition", () => {
  const result = ConditionParser.parse("question_1.answer = 'Yes' OR question_2.answer = 'No'");
  expect(result).toEqual({
      type: "OR",
      conditions: [
          { type: 'CONDITION', left: "question_1.answer", operator: "=", right: "Yes" },
          { type: 'CONDITION', left: "question_2.answer", operator: "=", right: "No" }
      ]
  });
});
