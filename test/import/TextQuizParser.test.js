import { TextQuizParser } from '../../src/import/TextQuizParser';

//const path = "./test/import/text_English_grammar_quiz.txt";
const path = "./test/import/text_Attendee_confirmation_survey.txt";
const file = Bun.file(path);
const quizText = await file.text();

describe('TextQuizParser', () => {
  const parser = new TextQuizParser(quizText);
  const surveyModel = parser.parse();

  test('it should correctly set the survey title', () => {
    expect(surveyModel.getTitle()).toBe('English Grammar Quiz');
  });

  test('it should parse questions correctly with exact titles', () => {
    const questions = surveyModel.getQuestions();
    expect(questions.length).toBe(5);
    expect(questions[0].title).toBe('You can stand______the tall building to see the whole city.');
    expect(questions[1].title).toBe("Gina, have you ever heard of the Ginat's Causeway? -Sure, it's one of the most fantastic______in the world.");
    expect(questions[2].title).toBe('The banana pie tastes delicious. Could I have another______?');
    expect(questions[3].title).toBe('There are some fish swimming______the bottom of the river.');
    expect(questions[4].title).toBe('Describe the city you live in');
  });

  test('each "single-choice" question should have correct items', () => {
    const questions = surveyModel.getQuestions();
    expect(questions[0].items).toEqual([
      "A. at the bottom of",
      "B. on top of",
      "C. in top of",
      "D. at the end of"
    ]);
    expect(questions[1].items).toEqual([
      "A. ways",
      "B. dreams",
      "C. trips",
      "D. wonders"
    ]);
  });  
});