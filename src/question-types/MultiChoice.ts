import { AbstractChoice } from "./AbstractChoice.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";
import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";

/**
 * Allows users to select multiple options from a list of checkboxes. 
 * This is suitable for questions that can have more than one answer.
 * Example Question: "Which of the following fruits do you like? (Select all that apply)"
 * [] Apples     [] Bananas
 * [] Cherries   [] Dates
 */
export class MultiChoice extends AbstractChoice {


    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);
    }

    protected renderChoices() {
        const choiceContainer = document.createElement('div');
        choiceContainer.className = 'items';

        this.items.forEach((item, i) => {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'item';

            const checkboxId = `${this.question.name}-${i}`;
            const checkbox = this.createCheckbox(item, this.question.name, checkboxId);
            const label = this.createLabel(checkboxId, item);

            wrapperDiv.appendChild(checkbox);
            wrapperDiv.appendChild(label);
            choiceContainer.appendChild(wrapperDiv);
        });

        this.questionDiv.appendChild(choiceContainer);

        // Event listener for response change
        choiceContainer.addEventListener('change', () => {
            const selectedOptions = this.items.filter((_, i) => {
                const checkbox = document.getElementById(`${this.question.name}-${i}`) as HTMLInputElement;
                return checkbox && checkbox.checked;
            }).map((item, i) => {
                return { value: item, index: i };
            });

            const response: IQuestionResponse = {
                questionName: this.question.name,
                response: selectedOptions
            };

            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
        });
    }

    createCheckbox(value: string, name: string, id: string) {
        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.id = id;
        checkboxInput.name = name;
        checkboxInput.value = value;
        return checkboxInput;
    }
}
