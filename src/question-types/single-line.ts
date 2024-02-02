import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { QuestionType } from "./QuestionType.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";

export class SingleLineTextQuestion extends QuestionType {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.name = question.name;
        inputField.required = question.isRequired;
        inputField.className = 'single-line-text-input';
        this.questionDiv.appendChild(inputField);

        // Event listener for response change
        inputField.addEventListener('input', () => {
            const response: IQuestionResponse = {
                questionName: question.name,
                response: inputField.value
            };
            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
        });
    }
}