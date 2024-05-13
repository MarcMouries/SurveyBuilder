import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";
import { QuestionComponent } from "./QuestionComponent.ts";
import type { IQuestion } from "../IQuestion.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
/**
 * Represents a question that collects detailed information based on a previous question's answer.
 */
export class FollowUpQuestion extends QuestionComponent {
    private detailQuestions: IQuestion[];
    private detailResponses: { [key: string]: string } = {};

    constructor(question: IQuestion, index: number) {
        super(question, index);
        this.detailQuestions = question.detailQuestions || [];
        this.renderDetailQuestions();
    }

    private renderDetailQuestions(): void {
        this.detailQuestions.forEach((detailQuestion): void => {
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'input-group';

            const labelElement = document.createElement('label');
            labelElement.textContent = detailQuestion.title;
            inputWrapper.appendChild(labelElement);

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = detailQuestion.placeholder ?? '';

            input.addEventListener('input', this.handleInputChange.bind(this, detailQuestion.name));
            inputWrapper.appendChild(input);

            this.questionDiv.appendChild(inputWrapper);
        });
    }

    private handleInputChange(name: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        this.detailResponses[name] = target.value;

        const response: IQuestionResponse = {
            questionName: this.question.name,
            response: this.detailResponses
        };
        console.log("Aggregated Input Change:", this.detailResponses);
        this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
    }
}
