import type { IQuestion } from "../IQuestion.ts";

import { QuestionComponent } from "./QuestionComponent.ts";

/**
 * An abstract base class for creating choice-based question elements. 
 * It cannot be instantiated directly but provides common functionality 
 * for its subclasses to generate input elements and their associated labels.
 */
export abstract class AbstractChoice extends QuestionComponent {
    protected items: string[] = [];

    constructor(question: IQuestion, index: number) {
        super(question, index);
        this.items = question.items;
        this.renderChoices();
    }

    protected abstract renderChoices(): void;

    protected createLabel(forId: string, text: string) {
        const label = document.createElement('label');
        label.htmlFor = forId;
        label.textContent = text;
        label.classList.add('choice-label');
        return label;
    }
}