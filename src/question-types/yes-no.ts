import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import { QuestionType } from "./QuestionType.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";

export class YesNoQuestion extends QuestionType {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);
        //this.questionDiv.className += ' yes-no-question';

        // Create the switch-field container
        const yesNoField = document.createElement('div');
        yesNoField.className = 'yes-no';

        // Create Yes radio button
        const yesRadio = this.createRadio('Yes', question.name, `${question.name}-yes`);
        const yesLabel = this.createLabel(`${question.name}-yes`, 'Yes');
        yesNoField.appendChild(yesRadio);
        yesNoField.appendChild(yesLabel);

        // Create No radio button
        const noRadio = this.createRadio('No', question.name, `${question.name}-no`);
        const noLabel = this.createLabel(`${question.name}-no`, 'No');
        yesNoField.appendChild(noRadio);
        yesNoField.appendChild(noLabel);

        this.questionDiv.appendChild(yesNoField);

        // Event listener for response change
        yesNoField.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            const response: IQuestionResponse = {
                questionName: question.name,
                response: target.value
            };
            const answerEvent = new CustomEvent<IQuestionResponse>(
                'answerSelected', { detail: response });
            this.questionDiv.dispatchEvent(answerEvent);
        });
    }


    createRadio(value: string, name: string, id: string) {
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.id = id;
        radioInput.name = name;
        radioInput.value = value;
        return radioInput;
    }

    createLabel(forId: string, text: string) {
        const label = document.createElement('label');
        label.htmlFor = forId;
        label.textContent = text;
        return label;
    }
}
