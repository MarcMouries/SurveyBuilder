import { describe, test, expect, it } from "bun:test";
import { SurveyModel } from "../src/SurveyModel";
import { ISurveyConfig } from "../src/ISurveyConfig";

let surveyConfig: ISurveyConfig = {
  surveyTitle: "Example Survey",
  surveyDescription: "Description here",
  questions: []
};


describe('validateSurveySetup', () => {
  test('should throw an error for missing config', () => {
    expect(() => new SurveyModel(null)).toThrow('Config object is required');
  });

  test('should throw an error for invalid question type', () => {
    const invalidTypeConfig = {
      ...surveyConfig,
      questions: [{
        ...surveyConfig.questions[0],
        name: "test", title: "title", type: "invalid-type"
      }]
    };
    expect(() => new SurveyModel(invalidTypeConfig)).toThrow(
      `Question type "invalid-type" at index 0 is not allowed. Allowed types are: ${SurveyModel.ALLOWED_QUESTION_TYPES.join(', ')}`
    );
  });

  test('should throw an error for duplicate question names', () => {
    const duplicateNamesConfig = {
      ...surveyConfig,
      questions: [
        {
          name: "duplicate_name",
          title: "First Question with duplicate name",
          type: "single-choice",
        },
        {
          name: "duplicate_name",
          title: "Second Question with duplicate name",
          type: "single-choice",
        }
      ]
    };
    expect(() => new SurveyModel(duplicateNamesConfig)).toThrow(
      `Question #2 has the same name "duplicate_name" as question #1. Please ensure all question names are unique.`
    );
  });


  test('should validate successfully for a correct config', () => {
    expect(() => new SurveyModel(surveyConfig)).not.toThrow();
  });
});


test("Dynamic title is correctly updated based on response", () => {
  const questions = [
    {
      name: "favorite_color",
      title: "What is your favorite color?",
      type: "single-choice",
    },
    {
      name: "color_reason",
      title: "Why do you like {{favorite_color}}?",
      type: "single-line-text"
    }
  ];
  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);
  surveyModel.startSurvey();
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
  surveyModel.startSurvey();
  let question = surveyModel.getQuestionByName("greeting");
  console.log("Question Before: ", question?.title);

  // Simulating responses for both placeholders
  surveyModel.updateResponse("userName", "John Doe");
  surveyModel.updateResponse("orderId", "123456");

  console.log("Question After : ", question?.title);

  expect(question?.title).toBe("Dear John Doe, your order 123456 is confirmed.");
});


test("Dynamic title updates based on conditionally influenced responses", () => {
  const questions = [
    {
      name: "favorite_season",
      title: "What is your favorite season?",
      type: "single-choice",
      options: ["Spring", "Summer", "Fall", "Winter"]
    },
    {
      name: "activity_desired",
      title: "What activity do you like doing during the {{favorite_season}} season?",
      type: "single-line-text"
    }
  ];

  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);
  surveyModel.startSurvey();
  surveyModel.updateResponse("favorite_season", "Winter");
  let activityTitle = surveyModel.getQuestionByName("activity_desired")?.title;

  expect(activityTitle).toBe("What activity do you like doing during the Winter season?");
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
  surveyModel.startSurvey();
  let questionBeforeUpdate = surveyModel.getQuestionByName("pet_name");
  console.log("Question visibility before: ", questionBeforeUpdate?.isVisible);

  surveyModel.updateResponse("has_pet", "Yes");

  let questionAfterUpdate = surveyModel.getQuestionByName("pet_name");
  console.log("Question visibility after : ", questionAfterUpdate?.isVisible);

  expect(questionAfterUpdate?.isVisible).toBe(true);
});

test("Dynamic response updates visibility and re-evaluation", () => {
  const questions = [
    {
      name: "attending_status",
      title: "Will you be attending the event in-person or virtually?",
      type: "single-choice",
      options: ["In-Person", "Virtually"]
    },
    {
      name: "dietary_restrictions",
      title: "Do you have any dietary restrictions?",
      type: "yes-no",
      visible_when: "attending_status == 'In-Person'"
    }
  ];

  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);
  surveyModel.startSurvey();
  let dietaryVisibilityBefore = surveyModel.getQuestionByName("dietary_restrictions")?.isVisible;

  // Update attending status to 'In-Person'
  surveyModel.updateResponse("attending_status", "In-Person");
  let dietaryVisibilityAfter = surveyModel.getQuestionByName("dietary_restrictions")?.isVisible;

  expect(dietaryVisibilityBefore).toBe(false);
  expect(dietaryVisibilityAfter).toBe(true);
});


test("Complex condition evaluation affects multiple dependent questions", () => {
  const questions = [
    {
      name: "attending_status",
      title: "Will you be attending the event in-person or virtually?",
      type: "single-choice",
      options: ["In-Person", "Virtually"]
    },
    {
      name: "has_dietary_restrictions",
      title: "Do you have any dietary restrictions?",
      type: "yes-no",
      visible_when: "attending_status == 'In-Person'"
    },
    {
      name: "specify_dietary_restrictions",
      title: "Please specify your dietary restrictions.",
      type: "single-line-text",
      visible_when: "attending_status == 'In-Person' && has_dietary_restrictions == 'Yes'"
    }
  ];

  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);
  surveyModel.startSurvey();
  // Initial visibility and response checks
  surveyModel.updateResponse("attending_status", "In-Person");
  surveyModel.updateResponse("has_dietary_restrictions", "Yes");

  let specifyVisibility = surveyModel.getQuestionByName("specify_dietary_restrictions")?.isVisible;

  expect(specifyVisibility).toBe(true);
});





describe('Question navigation', () => {
  const questions = [
    { name: "q1", title: "1st Question", type: "yes-no", isVisible: true },
    { name: "q2", title: "2nd Question", type: "yes-no", isVisible: false, visible_when: "q1 == 'Yes'" },
    { name: "q3", title: "3rd Question", type: "yes-no", isVisible: true }
  ];
  surveyConfig.questions = questions;
  const surveyModel = new SurveyModel(surveyConfig);
  surveyModel.startSurvey();
  test('The next visible question to be fetched', () => {
    let firstQuestion = surveyModel.getCurrentQuestion();
    expect(firstQuestion?.name).toBe("q1");
  });

  test('expecting q2 to not be visible when q1 is answered "No"', () => {
    surveyModel.updateResponse("q1", "No");
    let secondQuestion = surveyModel.getNextVisibleQuestion();
    expect(secondQuestion?.name).toBe("q3");
  });


  test('expecting q2 to now be visible', () => {
    surveyModel.startSurvey();
    surveyModel.updateResponse("q1", "Yes");
    let secondQuestion = surveyModel.getNextVisibleQuestion();
    expect(secondQuestion?.name).toBe("q2");
  });

  test('Next visible question should now be q3', () => {
    let thirdQuestion = surveyModel.getNextVisibleQuestion();
    expect(thirdQuestion?.name).toBe("q3");
  });

  test('Moving back to the previous question, expecting q2, which became visible earlier', () => {
    let previousQuestion = surveyModel.getPreviousVisibleQuestion();
    expect(previousQuestion?.name).toBe("q2");
  });

});