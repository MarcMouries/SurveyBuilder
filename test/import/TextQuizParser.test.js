import { TextQuizParser } from '../../src/import/TextQuizParser';

const path = "./test/import/text_Attendee_confirmation_survey.txt";
const file = Bun.file(path);
const quizText = await file.text();

describe('TextQuizParser', () => {
  const parser = new TextQuizParser(quizText);
  const surveyModel = parser.parse();

  test('it should correctly set the survey title', () => {
    expect(surveyModel.getTitle()).toBe('Attendee confirmation survey');    
  });

  test('it should parse questions correctly with exact titles', () => {
    const questions = surveyModel.getQuestions();
    expect(questions.length).toBe(10);
    expect(questions[0].title).toBe('Which date can you attend?');
    expect(questions[1].title).toBe("Full name");
    expect(questions[2].title).toBe('Your department');
    expect(questions[3].title).toBe('Phone number');
    expect(questions[4].title).toBe('Email address');
    expect(questions[5].title).toBe('How would you like your appointment confirmation to be sent?');
    expect(questions[6].title).toBe('How would you prefer to attend the event?');
    expect(questions[7].title).toBe('Purpose of joining this event?');
    expect(questions[8].title).toBe('Any additional questions for the organizer?');
    expect(questions[9].title).toBe('May we contact you to participate in discussions that will help us better organize future events?');
  });

  test('each choice question should have the correct items', () => {
    const questions = surveyModel.getQuestions();
    expect(questions[5].items).toEqual(["Email", "Text", "Phone call"]);
    expect(questions[6].items).toEqual([
      "Join remotely online",
      "Join in person"
    ]);
    expect(questions[7].items).toEqual([
         "Get better understanding of latest status from team",
         "Share status progress to keep team updated",
         "Brainstorm new direction for project",
         "Other"
    ]);

    surveyModel.
  });  
});