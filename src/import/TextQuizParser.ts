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
        const isMultiChoice = /Select all that apply/.test(line);
        let title = line.substring(line.indexOf('.') + 1).trim();
        let isRequired = false;
        if (title.endsWith('*')) {
          title = title.slice(0, -1).trim();  // Remove the asterisk and trim trailing spaces
          isRequired = true;
        }
        currentQuestion = new Question({
          type: isMultiChoice ? "multi-choice" : "single-choice",
          name: `question_${questions.length + 1}`,
          title: title,
          items: [],
          isRequired: isRequired
        });
      } else if (currentQuestion) {
        this.processLine(currentQuestion, line);
      }
    });

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return new SurveyModel({
      surveyTitle: this.surveyTitle,
      surveyDescription: this.surveyDescription,
      questions: questions
    });
  }

  private processLine(currentQuestion: Question, line: string): void {
    if (/^\(/.test(line)) {
      currentQuestion.description += ` ${line.trim()}`;
    } else if (line.match(/^[A-Z]\.\s+/)) {
      const item = line.replace(/^[A-Z]\.\s*/, '');
      currentQuestion.addItem(item);
    } else if (line.trim()) {
      currentQuestion.description += ` ${line.trim()}`;
    }
  }
}
