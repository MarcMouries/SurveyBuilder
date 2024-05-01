import { SurveyModel } from '../SurveyModel';
import { Question } from '../Question';

export class TextQuizParser {
  private text: string;
  private surveyTitle: string;
  private surveyDescription: string;

  constructor(text: string) {
    this.text = text;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    this.surveyTitle = lines.shift()?.trim() || "Default Survey Title";
    this.surveyDescription = (lines.length > 0 && !/^\d+\./.test(lines[0])) ? lines.shift()?.trim() || "" : "";
  }

  parse(): SurveyModel {
    const questions: Question[] = [];
    const lines = this.text.split('\n');
    let currentQuestion: Question | null = null;

    lines.forEach((line) => {
      if (/^\d+\./.test(line)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = this.parseQuestion(line);
      } else if (currentQuestion && line.trim()) {
        this.parseItem(currentQuestion, line);
      }
    });

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    if (questions.length === 0) {
      throw new Error("No valid questions found in the input text.");
    }

    return new SurveyModel({
      surveyTitle: this.surveyTitle,
      surveyDescription: this.surveyDescription,
      questions: questions
    });
  }

  private parseQuestion(line: string): Question {
    const title = line.substring(line.indexOf('.') + 1).trim();
    if (!title) {
      throw new Error("Question title is missing or improperly formatted.");
    }
    return new Question({
      type: "single-choice",
      name: `question_${Question.currentQuestionNumber + 1}`,
      title: title
    });
  }

  private parseItem(question: Question, line: string): void {
    if (!line.match(/^[A-Z]\.\s+/)) {
      throw new Error(`Line ${line} for Item is improperly formatted, expected a prefix like 'A. ', 'B. ' etc.`);
    }
    const item = line.replace(/^[A-Z]\.\s*/, '');
    question.addItem(item);
  }
}
