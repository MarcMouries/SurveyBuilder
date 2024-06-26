import { AbstractChoice } from "./AbstractChoice";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent";
import type { IQuestion } from "../IQuestion";
import type { IQuestionResponse } from "./IQuestionResponse";

/**
 * Allows users to select multiple options from a list of checkboxes. 
 * This is suitable for questions that can have more than one answer.
 * Example Question: "Which of the following fruits do you like? (Select all that apply)"
 * [] Apples     [] Bananas
 * [] Cherries   [] Dates
 * [] Other
 */
export class MultiChoice extends AbstractChoice {
    constructor(question: IQuestion, index: number) {
        super(question, index);
    }

    protected renderChoices() {
        const choiceContainer = document.createElement('div');
        choiceContainer.className = 'items';

        this.items.forEach((item, i) => {
            this.appendChoice(item, i, choiceContainer);
        });

        // Include 'Other' option if specified
        if (this.question.includeOtherOption) {
            this.appendOtherOption(choiceContainer);
        }

        this.questionDiv.appendChild(choiceContainer);

        // Add change event listener for collecting responses
        choiceContainer.addEventListener('change', this.handleResponseChange.bind(this));
    }

    private appendChoice(item: string, index: number, container: HTMLElement) {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'item';

        const checkboxId = `${this.question.name}-${index}`;
        const checkbox = this.createCheckbox(item, this.question.name, checkboxId);
        const label = this.createLabel(checkboxId, item);

        wrapperDiv.appendChild(checkbox);
        wrapperDiv.appendChild(label);
        container.appendChild(wrapperDiv);
    }

    private appendOtherOption(container: HTMLElement) {
        const otherWrapperDiv = document.createElement('div');
        otherWrapperDiv.className = 'item other-item';

        const checkboxId = `${this.question.name}-other`;
        const checkbox = this.createCheckbox("Other", this.question.name, checkboxId);
        checkbox.dataset.other = "true"; // Mark this checkbox for special handling

        const label = this.createLabel(checkboxId, "Other");
        label.htmlFor = checkboxId; // Ensure clicking the label toggles the checkbox

        // Input for specifying 'Other'
        const otherInput = document.createElement('input');
        otherInput.type = 'text';
        otherInput.id = `${checkboxId}-specify`;
        otherInput.name = `${this.question.name}-other-specify`;
        otherInput.placeholder = "Specify";
        otherInput.className = 'other-specify-input';

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
            const checkbox = document.getElementById(`${this.question.name}-${i}`) as HTMLInputElement;
            return checkbox && checkbox.checked;
        }).map((item, i) => ({ value: item }));

        // Special handling for "Other" input
        const otherCheckbox = document.getElementById(`${this.question.name}-other`) as HTMLInputElement;
        const otherInput = document.getElementById(`${this.question.name}-other-specify`) as HTMLInputElement;
        if (otherCheckbox && otherCheckbox.checked && otherInput.value.trim() !== '') {
            selectedOptions.push({ value: otherInput.value.trim() });
        }

        const response: IQuestionResponse = {
            questionName: this.question.name,
            response: selectedOptions
        };

        this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
    }

}