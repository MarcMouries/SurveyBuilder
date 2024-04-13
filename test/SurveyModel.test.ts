import { test, expect } from "bun:test";
import { SurveyModel } from "../src/SurveyModel"; 

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
      type: "text"
    }
  ];

  const surveyModel = new SurveyModel(questions);
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
      type: "text"
    }
  ];

  const surveyModel = new SurveyModel(questions);
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
        type: "text",
        visible_when: "has_pet == 'Yes'"
      }
    ];
  
    const surveyModel = new SurveyModel(questions);
  
    let questionBeforeUpdate = surveyModel.getQuestionByName("pet_name");
    console.log("Question visibility before: ", questionBeforeUpdate?.isVisible);
  
    surveyModel.updateResponse("has_pet", "Yes");
  
    let questionAfterUpdate = surveyModel.getQuestionByName("pet_name");
    console.log("Question visibility after : ", questionAfterUpdate?.isVisible);
  
    expect(questionAfterUpdate?.isVisible).toBe(true);
  });
  

