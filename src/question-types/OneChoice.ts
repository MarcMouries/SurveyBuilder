import { AbstractChoice } from "./AbstractChoice.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";
import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";

/**
 * OneChoice: Represents a question that requires users to select one, and only one, option from a list of options.
 * 
 * It is represented as a list of radio buttons. 
 * It is ideal for questions where a single choice is necessary.
 * Example: "What is your favorite season?" 
 * ◯ Spring  
 * ◯ Summer
 * ◯ Fall 
 * ◯ Winter
 **/
export class OneChoice extends AbstractChoice {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);
    }

    protected renderChoices() {
        const choiceContainer = document.createElement('div');
        choiceContainer.className = 'items';

        if (this.items) {
            this.items.forEach((item, i) => {
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'item';

                const radioId = `${this.question.name}-${i}`;
                const radio = this.createRadio(item, this.question.name, radioId);
                const label = this.createLabel(radioId, item);

                wrapperDiv.appendChild(radio);
                wrapperDiv.appendChild(label);
                choiceContainer.appendChild(wrapperDiv);
            });
        } else {
            console.warn("Items are undefined for question:", this.question.name);
        }

        this.questionDiv.appendChild(choiceContainer);

        // Event listener for response change
        choiceContainer.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            const response: IQuestionResponse = {
                questionName: this.question.name,
                response: target.value
            };
            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
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
}