import type { IQuestion } from "../IQuestion.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { QuestionComponent } from "./QuestionComponent.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";

export class SingleLineTextQuestion extends QuestionComponent {

    constructor(question: IQuestion, index: number) {
        super(question, index);

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.name = question.name;
        inputField.required = question.isRequired ?? false;
        inputField.className = 'single-line-text-input';
        inputField.placeholder = question.placeholder ?? '';

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