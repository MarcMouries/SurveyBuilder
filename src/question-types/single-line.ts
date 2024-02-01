import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import { QuestionType } from "./QuestionType.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";

export class SingleLineTextQuestion extends QuestionType {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);
        //this.questionDiv.className += ' single-line-question';

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
            const answerEvent = new CustomEvent<IQuestionResponse>(
                'answerSelected', { detail: response });
            this.questionDiv.dispatchEvent(answerEvent);
        });
    }
}