import { createQuestionTitle } from './common';
import type { IQuestion } from "../IQuestion";
import type { IQuestionComponent } from "../component/IQuestionComponent";
import type { IQuestionResponse } from "./IQuestionResponse";
import { EventEmitter} from '../EventEmitter'
import { ANSWER_SELECTED } from '../EventTypes';


export abstract class QuestionComponent implements IQuestionComponent {
    protected questionDiv: HTMLDivElement;
    public question: IQuestion;

    constructor(question: IQuestion, index: number) {
        this.question = question;
        this.questionDiv = document.createElement('div');
        this.questionDiv.className = `question ${question.type}-question`;
        this.questionDiv.dataset.index = index.toString();
        this.questionDiv.dataset.questionName = question.name;

        // Create and append the question title
        const titleElement = createQuestionTitle(question.title);
        titleElement.classList.add('question-title');
        this.questionDiv.appendChild(titleElement);

        this.setupResponseListener();
    }

    setTitle(newTitle: string): void {
        this.question.title = newTitle;

        // Find the title element within this question component's div and update its text content
        const titleElement = this.questionDiv.querySelector('.question-title');
        if (titleElement) {
            titleElement.textContent = newTitle;
        } else {
            console.error('Title element not found for question:', this.question.name);
        }
    }

    protected setupResponseListener() {
        this.questionDiv.addEventListener("answerSelected", (event: Event) => {
            const responseEvent = event as CustomEvent<IQuestionResponse>;
            EventEmitter.emit(ANSWER_SELECTED, responseEvent.detail);
        });
    }



    public show() {
        this.questionDiv.style.display = 'block';
    }

    public hide() {
        this.questionDiv.style.display = 'none';
    }

    public getQuestionDiv () : HTMLDivElement {
        return this.questionDiv;
    }

    protected createLabel(forId: string, text: string) {
        const label = document.createElement('label');
        label.htmlFor = forId;
        label.textContent = text;
        label.classList.add('choice-label');
        return label;
    }

    protected createRadio(value: string, name: string, id: string) {
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.id = id;
        radioInput.name = name;
        radioInput.value = value;
        return radioInput;
    }

    protected createCheckbox(value: string, name: string, id: string) {
        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.id = id;
        checkboxInput.name = name;
        checkboxInput.value = value;
        return checkboxInput;
    }
}
