import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";
import { QuestionType } from "./QuestionType.ts";
import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
/**
 * Represents a question that collects detailed information based on a previous question's answer.
 */
export class FollowUpDetailQuestion extends QuestionType {
    private detailQuestions: Array<{label: string, placeholder: string}>;

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);

        const dependentResponse = surveyBuilder.responses[question.dependentQuestionName];
        if (dependentResponse) {
            this.question.title = `Provide the following information about your ${question.title} ${dependentResponse}:`;
        }
        this.detailQuestions = question.detailQuestions || [];
        this.renderDetailQuestions();
    }

    private renderDetailQuestions(): void {
        this.detailQuestions.forEach(({ label, placeholder }): void => {
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'input-group';

            const labelElement = document.createElement('label');
            labelElement.textContent = label;
            inputWrapper.appendChild(labelElement);

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.addEventListener('input', this.handleInputChange.bind(this, label));
            inputWrapper.appendChild(input);

            this.questionDiv.appendChild(inputWrapper);
        });
    }

    private handleInputChange(label: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        const response: IQuestionResponse = {
            questionName: this.question.name,
            response: { [label]: target.value }
        };
        // Here you can aggregate responses or validate inputs as needed
        console.log("Input Change for:", label, ", Value:", target.value);

        this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));

    }
}
