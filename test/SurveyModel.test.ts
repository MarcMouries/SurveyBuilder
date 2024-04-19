import { describe, test, expect, it } from "bun:test";
import { SurveyModel } from "../src/SurveyModel";
import { ISurveyConfig } from "../src/ISurveyConfig";

let surveyConfig: ISurveyConfig = {
  surveyTitle: "Example Survey",
  surveyDescription: "Description here",
  questions: []
};



test("Dynamic title is correctly updated based on response", () => {
  const questions = [
    {
      name: "favorite_color",
      title: "What is your favorite color?",
      type: "one-choice",
    },
    {
      name: "color_reason",
      title: "Why do you like {{favorite_color}}?",
      type: "single-line-text"
    }
  ];
  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);
  let question = surveyModel.getQuestionByName("color_reason");
  console.log("Question Before: ", question?.title);
  surveyModel.updateResponse("favorite_color", "blue");
  console.log("Question After : ", question?.title);
  expect(question?.title).toBe("Why do you like blue?");
});

test("Dynamic title is correctly updated based on multiple responses", () => {
  const questions = [
    {
      name: "greeting",
      title: "Dear {{userName}}, your order {{orderId}} is confirmed.",
      type: "single-line-text"
    }
  ];

  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);
  let question = surveyModel.getQuestionByName("greeting");
  console.log("Question Before: ", question?.title);

  // Simulating responses for both placeholders
  surveyModel.updateResponse("userName", "John Doe");
  surveyModel.updateResponse("orderId", "123456");

  console.log("Question After : ", question?.title);

  expect(question?.title).toBe("Dear John Doe, your order 123456 is confirmed.");
});


test("Question visibility is updated based on condition", () => {
  const questions = [
    {
      name: "has_pet",
      title: "Do you have any pets?",
      type: "yes-no",
    },
    {
      name: "pet_name",
      title: "What is your pet's name?",
      type: "single-line-text",
      visible_when: "has_pet == 'Yes'"
    }
  ];

  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);
  let questionBeforeUpdate = surveyModel.getQuestionByName("pet_name");
  console.log("Question visibility before: ", questionBeforeUpdate?.isVisible);

  surveyModel.updateResponse("has_pet", "Yes");

  let questionAfterUpdate = surveyModel.getQuestionByName("pet_name");
  console.log("Question visibility after : ", questionAfterUpdate?.isVisible);

  expect(questionAfterUpdate?.isVisible).toBe(true);
});


describe('validateSurveySetup', () => {
  test('should throw an error for missing config', () => {
    expect(() => new SurveyModel(null)).toThrow('Config object is required');
  });

  test('should throw an error for invalid question type', () => {
    const invalidTypeConfig = {
      ...surveyConfig,
      questions: [{ ...surveyConfig.questions[0], 
        name: "test", title: "title", type: "invalid-type" }]
    };
    expect(() => new SurveyModel(invalidTypeConfig)).toThrow('Question type "invalid-type" at index 0 is not allowed. Allowed types are: yes-no, select, one-choice, followup, multi-choice, ranking, multi-line-text, single-line-text');
  });

  test('should validate successfully for a correct config', () => {
    expect(() => new SurveyModel(surveyConfig)).not.toThrow();
  });
});

test("Handles visibility based on conditions correctly", () => {
  const questions = [
    { name: "q1", title: "First Question", type: "yes-no", isVisible: true },
    // This question is initially not visible, becomes visible based on "q1" response
    { name: "q2", title: "Second Question", type: "yes-no", isVisible: false, visible_when: "q1 == 'Yes'" },
    { name: "q3", title: "Third Question", type: "yes-no", isVisible: true }
  ];
  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);

  // Initially, q2 is not visible
  let nextQuestion = surveyModel.nextVisibleQuestion(0);
  expect(nextQuestion?.name).toBe("q3");

  // Simulate response to q1 that makes q2 visible
  surveyModel.updateResponse("q1", "Yes");
  nextQuestion = surveyModel.nextVisibleQuestion(0);
  expect(nextQuestion?.name).toBe("q2");

  // Check if q2 is correctly identified as the previous question from q3 after becoming visible
  const prevQuestion = surveyModel.prevVisibleQuestion(2); // Index of q3 after update
  expect(prevQuestion?.name).toBe("q2");
});
