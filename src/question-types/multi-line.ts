import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { QuestionType } from "./QuestionType.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";


export class MultiLineTextQuestion extends QuestionType {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);

        const textArea = document.createElement('textarea');
        textArea.name = question.name;
        textArea.required = question.isRequired ?? false;

        textArea.className = 'multi-line-text-input';
        textArea.placeholder = 'Enter your comments here...';
        this.questionDiv.appendChild(textArea);

        // Event listener for input change
        textArea.addEventListener('input', () => {
            
            const response: IQuestionResponse = {
                questionName: question.name,
                response: textArea.value
            };

            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
        });
    }
}