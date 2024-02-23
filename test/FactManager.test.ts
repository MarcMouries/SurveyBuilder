import { expect, test } from "bun:test";
import { FactsManager } from '../src/parser/FactsManager';


const facts_questions_event = {
  "Attending_Status": {
     "title": "Will you be attending the event in-person or virtually?",
     "options": ["In-Person", "Virtually"],
     "answer": "Virtually"
   }
   ,
  "Has_Dietary_Restrictions": {
    "title": "Do you have any dietary restrictions?",
    "options": ["Yes", "No"],
    "visible_when": "Attending_Status.answer = 'In-Person'",
    "answer": "Yes",
    "isVisible": false
  }
  ,
  "Specify_Dietary_Restrictions": {
    "title": "Please specify your dietary restrictions.",
    "type": "text",
    "visible_when": "Attending_Status.answer = 'In-Person' and Has_Dietary_Restrictions.answer = 'Yes'",
    "answer": ""
  },
  "Reason_Attending_Virtually": {
    "title": "What's the main reason for not attending in-person?",
    "options": ["Scheduling conflicts", "Travel distance"],
    "visible_when": "Attending_Status.answer = 'Virtually'",
    "answer": ""
  },
  "Favorite_Season": {
    "title": "What is your favorite season?",
    "options": ["Spring", "Summer", "Fall", "Winter"],
    "answer": "Summer"
  },
  "Activity_Desired": {
    "title": "What activity do you like doing during the {{Favorite_Season.answer}} season?",
  },
  "Participant_Age": {
    "title": "What is your age?",
    "answer": 25
  },
  "Discount_Eligibility": {
    "title": "You are eligible for a discount!",
    "visible_when": "Participant_Age.answer > 22"
  }
};


test("Evaluate initial Attending_Status", () => {
   const factsManager = new FactsManager( {
    "Attending_Status": {
      "title": "Will you be attending the event in-person or virtually?",
      "options": ["In-Person", "Virtually"],
      "answer": "Virtually"
    }});
   const result = factsManager.evaluate("Attending_Status.answer = 'Virtually'");
   console.log("RESULT  = ", result);
   expect(result).toBe(true);
});


test("Update Attending_Status and re-evaluate", () => {
  const factsManager = new FactsManager(facts_questions_event);
  const update = factsManager.update("Attending_Status.answer",  "In-Person" );
  console.log("=> update=", update);
  expect(factsManager.evaluate("Attending_Status.answer = 'In-Person'")).toBe(true);
  expect(factsManager.evaluate("Has_Dietary_Restrictions.isVisible = true")).toBe(true);
  expect(factsManager.evaluate("Has_Dietary_Restrictions.isVisible")).toBe(true);
});


test("Update Attending_Status and re-evaluate", () => {
  const factsManager = new FactsManager(facts_questions_event);
  factsManager.update("Attending_Status", { answer: "In-Person" });
  expect(factsManager.evaluate("Attending_Status.answer = 'In-Person'")).toBe(true);
});

test("Evaluate Has_Dietary_Restrictions with updated Attending_Status", () => {
  const factsManager = new FactsManager(facts_questions_event);
  factsManager.update("Attending_Status", { answer: "In-Person" }); 
  expect(factsManager.evaluate("Has_Dietary_Restrictions.answer = 'Yes'")).toBe(true);
});

test("Complex condition evaluation with updated facts", () => {
  const factsManager = new FactsManager(facts_questions_event);
  factsManager.update("Attending_Status", { answer: "In-Person" }); 
  expect(factsManager.evaluate("Attending_Status.answer = 'In-Person' and Has_Dietary_Restrictions.answer = 'Yes'")).toBe(true);
});

test("Update Title reference", () => {
  const factsManager = new FactsManager(facts_questions_event);
  factsManager.update("Favorite_Season", { answer: "Winter" });
  expect(factsManager.evaluate("Activity_Desired.title = 'What activity do you like doing during the Summer season?'")).toBe(true);
});

test("Test equality > 18", () => {
  const factsManager = new FactsManager(facts_questions_event);
  expect(factsManager.evaluate("Participant_Age.answer > 18 ")).toBe(true);
});

test("Test equality > 18 and < 30", () => {
  const factsManager = new FactsManager(facts_questions_event);
  expect(factsManager.evaluate("Participant_Age.answer > 18 and Participant_Age.answer < 30 ")).toBe(true);
});
test("Test equality is between 18 and 30", () => {
  const factsManager = new FactsManager(facts_questions_event);
  expect(factsManager.evaluate("Participant_Age.answer is between 18 and 30 ")).toBe(true);
});
// const evaluator = new ConditionEvaluator( facts_questions);
// evaluator.evaluate('favorite_color is blue') => true;
// evaluator.update({favorite_color: "green"}) => the favorite_color is "green"
// evaluator.evaluate('favorite_color is blue') => false;
// const facts_questions = {
//   question_1: "Yes",
//   question_2: 4,
//   question_3: 5,
//   question_4: ["Spring", "Summer", "Autumn", "Winter"],
//   favorite_color: "blue",
//   favorite_season: "blue",
//   question_A: {
//     title: "What do you like doing during the {{favorite-season}} season",
//     answer: ""
//   }

// };
// have you ever been Married?
// if yes, show name_of_current_spouse


// const evaluator = new ConditionEvaluator( facts_questions);
// evaluator.evaluate('favorite_color is blue') => true;
// evaluator.update({favorite_color: "green"}) => the favorite_color is "green"
// evaluator.evaluate('favorite_color is blue') => false;


// evaluator.evaluate('favorite_color is blue') => false;


// evaluator.if('favorite_color changes').then() 


// test("favorite_color is blue", () => {
//   expect(evaluator.evaluateCondition('favorite_color is blue', facts)).toBe(true);
// });

// test("question_2 is greater or equal to 4", () => {
//   expect(evaluator.evaluateCondition("question_2 is greater or equal to 4", facts)).toBe(true);
// });

// test("question_4 contains Winter", () => {
//   expect(evaluator.evaluateCondition('question_4 contains "Winter"', facts)).toBe(true);
// });

// test("question_3 is greater than 6", () => {
//   expect(evaluator.evaluateCondition("question_3 is greater than 6", facts)).toBe(false);
// });
// test("question_3 = 5", () => {
//   expect(evaluator.evaluateCondition("question_3 = 5", facts)).toBe(true);
// });

// test("question_3 > 4 and question_3 < 6", () => {
//   expect(evaluator.evaluateCondition("question_3 > 4 and question_3 < 6", facts)).toBe(true);
// });

// test("question_3 > 4 and question_3 < 6", () => {
//   expect(evaluator.evaluateCondition("question_3 > 4 and question_3 < 6", facts)).toBe(true);
// });




//  test("4 > question_3 < 6", () => {
//    expect(evaluator.evaluateCondition("4 > question_3 < 6", facts)).toBe(true);
//  });

//  test("question_3 is greater than question_2", () => {
//    expect(evaluator.evaluateCondition("question_3 is greater than question_2", facts)).toBe(true);
//  });
