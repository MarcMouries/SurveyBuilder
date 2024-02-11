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
            this.appendChoice(item, i, choiceContainer);
        });

        // Include 'Other' option if specified
        if (this.questionData.includeOtherOption) {
            this.appendOtherOption(choiceContainer);
        }

        this.questionDiv.appendChild(choiceContainer);

        // Add change event listener for collecting responses
        choiceContainer.addEventListener('change', this.handleResponseChange.bind(this));

    }

    private appendChoice(item: string, index: number, container: HTMLElement) {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'item';

        const checkboxId = `${this.questionData.name}-${index}`;
        const checkbox = this.createCheckbox(item, this.questionData.name, checkboxId);
        const label = this.createLabel(checkboxId, item);

        wrapperDiv.appendChild(checkbox);
        wrapperDiv.appendChild(label);
        container.appendChild(wrapperDiv);
    }

    private appendOtherOption(container: HTMLElement) {
        const otherWrapperDiv = document.createElement('div');
        otherWrapperDiv.className = 'item other-item';

        const checkboxId = `${this.questionData.name}-other`;
        const checkbox = this.createCheckbox("Other", this.questionData.name, checkboxId);
        checkbox.dataset.other = "true"; // Mark this checkbox for special handling

        const label = this.createLabel(checkboxId, "Other");
        label.htmlFor = checkboxId; // Ensure clicking the label toggles the checkbox

        // Input for specifying 'Other'
        const otherInput = document.createElement('input');
        otherInput.type = 'text';
        otherInput.id = `${checkboxId}-specify`;
        otherInput.name = `${this.questionData.name}-other-specify`;
        otherInput.placeholder = "Specify";
        otherInput.className = 'other-specify-input hidden'; // Initially hidden

        // Toggle visibility based on checkbox
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                otherInput.style.display = 'block'; 
                label.style.color = 'transparent'; 
                otherInput.focus();
            } else {
                otherInput.style.display = 'none';
                label.style.color = ''; 
                otherInput.value = '';
            }
        });
        

        otherWrapperDiv.appendChild(checkbox);
        otherWrapperDiv.appendChild(label);
        otherWrapperDiv.appendChild(otherInput);
        container.appendChild(otherWrapperDiv);
    }

     
    handleResponseChange() {
        const selectedOptions = this.items.filter((_, i) => {
            const checkbox = document.getElementById(`${this.questionData.name}-${i}`) as HTMLInputElement;
            return checkbox && checkbox.checked;
        }).map((item, i) => ({ value: item }));

        // Special handling for "Other" input
        const otherInput = document.getElementById(`${this.questionData.name}-other-specify`) as HTMLInputElement;
        if (otherInput && otherInput.style.display !== 'none') {
            selectedOptions.push({ value: otherInput.value });
        }

        const response: IQuestionResponse = {
            questionName: this.questionData.name,
            response: selectedOptions
        };

        this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
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
