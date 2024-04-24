import type { IQuestion } from "../IQuestion.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { QuestionComponent } from "./QuestionComponent.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";


export class MultiLineTextQuestion extends QuestionComponent {

    constructor(question: IQuestion, index: number) {
        super(question, index);

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